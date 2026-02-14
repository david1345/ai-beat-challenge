import { getRounds, updateRoundAI } from '@/lib/db/games';
import { getSignalPrediction } from '@/lib/ai-signal';

/**
 * Warm signal cache only (does not persist to DB).
 */
export async function warmAIPredictions(gameId: string): Promise<void> {
  const rounds = await getRounds(gameId);

  await Promise.all(
    rounds.map(async (round) => {
      await getSignalPrediction(round.asset, round.timeframe);
    })
  );
}

/**
 * Snapshot AI prediction at lock time and persist to round record.
 */
export async function snapshotAIPredictions(gameId: string, lockMs: number): Promise<void> {
  const rounds = await getRounds(gameId);

  await Promise.all(
    rounds.map(async (round) => {
      const ai = await getSignalPrediction(round.asset, round.timeframe, lockMs);

      const snapshotReasoning = `[${ai.version} @ ${ai.signalAt}] ${ai.reasoning}`;
      await updateRoundAI(round.id, ai.prediction, snapshotReasoning, ai.confidence);
    })
  );
}
