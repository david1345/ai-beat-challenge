import { NextResponse } from 'next/server';
import { getUserProfile, getUserHistory } from '@/lib/db/users';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const username = searchParams.get('username');
    const limit = parseInt(searchParams.get('limit') || '20');
    const offset = parseInt(searchParams.get('offset') || '0');

    if (!username) {
      return NextResponse.json(
        { error: 'Missing username' },
        { status: 400 }
      );
    }

    // Validate limit and offset
    if (limit < 1 || limit > 100) {
      return NextResponse.json(
        { error: 'Limit must be between 1 and 100' },
        { status: 400 }
      );
    }

    if (offset < 0) {
      return NextResponse.json(
        { error: 'Offset must be non-negative' },
        { status: 400 }
      );
    }

    // Get user
    const user = await getUserProfile(username);

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Get user history
    const games = await getUserHistory(user.id, limit, offset);

    // Format response
    const formattedGames = games.map(game => ({
      game_id: game.id,
      mode: game.mode,
      user_score: game.user_score,
      ai_score: game.ai_score,
      points_earned: game.points_earned,
      status: game.status,
      created_at: game.created_at,
      completed_at: game.completed_at
    }));

    return NextResponse.json({
      games: formattedGames,
      total: formattedGames.length,
      limit,
      offset
    });
  } catch (error: any) {
    console.error('Error getting user history:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to get user history' },
      { status: 500 }
    );
  }
}
