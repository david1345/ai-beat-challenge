const BINANCE_API_BASE = process.env.BINANCE_API_BASE_URL || 'https://api.binance.com';
const BINANCE_API_BASE_CANDIDATES = [
  BINANCE_API_BASE,
  'https://api1.binance.com',
  'https://api2.binance.com',
  'https://api3.binance.com',
  'https://api4.binance.com',
];

const CRYPTOCOMPARE_API_BASE =
  process.env.CRYPTOCOMPARE_API_BASE_URL || 'https://min-api.cryptocompare.com';
const COINGECKO_API_BASE =
  process.env.COINGECKO_API_BASE_URL || 'https://api.coingecko.com/api/v3';
const BYBIT_API_BASE = process.env.BYBIT_API_BASE_URL || 'https://api.bybit.com';
const MEXC_API_BASE = process.env.MEXC_API_BASE_URL || 'https://api.mexc.com';
const YAHOO_API_BASE =
  process.env.YAHOO_API_BASE_URL || 'https://query1.finance.yahoo.com';

const CRYPTOCOMPARE_API_KEY = process.env.CRYPTOCOMPARE_API_KEY || '';
const COINGECKO_API_KEY =
  process.env.COINGECKO_API_KEY || process.env.COINGECKO_DEMO_API_KEY || '';

const KNOWN_QUOTES = ['USDT', 'USDC', 'BUSD', 'FDUSD', 'USD', 'BTC', 'ETH'];

const COINGECKO_IDS: Record<string, string> = {
  BTC: 'bitcoin',
  ETH: 'ethereum',
  BNB: 'binancecoin',
  SOL: 'solana',
  XRP: 'ripple',
  ADA: 'cardano',
  DOGE: 'dogecoin',
  LINK: 'chainlink',
  AVAX: 'avalanche-2',
  TRX: 'tron',
  MATIC: 'matic-network',
  LTC: 'litecoin',
  BCH: 'bitcoin-cash',
};

const YAHOO_SYMBOL_OVERRIDES: Record<string, string> = {
  XAUUSD: 'GC=F',
  XAGUSD: 'SI=F',
  WTICOUSD: 'CL=F',
  BCOUSD: 'BZ=F',
  NATGASUSD: 'NG=F',
};

export interface PriceData {
  symbol: string;
  price: string;
}

export interface KlineData {
  openTime: number;
  open: string;
  high: string;
  low: string;
  close: string;
  volume: string;
  closeTime: number;
}

function uniqueBases(bases: string[]) {
  return [...new Set(bases.map((b) => b.trim()).filter(Boolean))];
}

function splitSymbol(symbol: string): { base: string; quote: string } {
  for (const quote of KNOWN_QUOTES) {
    if (symbol.endsWith(quote) && symbol.length > quote.length) {
      return { base: symbol.slice(0, -quote.length), quote };
    }
  }
  return { base: symbol, quote: 'USDT' };
}

function intervalToMs(interval: string): number {
  const m = interval.match(/^(\d+)(m|h|d)$/);
  if (!m) throw new Error(`Unsupported interval: ${interval}`);
  const value = Number(m[1]);
  const unit = m[2];
  if (unit === 'm') return value * 60_000;
  if (unit === 'h') return value * 3_600_000;
  return value * 86_400_000;
}

function intervalToMinutes(interval: string): number {
  return Math.max(1, Math.round(intervalToMs(interval) / 60_000));
}

function resolveYahooSymbol(symbol: string): string {
  if (YAHOO_SYMBOL_OVERRIDES[symbol]) return YAHOO_SYMBOL_OVERRIDES[symbol];

  if (/^[A-Z]{1,6}$/.test(symbol)) {
    return symbol;
  }

  const { base } = splitSymbol(symbol);
  return `${base}-USD`;
}

function mapBybitInterval(interval: string): string {
  const minutes = intervalToMinutes(interval);
  const supported = ['1', '3', '5', '15', '30', '60', '120', '240', '360', '720'];
  const candidate = String(minutes);
  return supported.includes(candidate) ? candidate : '1';
}

