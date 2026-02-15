import { NextResponse } from 'next/server';
import { findOrCreateUser } from '@/lib/db/users';
import { createGame, createRounds } from '@/lib/db/games';
import { getCurrentPrice, getKlines } from '@/lib/binance';
import { MODE_CONFIG, type GameMode, getBinanceInterval, pickRoundAssets } from '@/lib/utils/scoring';

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => null);

    // Validate request
    if (!body?.username || !body?.mode) {
      return NextResponse.json(
        { error: 'Missing username or mode' },
        { status: 400 }
      );
    }

    const { username, mode } = body;

    // Validate mode
    if (!MODE_CONFIG[mode as GameMode]) {
      return NextResponse.json(
        { error: 'Invalid mode. Must be FLASH, SPEED, or STANDARD' },
        { status: 400 }
      );
    }

    const modeConfig = MODE_CONFIG[mode as GameMode];

    // Find or create user
    const user = await findOrCreateUser(username);

    // Create game
    const gameId = await createGame(user.id, mode);

    const assets = pickRoundAssets(mode as GameMode);
    const timeframe = modeConfig.timeframe;
    const interval = getBinanceInterval(timeframe);

    const buildRound = async (asset: string, roundNumber: number) => {
      const maxAttempts = 3;
      let lastError: unknown = null;

      for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
        try {
          const [currentPrice, klines] = await Promise.all([
            getCurrentPrice(asset),
            getKlines(asset, interval, 30)
          ]);

          return {
            roundData: {
              roundNumber,
              asset,
              timeframe,
              startPrice: currentPrice,
              // placeholder, later overwritten by /api/game/predict
              aiPrediction: 'UP' as const,
              aiReasoning: null,
              aiConfidence: null
            },
            chartPoints: klines.map(k => parseFloat(k.close)),
            chartCandles: klines.map((k) => ({
              t: k.openTime,
              o: parseFloat(k.open),
              h: parseFloat(k.high),
              l: parseFloat(k.low),
              c: parseFloat(k.close),
              v: parseFloat(k.volume),
            }))
          };
        } catch (error) {
          lastError = error;
          if (attempt < maxAttempts) {
            await new Promise((resolve) => setTimeout(resolve, 250 * attempt));
          }
        }
      }

      throw lastError ?? new Error("Unknown market data error");
    };

    const fallbackPool = [...modeConfig.assetPool].filter((a) => !assets.includes(a));
    const candidateAssets = [...assets, ...fallbackPool];
    const roundBuild: Array<{
      roundData: {
        roundNumber: number;
        asset: string;
        timeframe: string;
        startPrice: number;
        aiPrediction: 'UP' | 'DOWN';
        aiReasoning: string | null;
        aiConfidence: number | null;
      };
      chartPoints: number[];
      chartCandles: Array<{
        t: number;
        o: number;
        h: number;
        l: number;
        c: number;
        v: number;
      }>;
    }> = [];

    for (const asset of candidateAssets) {
      if (roundBuild.length >= modeConfig.roundCount) break;
      try {
        const built = await buildRound(asset, roundBuild.length + 1);
        roundBuild.push(built);
      } catch (error) {
        console.error(`Error preparing round ${roundBuild.length + 1} with asset ${asset}:`, error);
      }
    }

    if (roundBuild.length < modeConfig.roundCount) {
      return NextResponse.json(
        { error: "Market data provider is temporarily unavailable. Please retry." },
        { status: 503 }
      );
    }

    const roundsData = roundBuild.map(r => r.roundData);

    // Save rounds to database
    const rounds = await createRounds(gameId, roundsData);

    // Return response (don't expose AI predictions to client)
    const response = {
      game_id: gameId,
      mode,
      rounds: rounds.map(r => ({
        round_id: r.id,
        asset: r.asset,
        timeframe: r.timeframe,
        current_price: r.start_price,
        chart_points: roundBuild.find((b) => b.roundData.roundNumber === r.round_number)?.chartPoints || [],
        chart_candles: roundBuild.find((b) => b.roundData.roundNumber === r.round_number)?.chartCandles || []
      }))
    };

    return NextResponse.json(response);
  } catch (error: any) {
    console.error('Error starting game:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to start game' },
      { status: 500 }
    );
  }
}
