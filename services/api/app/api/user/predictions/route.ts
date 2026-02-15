import { NextResponse } from 'next/server';
import { getUserProfile, getUserGames } from '@/lib/db/users';
import { getRounds } from '@/lib/db/games';
import { getPersonalSettlementWindow } from '@/lib/utils/scoring';

function parseDbTimestamp(value: string): number {
  // Supabase timestamp without timezone is stored as UTC in this project.
  // Force UTC parse so client local-time rendering is correct.
  if (!value) return Date.now();
  const normalized = /[zZ]|[+-]\d{2}:?\d{2}$/.test(value) ? value : `${value}Z`;
  return new Date(normalized).getTime();
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const username = searchParams.get('username');
    const limit = parseInt(searchParams.get('limit') || '20', 10);
    const offset = parseInt(searchParams.get('offset') || '0', 10);

    if (!username) {
      return NextResponse.json({ error: 'Missing username' }, { status: 400 });
    }

    if (limit < 1 || limit > 100) {
      return NextResponse.json({ error: 'Limit must be between 1 and 100' }, { status: 400 });
    }

    if (offset < 0) {
      return NextResponse.json({ error: 'Offset must be non-negative' }, { status: 400 });
    }

    const user = await getUserProfile(username);
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const games = await getUserGames(user.id, limit, offset);
    const now = Date.now();

    const entries = await Promise.all(
      games.map(async (game) => {
        const rounds = await getRounds(game.id);

        const mappedRounds = rounds.map((round) => {
          const lockMs = parseDbTimestamp(round.created_at);
          const { settleAtMs } = getPersonalSettlementWindow(lockMs, round.timeframe);

          const status = !round.user_prediction
            ? 'pending_pick'
            : round.result
              ? round.result
              : now < settleAtMs
                ? 'pending'
                : 'processing';

          return {
            round_id: round.id,
            round_number: round.round_number,
            asset: round.asset,
            timeframe: round.timeframe,
            prediction_at: new Date(lockMs).toISOString(),
            settle_at: new Date(settleAtMs).toISOString(),
            start_price: round.start_price,
            end_price: round.end_price,
            user_prediction: round.user_prediction,
            ai_prediction: round.ai_prediction,
            ai_confidence: round.ai_confidence,
            ai_reasoning: round.ai_reasoning,
            result: round.result,
            status,
            time_remaining: status === 'pending' ? Math.max(0, Math.floor((settleAtMs - now) / 1000)) : 0,
          };
        });

        const wins = mappedRounds.filter((r) => r.result === 'user_win').length;
        const losses = mappedRounds.filter((r) => r.result === 'ai_win').length;
        const draws = mappedRounds.filter((r) => r.result === 'draw').length;
        const pending = mappedRounds.filter((r) => r.status === 'pending' || r.status === 'processing' || r.status === 'pending_pick').length;

        return {
          game_id: game.id,
          mode: game.mode,
          status: pending > 0 ? 'pending' : game.status,
          created_at: game.created_at,
          completed_at: game.status === 'completed' ? game.completed_at : null,
          user_score: game.user_score,
          ai_score: game.ai_score,
          points_earned: game.points_earned,
          summary: {
            total_rounds: mappedRounds.length,
            wins,
            losses,
            draws,
            pending,
          },
          rounds: mappedRounds,
        };
      })
    );

    const totals = {
      // settled matches from canonical user profile stats
      games: user.wins + user.losses + user.draws,
      // rounds/timeline stats from loaded entries (includes pending)
      wins: entries.reduce((acc, g) => acc + g.summary.wins, 0),
      losses: entries.reduce((acc, g) => acc + g.summary.losses, 0),
      draws: entries.reduce((acc, g) => acc + g.summary.draws, 0),
      pending: entries.reduce((acc, g) => acc + g.summary.pending, 0),
      points: user.points,
      rounds: entries.reduce((acc, g) => acc + g.summary.total_rounds, 0),
    };

    return NextResponse.json({
      profile: {
        username: user.username,
        points: user.points,
        level: user.level,
        wins: user.wins,
        losses: user.losses,
        draws: user.draws,
        win_rate: user.wins + user.losses + user.draws > 0
          ? ((user.wins / (user.wins + user.losses + user.draws)) * 100).toFixed(1)
          : '0.0',
        total_games: user.wins + user.losses + user.draws,
        current_streak: user.current_streak,
        best_streak: user.best_streak,
      },
      totals,
      entries,
      limit,
      offset,
    });
  } catch (error: any) {
    console.error('Error getting user predictions:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to get user predictions' },
      { status: 500 }
    );
  }
}