function mapYahooInterval(interval: string): string {
  const minutes = intervalToMinutes(interval);
  if (minutes <= 1) return '1m';
  if (minutes <= 2) return '2m';
  if (minutes <= 5) return '5m';
  if (minutes <= 15) return '15m';
  if (minutes <= 30) return '30m';
  if (minutes <= 60) return '60m';
  return '1d';
}

function toKlinesFromFlatPrices(
  points: Array<[number, number]>,
  bucketMs: number,
): KlineData[] {
  if (points.length === 0) return [];

  const candles = new Map<
    number,
    { open: number; high: number; low: number; close: number; volume: number }
  >();

  for (const [ts, price] of points) {
    const bucket = Math.floor(ts / bucketMs) * bucketMs;
    const existing = candles.get(bucket);
    if (!existing) {
      candles.set(bucket, {
        open: price,
        high: price,
        low: price,
        close: price,
        volume: 0,
      });
      continue;
    }

    existing.high = Math.max(existing.high, price);
    existing.low = Math.min(existing.low, price);
    existing.close = price;
  }

  return [...candles.entries()]
    .sort((a, b) => a[0] - b[0])
    .map(([openTime, c]) => ({
      openTime,
      open: String(c.open),
      high: String(c.high),
      low: String(c.low),
      close: String(c.close),
      volume: String(c.volume),
      closeTime: openTime + bucketMs - 1,
    }));
}

async function httpGetJson<T>(
  base: string,
  path: string,
  params?: Record<string, string | number>,
  options?: { headers?: Record<string, string>; timeoutMs?: number },
): Promise<T> {
  const url = new URL(path, base);
  if (params) {
    for (const [k, v] of Object.entries(params)) {
      url.searchParams.set(k, String(v));
    }
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), options?.timeoutMs ?? 8000);

  try {
    const res = await fetch(url.toString(), {
      method: 'GET',
      headers: {
        accept: 'application/json',
        'user-agent': 'ai-beat-challenge/1.0',
        ...(options?.headers ?? {}),
      },
      signal: controller.signal,
    });

    if (!res.ok) {
      const body = await res.text().catch(() => '');
      throw new Error(`HTTP ${res.status} ${res.statusText} ${body.slice(0, 180)}`);
    }

    return (await res.json()) as T;
  } finally {
    clearTimeout(timeout);
  }
}

async function fetchFromAnyBinanceBase<T>(
  path: string,
  params: Record<string, string | number>,
): Promise<T> {
  const bases = uniqueBases(BINANCE_API_BASE_CANDIDATES);
  let lastError: unknown = null;

  for (const base of bases) {
    try {
      return await httpGetJson<T>(base, path, params, { timeoutMs: 7000 });
    } catch (error) {
      lastError = error;
    }
  }

  throw lastError ?? new Error(`Failed to fetch ${path}`);
}

async function withProviders<T>(
  label: string,
  handlers: Array<{ name: string; run: () => Promise<T> }>,
): Promise<T> {
  const errors: string[] = [];

  for (const h of handlers) {
    try {
      return await h.run();
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      errors.push(`${h.name}: ${message}`);
      console.warn(`[market:${label}] provider failed: ${h.name} - ${message}`);
    }
  }

  throw new Error(`All providers failed for ${label} | ${errors.join(' | ')}`);
}

async function getCurrentPriceFromCryptoCompare(symbol: string): Promise<number> {
  const { base, quote } = splitSymbol(symbol);
  const data = await httpGetJson<Record<string, unknown>>(
    CRYPTOCOMPARE_API_BASE,
    '/data/price',
    { fsym: base, tsyms: quote },
    {
      headers: CRYPTOCOMPARE_API_KEY
        ? { authorization: `Apikey ${CRYPTOCOMPARE_API_KEY}` }
        : undefined,
      timeoutMs: 7000,
    },
  );

  const num = Number(data?.[quote]);
  if (!Number.isFinite(num)) throw new Error(`CryptoCompare price unavailable for ${symbol}`);
  return num;
}

