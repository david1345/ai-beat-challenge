import { NextResponse } from 'next/server';
import { getGame } from '@/lib/db/games';
import { warmAIPredictions } from '@/lib/ai-predictions';

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => null);
    const gameId = body?.game_id;

    if (!gameId) {
      return NextResponse.json({ error: 'Missing game_id' }, { status: 400 });
    }

    const game = await getGame(gameId);
    if (!game) {
      return NextResponse.json({ error: 'Game not found' }, { status: 404 });
    }

    await warmAIPredictions(gameId);
    return NextResponse.json({ status: 'ok' });
  } catch (error: any) {
    console.error('Error warming AI predictions:', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to warm predictions' },
      { status: 500 }
    );
  }
}

