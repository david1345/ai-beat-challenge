import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function GET() {
  try {
    const { data, error } = await supabase
      .from("users")
      .select("username, points, wins, losses, draws, best_streak, current_streak, updated_at")
      .order("points", { ascending: false })
      .order("wins", { ascending: false })
      .limit(100);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const entries = (data || []).map((u, i) => ({
      rank: i + 1,
      username: u.username,
      points: u.points || 0,
      wins: u.wins || 0,
      losses: u.losses || 0,
      draws: u.draws || 0,
      best_streak: u.best_streak || 0,
      current_streak: u.current_streak || 0,
      updated_at: u.updated_at || null
    }));

    return NextResponse.json({ entries });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || "failed" }, { status: 500 });
  }
}
