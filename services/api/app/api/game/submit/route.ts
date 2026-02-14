import { NextResponse } from 'next/server';
import { getCurrentPrice } from '@/lib/binance';
import { getGame, getRounds, setGameLockTime, updateRoundPrediction } from '@/lib/db/games';
import { snapshotAIPredictions } from '@/lib/ai-predictions';
import { getNextCandleWindow, timeframeToMs } from '@/lib/utils/scoring';

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => null);

    if (!body?.game_id || !Array.isArray(body?.predictions)) {
      return NextResponse.json(
        { error: 'Missing game_id or predictions' },
        { status: 400 }
      );
    }

    const { game_id, predictions } = body;

    const game = await getGame(game_id);

    if (!game) {
      return NextResponse.json(
        { error: 'Game not found' },
        { status: 404 }
      );
    }

    if (game.status !== 'active') {
      return NextResponse.json(
        { error: 'Game is not active' },
        { status: 400 }
      );
    }

    for (const pred of predictions) {
      if (!pred.round_id || !pred.direction) {
        return NextResponse.json(
          { error: 'Invalid prediction format' },
          { status: 400 }
        );
      }

      if (!['UP', 'DOWN'].includes(pred.direction)) {
        return NextResponse.json(
          { error: 'Direction must be UP or DOWN' },
          { status: 400 }
        );
      }
    }

    const rounds = await getRounds(game_id);
    const roundsById = new Map(rounds.map((r) => [r.id, r]));

    if (predictions.length !== rounds.length) {
      return NextResponse.json(
        { error: `You must submit predictions for all ${rounds.length} rounds` },
        { status: 400 }
      );
    }

    const lockMs = Date.now();
    const lockTime = new Date(lockMs).toISOString();

    // Freeze AI decision at the exact user lock timestamp for fairness and reproducibility.
    await snapshotAIPredictions(game_id, lockMs);


    const pricedPreds = await Promise.all(
      predictions.map(async (pred: { round_id: string; direction: 'UP' | 'DOWN' }) => {
        const round = roundsById.get(pred.round_id);
        if (!round) {
          throw new Error(`Round not found: ${pred.round_id}`);
        }

        const startPrice = await getCurrentPrice(round.asset);
        const { nextOpenMs, nextCloseMs } = getNextCandleWindow(lockMs, round.timeframe);

        return {
          ...pred,
          round,
          startPrice,
          nextOpenMs,
          nextCloseMs,
          timeframeMs: timeframeToMs(round.timeframe),
        };
      })
    );

    for (const pred of pricedPreds) {
      await updateRoundPrediction(pred.round_id, pred.direction, {
        startPrice: pred.startPrice,
        lockTimeIso: lockTime,
      });
    }

    await setGameLockTime(game_id, lockTime);

    const earliestSettle = Math.min(...pricedPreds.map((p) => p.nextCloseMs));
    const latestSettle = Math.max(...pricedPreds.map((p) => p.nextCloseMs));

    return NextResponse.json({
      status: 'accepted',
      lock_time: lockTime,
      settle_window: {
        earliest_at: new Date(earliestSettle).toISOString(),
        latest_at: new Date(latestSettle).toISOString(),
      },
      rounds: pricedPreds.map((p) => ({
        round_id: p.round_id,
        asset: p.round.asset,
        timeframe: p.round.timeframe,
        start_price: p.startPrice,
        evaluation_candle: {
          open_at: new Date(p.nextOpenMs).toISOString(),
          close_at: new Date(p.nextCloseMs).toISOString(),
          duration_ms: p.timeframeMs,
        },
      })),
    });
  } catch (error: any) {
    console.error('Error submitting predictions:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to submit predictions' },
      { status: 500 }
    );
  }
}
