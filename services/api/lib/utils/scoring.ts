/**
 * Mode configuration with points and timeframes
 */
export const MODE_CONFIG = {
  FLASH: {
    timeframe: '1m',
    timeInMs: 1 * 60 * 1000,
    roundCount: 3,
    assetPool: ['BTCUSDT', 'ETHUSDT', 'BNBUSDT', 'SOLUSDT', 'XRPUSDT', 'ADAUSDT', 'DOGEUSDT', 'LINKUSDT'],
    basePoints: 100
  },
  SPEED: {
    timeframe: '3m',
    timeInMs: 3 * 60 * 1000,
    roundCount: 3,
    assetPool: ['BTCUSDT', 'ETHUSDT', 'BNBUSDT', 'SOLUSDT', 'XRPUSDT', 'ADAUSDT', 'DOGEUSDT', 'AVAXUSDT'],
    basePoints: 150
  },
  STANDARD: {
    timeframe: '5m',
    timeInMs: 5 * 60 * 1000,
    roundCount: 3,
    assetPool: ['BTCUSDT', 'ETHUSDT', 'BNBUSDT', 'SOLUSDT', 'XRPUSDT', 'ADAUSDT', 'DOGEUSDT', 'TRXUSDT'],
    basePoints: 250
  }
} as const;

export type GameMode = keyof typeof MODE_CONFIG;

export function pickRoundAssets(mode: GameMode): string[] {
  const { assetPool, roundCount } = MODE_CONFIG[mode];
  const pool = [...assetPool];
  const picks: string[] = [];

  while (picks.length < roundCount && pool.length > 0) {
    const index = Math.floor(Math.random() * pool.length);
    const [asset] = pool.splice(index, 1);
    picks.push(asset);
  }

  return picks;
}

/**
 * Determine the winner of a round based on price movement
 */
export function determineRoundWinner(
  startPrice: number,
  endPrice: number,
  userPrediction: 'UP' | 'DOWN',
  aiPrediction: 'UP' | 'DOWN'
): 'user_win' | 'ai_win' | 'draw' {
  const priceChange = endPrice - startPrice;
  const actualDirection = priceChange > 0 ? 'UP' : priceChange < 0 ? 'DOWN' : 'FLAT';

  if (actualDirection === 'FLAT') {
    return 'draw';
  }

  const userCorrect = userPrediction === actualDirection;
  const aiCorrect = aiPrediction === actualDirection;

  if (userCorrect && !aiCorrect) {
    return 'user_win';
  } else if (!userCorrect && aiCorrect) {
    return 'ai_win';
  }

  return 'draw';
}

/**
 * Calculate points earned based on game result
 */
export function calculatePoints(
  mode: GameMode,
  userScore: number,
  aiScore: number
): number {
  const config = MODE_CONFIG[mode];
  const basePoints = config.basePoints;

  if (userScore <= aiScore) {
    return 0;
  }

  const scoreDiff = userScore - aiScore;
  const pointsEarned = Math.round(basePoints * (scoreDiff / 3));

  return Math.max(0, pointsEarned);
}

/**
 * Convert timeframe string to milliseconds
 */
export function timeframeToMs(timeframe: string): number {
  const match = timeframe.match(/^(\d+)(s|m|h)$/);

  if (!match) {
    throw new Error(`Invalid timeframe format: ${timeframe}`);
  }

  const value = parseInt(match[1], 10);
  const unit = match[2];

  switch (unit) {
    case 's':
      return value * 1000;
    case 'm':
      return value * 60 * 1000;
    case 'h':
      return value * 60 * 60 * 1000;
    default:
      throw new Error(`Invalid timeframe unit: ${unit}`);
  }
}

/**
 * Settlement bucket size by timeframe.
 * Small bucket keeps fair personal timers while allowing batched processing.
 */
export function getSettlementBucketMs(timeframe: string): number {
  const tfMs = timeframeToMs(timeframe);

  if (tfMs <= 60_000) return 2_000;   // 1m mode
  if (tfMs <= 180_000) return 3_000;  // 3m mode
  return 5_000;                       // 5m+ mode
}

/**
 * Personal timer settlement window based on lock timestamp.
 * Example: 1m timeframe, lock at 10:00:37 -> target 10:01:37,
 * bucketed settle may be 10:01:38 (2s bucket).
 */
export function getPersonalSettlementWindow(
  lockTimeMs: number,
  timeframe: string
): { settleTargetMs: number; settleBucketMs: number; settleAtMs: number } {
  const timeframeMs = timeframeToMs(timeframe);
  const settleTargetMs = lockTimeMs + timeframeMs;
  const settleBucketMs = getSettlementBucketMs(timeframe);
  const settleAtMs = Math.ceil(settleTargetMs / settleBucketMs) * settleBucketMs;

  return { settleTargetMs, settleBucketMs, settleAtMs };
}

/**
 * Get Binance interval string for a timeframe
 */
export function getBinanceInterval(timeframe: string): string {
  const match = timeframe.match(/^(\d+)(s|m|h)$/);

  if (!match) {
    throw new Error(`Invalid timeframe format: ${timeframe}`);
  }

  const value = match[1];
  const unit = match[2];

  switch (unit) {
    case 's':
      return '1m';
    case 'm': {
      const supportedMinuteIntervals = new Set(['1', '3', '5', '15', '30']);
      return supportedMinuteIntervals.has(value) ? `${value}m` : '1m';
    }
    case 'h':
      return `${value}h`;
    default:
      throw new Error(`Invalid timeframe unit: ${unit}`);
  }
}
