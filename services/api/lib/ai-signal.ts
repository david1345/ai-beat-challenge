import { getBinanceInterval } from '@/lib/utils/scoring';
import { getKlines } from '@/lib/binance';

export interface SignalPrediction {
  prediction: 'UP' | 'DOWN';
  confidence: number;
  reasoning: string;
  signalAt: string;
  version: string;
}

interface IndicatorPack {
  close: number;
  ema20: number;
  ema50: number;
  rsi14: number;
  atr14pct: number;
  momentum10pct: number;
  volumeRatio: number;
}

interface CacheEntry {
  expiresAt: number;
  value: SignalPrediction;
}

const signalCache = new Map<string, CacheEntry>();
const SIGNAL_VERSION = 'signal-v1';

function bucketSecondsForTimeframe(timeframe: string): number {
  if (timeframe === '1m') return 2;
  if (timeframe === '3m') return 3;
  return 5;
}

function cacheKey(asset: string, timeframe: string, atMs: number): string {
  const bucketSec = bucketSecondsForTimeframe(timeframe);
  const bucketMs = bucketSec * 1000;
  const bucketStart = Math.floor(atMs / bucketMs) * bucketMs;
  return `${asset}:${timeframe}:${bucketStart}`;
}

function toNum(v: string): number {
  const n = parseFloat(v);
  return Number.isFinite(n) ? n : 0;
}

function ema(values: number[], period: number): number {
  if (values.length === 0) return 0;
  const k = 2 / (period + 1);
  let out = values[0];
  for (let i = 1; i < values.length; i++) {
    out = values[i] * k + out * (1 - k);
  }
  return out;
}

function rsi(values: number[], period = 14): number {
  if (values.length < period + 1) return 50;

  let gain = 0;
  let loss = 0;
  for (let i = values.length - period; i < values.length; i++) {
    const diff = values[i] - values[i - 1];
    if (diff > 0) gain += diff;
    else loss -= diff;
  }

  if (loss === 0 && gain === 0) return 50;
  if (loss === 0) return 80;
  const rs = gain / loss;
  return 100 - 100 / (1 + rs);
}

function atrPct(highs: number[], lows: number[], closes: number[], period = 14): number {
  if (closes.length < period + 1) return 0;

  const trs: number[] = [];
  for (let i = 1; i < closes.length; i++) {
    const h = highs[i];
    const l = lows[i];
    const prevClose = closes[i - 1];
    trs.push(Math.max(h - l, Math.abs(h - prevClose), Math.abs(l - prevClose)));
  }

  const slice = trs.slice(-period);
  const atr = slice.reduce((a, b) => a + b, 0) / slice.length;
  const lastClose = closes[closes.length - 1] || 1;
  return (atr / lastClose) * 100;
}

function computeIndicators(klines: Awaited<ReturnType<typeof getKlines>>): IndicatorPack {
  const closes = klines.map((k) => toNum(k.close));
  const highs = klines.map((k) => toNum(k.high));
  const lows = klines.map((k) => toNum(k.low));
  const vols = klines.map((k) => toNum(k.volume));

  const close = closes[closes.length - 1] || 0;
  const ema20 = ema(closes.slice(-30), 20);
  const ema50 = ema(closes.slice(-60), 50);
  const rsi14 = rsi(closes, 14);
  const atr14pct = atrPct(highs, lows, closes, 14);

  const first10 = closes[Math.max(0, closes.length - 11)] || close;
  const momentum10pct = first10 === 0 ? 0 : ((close - first10) / first10) * 100;

  const lastVol = vols[vols.length - 1] || 0;
  const base = vols.slice(-20);
  const avgVol = base.length ? base.reduce((a, b) => a + b, 0) / base.length : 1;
  const volumeRatio = avgVol <= 0 ? 1 : lastVol / avgVol;

  return { close, ema20, ema50, rsi14, atr14pct, momentum10pct, volumeRatio };
}

function buildSignal(ind: IndicatorPack): Omit<SignalPrediction, 'signalAt' | 'version'> {
  let score = 0;

  if (ind.close > ind.ema20) score += 1;
  else score -= 1;

  if (ind.close > ind.ema50) score += 1;
  else score -= 1;

  if (ind.momentum10pct > 0.08) score += 1;
  if (ind.momentum10pct < -0.08) score -= 1;

  if (ind.rsi14 >= 55 && ind.rsi14 <= 75) score += 1;
  if (ind.rsi14 <= 45 && ind.rsi14 >= 25) score -= 1;

  if (ind.volumeRatio >= 1.15) score += 0.5;
  if (ind.volumeRatio <= 0.85) score -= 0.5;

  const prediction: 'UP' | 'DOWN' = score >= 0 ? 'UP' : 'DOWN';
  const strength = Math.min(1, Math.abs(score) / 4.5);
  const confidence = Math.round(55 + strength * 35);

  const trendText = prediction === 'UP' ? 'short-term trend is upward' : 'short-term trend is downward';
  const emaText = `price vs EMA20/EMA50 is ${ind.close > ind.ema20 && ind.close > ind.ema50 ? 'supportive' : 'mixed'}`;
  const momentumText = `momentum ${ind.momentum10pct >= 0 ? 'positive' : 'negative'} (${ind.momentum10pct.toFixed(2)}%)`;
  const volatilityText = `ATR ${ind.atr14pct.toFixed(2)}%`;
  const volumeText = `volume ratio ${ind.volumeRatio.toFixed(2)}x`;

  const reasoning = `${trendText}; ${emaText}; ${momentumText}; RSI ${ind.rsi14.toFixed(1)}; ${volatilityText}; ${volumeText}.`;

  return { prediction, confidence, reasoning };
}

export async function getSignalPrediction(asset: string, timeframe: string, atMs = Date.now()): Promise<SignalPrediction> {
  const key = cacheKey(asset, timeframe, atMs);
  const now = Date.now();
  const hit = signalCache.get(key);
  if (hit && hit.expiresAt > now) {
    return hit.value;
  }

  const interval = getBinanceInterval(timeframe);
  const klines = await getKlines(asset, interval, 80);
  const indicators = computeIndicators(klines);
  const signal = buildSignal(indicators);

  const value: SignalPrediction = {
    ...signal,
    signalAt: new Date(atMs).toISOString(),
    version: SIGNAL_VERSION,
  };

  const ttlMs = bucketSecondsForTimeframe(timeframe) * 2000;
  signalCache.set(key, {
    value,
    expiresAt: now + ttlMs,
  });

  return value;
}
