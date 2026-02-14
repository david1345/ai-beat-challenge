import axios from 'axios';

const BINANCE_API_BASE = process.env.BINANCE_API_BASE_URL || 'https://api.binance.com';

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

/**
 * Get current price for a symbol
 */
export async function getCurrentPrice(symbol: string): Promise<number> {
  try {
    const response = await axios.get<PriceData>(`${BINANCE_API_BASE}/api/v3/ticker/price`, {
      params: { symbol },
      timeout: 5000
    });
    return parseFloat(response.data.price);
  } catch (error) {
    console.error('Error fetching current price:', error);
    throw new Error(`Failed to fetch price for ${symbol}`);
  }
}

/**
 * Get historical kline/candlestick data
 * @param symbol - Trading pair (e.g., 'BTCUSDT')
 * @param interval - Kline interval (e.g., '1m', '5m', '1h')
 * @param limit - Number of klines to retrieve (max 1000)
 */
export async function getKlines(
  symbol: string,
  interval: string,
  limit: number = 100
): Promise<KlineData[]> {
  try {
    const response = await axios.get(`${BINANCE_API_BASE}/api/v3/klines`, {
      params: { symbol, interval, limit },
      timeout: 5000
    });

    return response.data.map((k: any[]) => ({
      openTime: k[0],
      open: k[1],
      high: k[2],
      low: k[3],
      close: k[4],
      volume: k[5],
      closeTime: k[6]
    }));
  } catch (error) {
    console.error('Error fetching klines:', error);
    throw new Error(`Failed to fetch klines for ${symbol}`);
  }
}

/**
 * Get price at a specific timestamp
 * @param symbol - Trading pair
 * @param timestamp - Unix timestamp in milliseconds
 */
export async function getPriceAtTime(symbol: string, timestamp: number): Promise<number> {
  try {
    // Get klines around the target time (1 minute interval)
    const response = await axios.get(`${BINANCE_API_BASE}/api/v3/klines`, {
      params: {
        symbol,
        interval: '1m',
        startTime: timestamp - 60000, // 1 minute before
        endTime: timestamp + 60000,   // 1 minute after
        limit: 3
      },
      timeout: 5000
    });

    if (response.data.length === 0) {
      throw new Error('No price data found for the specified time');
    }

    // Find the closest kline to the target timestamp
    const closestKline = response.data.reduce((prev: any[], curr: any[]) => {
      const prevDiff = Math.abs(prev[0] - timestamp);
      const currDiff = Math.abs(curr[0] - timestamp);
      return currDiff < prevDiff ? curr : prev;
    });

    // Return the close price of the closest kline
    return parseFloat(closestKline[4]);
  } catch (error) {
    console.error('Error fetching price at time:', error);
    throw new Error(`Failed to fetch price for ${symbol} at ${new Date(timestamp).toISOString()}`);
  }
}
