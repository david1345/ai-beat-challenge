import { supabase } from '../supabase';

export interface User {
  id: string;
  email: string;
  username: string;
  points: number;
  level: number;
  wins: number;
  losses: number;
  draws: number;
  current_streak: number;
  best_streak: number;
  created_at: string;
  updated_at: string;
}

export interface GameResult {
  userScore: number;
  aiScore: number;
  pointsEarned: number;
}

/**
 * Find user by username or create if not exists
 */
export async function findOrCreateUser(username: string): Promise<User> {
  // Try to find existing user
  const { data: existingUser, error: findError } = await supabase
    .from('users')
    .select('*')
    .eq('username', username)
    .single();

  if (existingUser) {
    return existingUser;
  }

  // Create new user if not found
  const { data: newUser, error: createError } = await supabase
    .from('users')
    .insert({
      email: `${username}@temp.local`, // Temporary email for now
      username,
      points: 0,
      level: 1,
      wins: 0,
      losses: 0,
      draws: 0,
      current_streak: 0,
      best_streak: 0
    })
    .select()
    .single();

  if (createError || !newUser) {
    throw new Error(`Failed to create user: ${createError?.message}`);
  }

  return newUser;
}

/**
 * Update user stats after a game
 */
export async function updateUserStats(
  userId: string,
  gameResult: GameResult
): Promise<void> {
  // Get current user stats
  const { data: user, error: fetchError } = await supabase
    .from('users')
    .select('*')
    .eq('id', userId)
    .single();

  if (fetchError || !user) {
    throw new Error(`Failed to fetch user: ${fetchError?.message}`);
  }

  // Determine game outcome
  let wins = user.wins;
  let losses = user.losses;
  let draws = user.draws;
  let currentStreak = user.current_streak;
  let bestStreak = user.best_streak;

  if (gameResult.userScore > gameResult.aiScore) {
    // User won
    wins += 1;
    currentStreak = currentStreak >= 0 ? currentStreak + 1 : 1;
    bestStreak = Math.max(bestStreak, currentStreak);
  } else if (gameResult.userScore < gameResult.aiScore) {
    // User lost
    losses += 1;
    currentStreak = currentStreak <= 0 ? currentStreak - 1 : -1;
  } else {
    // Draw
    draws += 1;
    currentStreak = 0;
  }

  // Update user stats
  const { error: updateError } = await supabase
    .from('users')
    .update({
      points: user.points + gameResult.pointsEarned,
      wins,
      losses,
      draws,
      current_streak: currentStreak,
      best_streak: bestStreak,
      updated_at: new Date().toISOString()
    })
    .eq('id', userId);

  if (updateError) {
    throw new Error(`Failed to update user stats: ${updateError.message}`);
  }
}

/**
 * Get user profile by username
 */
export async function getUserProfile(username: string): Promise<User | null> {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('username', username)
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      // User not found
      return null;
    }
    throw new Error(`Failed to get user profile: ${error.message}`);
  }

  return data;
}


/**
 * Get user games (all statuses)
 */
export async function getUserGames(
  userId: string,
  limit: number = 20,
  offset: number = 0
) {
  const { data, error } = await supabase
    .from('games')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1);

  if (error) {
    throw new Error(`Failed to get user games: ${error.message}`);
  }

  return data;
}

/**
 * Get user game history
 */
export async function getUserHistory(
  userId: string,
  limit: number = 20,
  offset: number = 0
) {
  const { data, error } = await supabase
    .from('games')
    .select('*')
    .eq('user_id', userId)
    .eq('status', 'completed')
    .order('completed_at', { ascending: false })
    .range(offset, offset + limit - 1);

  if (error) {
    throw new Error(`Failed to get user history: ${error.message}`);
  }

  return data;
}
