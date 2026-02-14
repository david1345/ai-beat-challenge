import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

export interface AIPrediction {
  prediction: 'UP' | 'DOWN';
  confidence: number;
  reasoning: string;
}

/**
 * Generate AI prediction for a trading pair using OpenAI
 * @param asset - Trading pair (e.g., 'BTCUSDT')
 * @param currentPrice - Current price
 * @param recentPrices - Array of recent closing prices
 * @param timeframe - Prediction timeframe (e.g., '30s', '1m', '5m')
 */
export async function predictDirection(
  asset: string,
  currentPrice: number,
  recentPrices: number[],
  timeframe: string
): Promise<AIPrediction> {
  const prompt = `You are a crypto price prediction AI. Analyze the following data and predict if ${asset} will go UP or DOWN in the next ${timeframe}.

Current Price: $${currentPrice}
Recent Prices (last ${recentPrices.length} data points): ${recentPrices.join(', ')}

Timeframe: ${timeframe}

Based on the price trend, make a prediction. Respond ONLY with a valid JSON object in this exact format:
{
  "prediction": "UP" or "DOWN",
  "confidence": number between 1-100,
  "reasoning": "brief explanation in 1-2 sentences"
}

Do not include any text before or after the JSON.`;

  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: 'You are a cryptocurrency price prediction expert. Always respond with valid JSON only.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.7,
      max_tokens: 150,
      response_format: { type: 'json_object' }
    });

    const content = completion.choices[0].message.content;
    if (!content) {
      throw new Error('No response from OpenAI');
    }

    // Parse the JSON response
    const prediction = JSON.parse(content) as AIPrediction;

    // Validate the prediction
    if (!prediction.prediction || !['UP', 'DOWN'].includes(prediction.prediction)) {
      throw new Error('Invalid prediction value');
    }

    if (typeof prediction.confidence !== 'number' || prediction.confidence < 1 || prediction.confidence > 100) {
      throw new Error('Invalid confidence value');
    }

    return prediction;
  } catch (error) {
    console.error('Error generating AI prediction:', error);

    // Fallback to a simple prediction based on recent trend
    const avgRecentChange = recentPrices.length > 1
      ? (recentPrices[recentPrices.length - 1] - recentPrices[0]) / recentPrices[0]
      : 0;

    return {
      prediction: avgRecentChange > 0 ? 'UP' : 'DOWN',
      confidence: 50,
      reasoning: 'Fallback prediction based on recent price trend.'
    };
  }
}