async function getKlinesFromCryptoCompare(
  symbol: string,
  interval: string,
  limit: number,
): Promise<KlineData[]> {
  const { base, quote } = splitSymbol(symbol);
  const minutes = intervalToMinutes(interval);
  const isMinute = minutes < 60 || interval.endsWith('m');
  const endpoint = isMinute ? 'histominute' : 'histohour';
  const aggregate = isMinute ? Math.max(1, minutes) : Math.max(1, Math.round(minutes / 60));

  const data = await httpGetJson<any>(
    CRYPTOCOMPARE_API_BASE,
    `/data/v2/${endpoint}`,
    {
      fsym: base,
      tsym: quote,
      aggregate,
      limit: Math.max(limit, 20),
    },
    {
      headers: CRYPTOCOMPARE_API_KEY
        ? { authorization: `Apikey ${CRYPTOCOMPARE_API_KEY}` }
        : undefined,
      timeoutMs: 7000,
    },
  );

  const rows = data?.Data?.Data;
  if (!Array.isArray(rows) || rows.length === 0) {
    throw new Error(`CryptoCompare klines unavailable for ${symbol}`);
  }

  return rows.map((k: any) => ({
    openTime: Number(k.time) * 1000,
    open: String(k.open),
    high: String(k.high),
    low: String(k.low),
    close: String(k.close),
    volume: String(k.volumefrom ?? 0),
    closeTime: Number(k.time) * 1000 + intervalToMs(interval) - 1,
  }));
}

async function getCurrentPriceFromCoinGecko(symbol: string): Promise<number> {
  const { base } = splitSymbol(symbol);
  const id = COINGECKO_IDS[base];
  if (!id) throw new Error(`CoinGecko id mapping missing for ${symbol}`);

  const data = await httpGetJson<any>(
    COINGECKO_API_BASE,
    '/simple/price',
    { ids: id, vs_currencies: 'usd' },
    {
      headers: COINGECKO_API_KEY ? { 'x-cg-demo-api-key': COINGECKO_API_KEY } : undefined,
      timeoutMs: 7000,
    },
  );

  const num = Number(data?.[id]?.usd);
  if (!Number.isFinite(num)) throw new Error(`CoinGecko price unavailable for ${symbol}`);
  return num;
}

async function getKlinesFromCoinGecko(
  symbol: string,
  interval: string,
  limit: number,
): Promise<KlineData[]> {
  const { base } = splitSymbol(symbol);
  const id = COINGECKO_IDS[base];
  if (!id) throw new Error(`CoinGecko id mapping missing for ${symbol}`);

  const bucketMs = intervalToMs(interval);

  try {
    const ohlc = await httpGetJson<any[]>(
      COINGECKO_API_BASE,
      `/coins/${id}/ohlc`,
      { vs_currency: 'usd', days: 1 },
      {
        headers: COINGECKO_API_KEY ? { 'x-cg-demo-api-key': COINGECKO_API_KEY } : undefined,
        timeoutMs: 7000,
      },
    );

    if (Array.isArray(ohlc) && ohlc.length > 0) {
      const klines = ohlc.map((k: any[]) => ({
        openTime: Number(k[0]),
        open: String(k[1]),
        high: String(k[2]),
        low: String(k[3]),
        close: String(k[4]),
        volume: '0',
        closeTime: Number(k[0]) + bucketMs - 1,
      }));
      return klines.slice(-limit);
    }
  } catch {
    // fallback below
  }

  const marketChart = await httpGetJson<any>(
    COINGECKO_API_BASE,
    `/coins/${id}/market_chart`,
    { vs_currency: 'usd', days: 1 },
    {
      headers: COINGECKO_API_KEY ? { 'x-cg-demo-api-key': COINGECKO_API_KEY } : undefined,
      timeoutMs: 7000,
    },
  );

  const points = (marketChart?.prices ?? []) as Array<[number, number]>;
  const klines = toKlinesFromFlatPrices(points, bucketMs);
  if (klines.length === 0) throw new Error(`CoinGecko klines unavailable for ${symbol}`);
  return klines.slice(-limit);
}

async function getCurrentPriceFromBybit(symbol: string): Promise<number> {
  const data = await httpGetJson<any>(
    BYBIT_API_BASE,
    '/v5/market/tickers',
    { category: 'linear', symbol },
    { timeoutMs: 7000 },
  );

  const ticker = data?.result?.list?.[0];
  const num = Number(ticker?.lastPrice);
  if (!Number.isFinite(num)) throw new Error(`Bybit price unavailable for ${symbol}`);
  return num;
}

