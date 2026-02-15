import { NextResponse } from 'next/server';
import { getGame, getRounds, completeRound, completeGame } from '@/lib/db/games';
import { updateUserStats } from '@/lib/db/users';
import { getPriceAtTime } from '@/lib/binance';
import { determineRoundWinner, calculatePoints, getPersonalSettlementWindow, type GameMode } from '@/lib/utils/scoring';

function parseDbTimestamp(value: string): number {
  // Supabase timestamp without timezone is stored as UTC in this project.
  // Force UTC parse so client local-time rendering is correct.
  if (!value) return Date.now();
  const normalized = /[zZ]|[+-]\d{2}:?\d{2}$/.test(value) ? value : `${value}Z`;
  return new Date(normalized).getTime();
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const gameId = searchParams.get('game_id');

    if (!gameId) {
      return NextResponse.json(
        { error: 'Missing game_id' },
        { status: 400 }
      );
    }

    const game = await getGame(gameId);

    if (!game) {
      return NextResponse.json(
        { error: 'Game not found' },
        { status: 404 }
      );
    }

    const rounds = await getRounds(gameId);

    if (rounds.length === 0) {
      return NextResponse.json(
        { error: 'No rounds found for this game' },
        { status: 404 }
      );
    }

    let userScore = 0;
    let aiScore = 0;
    const processedRounds: any[] = [];
    let allRoundsComplete = true;

    for (const round of rounds) {
      if (!round.user_prediction) {
        allRoundsComplete = false;
        processedRounds.push({
          round_id: round.id,
          round_number: round.round_number,
          asset: round.asset,
          timeframe: round.timeframe,
          start_price: round.start_price,
          end_price: null,
          user_prediction: null,
          ai_prediction: round.ai_prediction,
          ai_confidence: round.ai_confidence,
          ai_reasoning: round.ai_reasoning,
          result: 'pending_pick',
        });
        continue;
      }

      const lockTimeRaw = round.created_at;
      const lockTimeMs = parseDbTimestamp(lockTimeRaw);
      const { settleTargetMs, settleBucketMs, settleAtMs } = getPersonalSettlementWindow(lockTimeMs, round.timeframe);

      if (round.end_price !== null && round.result !== null) {
        processedRounds.push({
          round_id: round.id,
          round_number: round.round_number,
          asset: round.asset,
          timeframe: round.timeframe,
          start_price: round.start_price,
          end_price: round.end_price,
          user_prediction: round.user_prediction,
          ai_prediction: round.ai_prediction,
          ai_confidence: round.ai_confidence,
          ai_reasoning: round.ai_reasoning,
          result: round.result,
          evaluation_candle: {
            open_at: new Date(lockTimeMs).toISOString(),
            close_at: new Date(settleAtMs).toISOString(),
            target_at: new Date(settleTargetMs).toISOString(),
            bucket_ms: settleBucketMs,
          },
        });

        if (round.result === 'user_win') userScore++;
        else if (round.result === 'ai_win') aiScore++;
        continue;
      }

      const now = Date.now();
      if (now < settleAtMs) {
        allRoundsComplete = false;
        processedRounds.push({
          round_id: round.id,
          round_number: round.round_number,
          asset: round.asset,
          timeframe: round.timeframe,
          start_price: round.start_price,
          end_price: null,
          user_prediction: round.user_prediction,
          ai_prediction: round.ai_prediction,
          ai_confidence: round.ai_confidence,
          ai_reasoning: round.ai_reasoning,
          result: 'pending',
          time_remaining: Math.max(0, Math.floor((settleAtMs - now) / 1000)),
          evaluation_candle: {
            open_at: new Date(lockTimeMs).toISOString(),
            close_at: new Date(settleAtMs).toISOString(),
            target_at: new Date(settleTargetMs).toISOString(),
            bucket_ms: settleBucketMs,
          },
        });
        continue;
      }

      try {
        const endPrice = await getPriceAtTime(round.asset, settleAtMs);
        const startPrice = round.start_price;

        const result = determineRoundWinner(
          startPrice,
          endPrice,
          round.user_prediction as 'UP' | 'DOWN',
          round.ai_prediction as 'UP' | 'DOWN'
        );

        await completeRound(round.id, endPrice, result, startPrice);

        processedRounds.push({
          round_id: round.id,
          round_number: round.round_number,
          asset: round.asset,
          timeframe: round.timeframe,
          start_price: startPrice,
          end_price: endPrice,
          user_prediction: round.user_prediction,
          ai_prediction: round.ai_prediction,
          ai_confidence: round.ai_confidence,
          ai_reasoning: round.ai_reasoning,
          result,
          evaluation_candle: {
            open_at: new Date(lockTimeMs).toISOString(),
            close_at: new Date(settleAtMs).toISOString(),
            target_at: new Date(settleTargetMs).toISOString(),
            bucket_ms: settleBucketMs,
          },
        });

        if (result === 'user_win') userScore++;
        else if (result === 'ai_win') aiScore++;
      } catch (error) {
        console.error(`Error processing round ${round.id}:`, error);
        allRoundsComplete = false;
        processedRounds.push({
          round_id: round.id,
          round_number: round.round_number,
          asset: round.asset,
          timeframe: round.timeframe,
          start_price: round.start_price,
          end_price: null,
          user_prediction: round.user_prediction,
          ai_prediction: round.ai_prediction,
          ai_confidence: round.ai_confidence,
          ai_reasoning: round.ai_reasoning,
          result: 'error',
          error: 'Failed to fetch candle close price',
        });
      }
    }

    let pointsEarned = 0;
    let status: 'pending' | 'completed' = 'pending';

    if (allRoundsComplete && game.status !== 'completed') {
      pointsEarned = calculatePoints(game.mode as GameMode, userScore, aiScore);

      await completeGame(gameId, userScore, aiScore, pointsEarned);

      await updateUserStats(game.user_id, {
        userScore,
        aiScore,
        pointsEarned,
      });

      status = 'completed';
    } else if (game.status === 'completed') {
      status = 'completed';
      pointsEarned = game.points_earned;
    }

    return NextResponse.json({
      game_id: gameId,
      status,
      user_score: userScore,
      ai_score: aiScore,
      points_earned: pointsEarned,
      rounds: processedRounds,
    });
  } catch (error: any) {
    console.error('Error getting game result:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to get game result' },
      { status: 500 }
    );
  }
}
