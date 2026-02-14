import { NextResponse } from 'next/server';
import { getUserProfile } from '@/lib/db/users';
import { supabase } from '@/lib/supabase';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const username = searchParams.get('username');

    if (!username) {
      return NextResponse.json(
        { error: 'Missing username' },
        { status: 400 }
      );
    }

    // Get user profile
    const user = await getUserProfile(username);

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Calculate additional stats
    const { data: games } = await supabase
      .from('games')
      .select('*')
      .eq('user_id', user.id)
      .eq('status', 'completed');

    const totalGames = games?.length || 0;
    const winRate = totalGames > 0
      ? Math.round((user.wins / totalGames) * 100)
      : 0;

    return NextResponse.json({
      username: user.username,
      points: user.points,
      level: user.level,
      wins: user.wins,
      losses: user.losses,
      draws: user.draws,
      current_streak: user.current_streak,
      best_streak: user.best_streak,
      total_games: totalGames,
      win_rate: winRate,
      created_at: user.created_at
    });
  } catch (error: any) {
    console.error('Error getting user profile:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to get user profile' },
      { status: 500 }
    );
  }
}