async function getKlinesFromBybit(symbol: string, interval: string, limit: number): Promise<KlineData[]> {
  const bybitInterval = mapBybitInterval(interval);
  const data = await httpGetJson<any>(
    BYBIT_API_BASE,
    '/v5/market/kline',
    {
      category: 'linear',
      symbol,
      interval: bybitInterval,
      limit: Math.max(limit, 20),
    },
    { timeoutMs: 7000 },
  );

  const rows = data?.result?.list;
  if (!Array.isArray(rows) || rows.length === 0) throw new Error(`Bybit klines unavailable for ${symbol}`);

  return rows
    .map((k: any[]) => ({
      openTime: Number(k[0]),
      open: String(k[1]),
      high: String(k[2]),
      low: String(k[3]),
      close: String(k[4]),
      volume: String(k[5] ?? 0),
      closeTime: Number(k[0]) + intervalToMs(interval) - 1,
    }))
    .sort((a: KlineData, b: KlineData) => a.openTime - b.openTime)
    .slice(-limit);
}

async function getCurrentPriceFromBinance(symbol: string): Promise<number> {
  const data = await fetchFromAnyBinanceBase<PriceData>('/api/v3/ticker/price', { symbol });
  const num = Number(data?.price);
  if (!Number.isFinite(num)) throw new Error(`Binance price unavailable for ${symbol}`);
  return num;
}

async function getKlinesFromBinance(symbol: string, interval: string, limit: number): Promise<KlineData[]> {
  const rows = await fetchFromAnyBinanceBase<any[]>('/api/v3/klines', {
    symbol,
    interval,
    limit: Math.max(limit, 20),
  });

  if (!Array.isArray(rows) || rows.length === 0) throw new Error(`Binance klines unavailable for ${symbol}`);

  return rows.map((k: any[]) => ({
    openTime: Number(k[0]),
    open: String(k[1]),
    high: String(k[2]),
    low: String(k[3]),
    close: String(k[4]),
    volume: String(k[5] ?? 0),
    closeTime: Number(k[6] ?? Number(k[0]) + intervalToMs(interval) - 1),
  }));
}

async function getCurrentPriceFromMexc(symbol: string): Promise<number> {
  const data = await httpGetJson<any>(
    MEXC_API_BASE,
    '/api/v3/ticker/price',
    { symbol },
    { timeoutMs: 7000 },
  );

  const num = Number(data?.price);
  if (!Number.isFinite(num)) throw new Error(`MEXC price unavailable for ${symbol}`);
  return num;
}

async function getKlinesFromMexc(symbol: string, interval: string, limit: number): Promise<KlineData[]> {
  const rows = await httpGetJson<any[]>(
    MEXC_API_BASE,
    '/api/v3/klines',
    { symbol, interval, limit: Math.max(limit, 20) },
    { timeoutMs: 7000 },
  );

  if (!Array.isArray(rows) || rows.length === 0) throw new Error(`MEXC klines unavailable for ${symbol}`);

  return rows.map((k: any[]) => ({
    openTime: Number(k[0]),
    open: String(k[1]),
    high: String(k[2]),
    low: String(k[3]),
    close: String(k[4]),
    volume: String(k[5] ?? 0),
    closeTime: Number(k[6] ?? Number(k[0]) + intervalToMs(interval) - 1),
  }));
}

async function getCurrentPriceFromYahoo(symbol: string): Promise<number> {
  const yahooSymbol = resolveYahooSymbol(symbol);

  const data = await httpGetJson<any>(
    YAHOO_API_BASE,
    `/v8/finance/chart/${encodeURIComponent(yahooSymbol)}`,
    { interval: '1m', range: '1d' },
    { timeoutMs: 8000 },
  );

  const result = data?.chart?.result?.[0];
  const close = result?.indicators?.quote?.[0]?.close;
  const latestClose = Array.isArray(close)
    ? [...close].reverse().find((v: any) => Number.isFinite(Number(v)))
    : undefined;

  const num = Number(result?.meta?.regularMarketPrice ?? latestClose);
  if (!Number.isFinite(num)) throw new Error(`Yahoo price unavailable for ${symbol}`);
  return num;
}

