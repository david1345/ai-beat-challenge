import { supabase } from '../supabase';

export interface Game {
  id: string;
  user_id: string;
  mode: string;
  status: string;
  user_score: number;
  ai_score: number;
  points_earned: number;
  created_at: string;
  completed_at: string | null;
  updated_at?: string;
}


export interface Round {
  id: string;
  game_id: string;
  round_number: number;
  asset: string;
  timeframe: string;
  start_price: number;
  end_price: number | null;
  user_prediction: string | null;
  ai_prediction: string;
  ai_reasoning: string | null;
  ai_confidence: number | null;
  result: string | null;
  created_at: string;
  completed_at: string | null;
  updated_at?: string;
}


export interface RoundData {
  roundNumber: number;
  asset: string;
  timeframe: string;
  startPrice: number;
  aiPrediction: string;
  aiReasoning?: string | null;
  aiConfidence?: number | null;
}

/**
 * Create a new game
 */
export async function createGame(userId: string, mode: string): Promise<string> {
  const { data, error } = await supabase
    .from('games')
    .insert({
      user_id: userId,
      mode,
      status: 'active',
      user_score: 0,
      ai_score: 0,
      points_earned: 0
    })
    .select('id')
    .single();

  if (error || !data) {
    throw new Error(`Failed to create game: ${error?.message}`);
  }

  return data.id;
}

/**
 * Create rounds for a game
 */
export async function createRounds(gameId: string, roundsData: RoundData[]): Promise<Round[]> {
  const rounds = roundsData.map(r => ({
    game_id: gameId,
    round_number: r.roundNumber,
    asset: r.asset,
    timeframe: r.timeframe,
    start_price: r.startPrice,
    ai_prediction: r.aiPrediction,
    ai_reasoning: r.aiReasoning || null,
    ai_confidence: r.aiConfidence || null
  }));

  const { data, error } = await supabase
    .from('rounds')
    .insert(rounds)
    .select();

  if (error || !data) {
    throw new Error(`Failed to create rounds: ${error?.message}`);
  }

  return data;
}

/**
 * Update user prediction for a round
 */
export async function updateRoundPrediction(
  roundId: string,
  userPrediction: 'UP' | 'DOWN',
  options?: { startPrice?: number; lockTimeIso?: string }
): Promise<void> {
  const payload: Record<string, any> = { user_prediction: userPrediction };

  if (typeof options?.startPrice === 'number') {
    payload.start_price = options.startPrice;
  }

  if (options?.lockTimeIso) {
    payload.created_at = options.lockTimeIso;
  }

  const { error } = await supabase
    .from('rounds')
    .update(payload)
    .eq('id', roundId);

  if (error) {
    throw new Error(`Failed to update round prediction: ${error.message}`);
  }
}

/**
 * Update AI prediction payload for a round.
 */
export async function updateRoundAI(
  roundId: string,
  aiPrediction: 'UP' | 'DOWN',
  aiReasoning: string,
  aiConfidence: number
): Promise<void> {
  const { error } = await supabase
    .from('rounds')
    .update({
      ai_prediction: aiPrediction,
      ai_reasoning: aiReasoning,
      ai_confidence: aiConfidence
    })
    .eq('id', roundId);

  if (error) {
    throw new Error(`Failed to update round AI prediction: ${error.message}`);
  }
}

/**
 * Complete a round with result
 */
export async function completeRound(
  roundId: string,
  endPrice: number,
  result: 'user_win' | 'ai_win' | 'draw',
  startPrice?: number
): Promise<void> {
  const payload: Record<string, any> = {
    end_price: endPrice,
    result,
    completed_at: new Date().toISOString()
  };

  if (typeof startPrice === 'number') {
    payload.start_price = startPrice;
  }

  const { error } = await supabase
    .from('rounds')
    .update(payload)
    .eq('id', roundId);

  if (error) {
    throw new Error(`Failed to complete round: ${error.message}`);
  }
}

/**
 * Get all rounds for a game
 */
export async function getRounds(gameId: string): Promise<Round[]> {
  const { data, error } = await supabase
    .from('rounds')
    .select('*')
    .eq('game_id', gameId)
    .order('round_number', { ascending: true });

  if (error) {
    throw new Error(`Failed to get rounds: ${error.message}`);
  }

  return data;
}

/**
 * Get a single game by ID
 */
export async function getGame(gameId: string): Promise<Game | null> {
  const { data, error } = await supabase
    .from('games')
    .select('*')
    .eq('id', gameId)
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      return null;
    }
    throw new Error(`Failed to get game: ${error.message}`);
  }

  return data;
}


/**
 * Set lock time on active game (reusing completed_at field until final settlement).
 */
export async function setGameLockTime(
  gameId: string,
  lockTimeIso: string
): Promise<void> {
  const { error } = await supabase
    .from('games')
    .update({ completed_at: lockTimeIso })
    .eq('id', gameId)
    .eq('status', 'active');

  if (error) {
    throw new Error(`Failed to set game lock time: ${error.message}`);
  }
}

/**
 * Complete a game with final scores
 */
export async function completeGame(
  gameId: string,
  userScore: number,
  aiScore: number,
  pointsEarned: number
): Promise<void> {
  const { error } = await supabase
    .from('games')
    .update({
      status: 'completed',
      user_score: userScore,
      ai_score: aiScore,
      points_earned: pointsEarned,
      completed_at: new Date().toISOString()
    })
    .eq('id', gameId);

  if (error) {
    throw new Error(`Failed to complete game: ${error.message}`);
  }
}