async function getKlinesFromYahoo(symbol: string, interval: string, limit: number): Promise<KlineData[]> {
  const yahooSymbol = resolveYahooSymbol(symbol);
  const yahooInterval = mapYahooInterval(interval);

  const data = await httpGetJson<any>(
    YAHOO_API_BASE,
    `/v8/finance/chart/${encodeURIComponent(yahooSymbol)}`,
    {
      interval: yahooInterval,
      range: '1d',
      includePrePost: 'false',
      events: 'div,splits',
    },
    { timeoutMs: 8000 },
  );

  const result = data?.chart?.result?.[0];
  const ts = result?.timestamp as number[] | undefined;
  const quote = result?.indicators?.quote?.[0];

  if (!Array.isArray(ts) || !quote) {
    throw new Error(`Yahoo klines unavailable for ${symbol}`);
  }

  const bucketMs = intervalToMs(interval);
  const points: Array<[number, number]> = [];

  for (let i = 0; i < ts.length; i += 1) {
    const t = Number(ts[i]) * 1000;
    const close = Number(quote?.close?.[i]);
    if (Number.isFinite(t) && Number.isFinite(close)) points.push([t, close]);
  }

  const klines = toKlinesFromFlatPrices(points, bucketMs);
  if (klines.length === 0) throw new Error(`Yahoo klines unavailable for ${symbol}`);
  return klines.slice(-limit);
}

/**
 * 1순위: CryptoCompare
 * 2순위: CoinGecko
 * 3순위: Exchange direct (Bybit -> Binance -> MEXC)
 * 4순위: Yahoo Finance
 */
export async function getCurrentPrice(symbol: string): Promise<number> {
  try {
    return await withProviders(`price:${symbol}`, [
      { name: 'cryptocompare', run: () => getCurrentPriceFromCryptoCompare(symbol) },
      { name: 'coingecko', run: () => getCurrentPriceFromCoinGecko(symbol) },
      { name: 'bybit', run: () => getCurrentPriceFromBybit(symbol) },
      { name: 'binance', run: () => getCurrentPriceFromBinance(symbol) },
      { name: 'mexc', run: () => getCurrentPriceFromMexc(symbol) },
      { name: 'yahoo', run: () => getCurrentPriceFromYahoo(symbol) },
    ]);
  } catch (error) {
    console.error('Error fetching current price:', error);
    throw new Error(`Failed to fetch price for ${symbol}`);
  }
}

export async function getKlines(
  symbol: string,
  interval: string,
  limit: number = 100,
): Promise<KlineData[]> {
  try {
    return await withProviders(`klines:${symbol}:${interval}`, [
      { name: 'cryptocompare', run: () => getKlinesFromCryptoCompare(symbol, interval, limit) },
      { name: 'coingecko', run: () => getKlinesFromCoinGecko(symbol, interval, limit) },
      { name: 'bybit', run: () => getKlinesFromBybit(symbol, interval, limit) },
      { name: 'binance', run: () => getKlinesFromBinance(symbol, interval, limit) },
      { name: 'mexc', run: () => getKlinesFromMexc(symbol, interval, limit) },
      { name: 'yahoo', run: () => getKlinesFromYahoo(symbol, interval, limit) },
    ]);
  } catch (error) {
    console.error('Error fetching klines:', error);
    throw new Error(`Failed to fetch klines for ${symbol}`);
  }
}

export async function getPriceAtTime(symbol: string, timestamp: number): Promise<number> {
  try {
    const data = await getKlines(symbol, '1m', 6);
    if (data.length === 0) {
      throw new Error('No price data found for the specified time');
    }

    const closestKline = data.reduce((prev, curr) => {
      const prevDiff = Math.abs(prev.openTime - timestamp);
      const currDiff = Math.abs(curr.openTime - timestamp);
      return currDiff < prevDiff ? curr : prev;
    });

    return parseFloat(closestKline.close);
  } catch (error) {
    console.error('Error fetching price at time:', error);
    throw new Error(`Failed to fetch price for ${symbol} at ${new Date(timestamp).toISOString()}`);
  }
}
