"use client";

import { useEffect, useMemo, useState } from "react";
import styles from "./page.module.css";

type Profile = {
  points: number;
  total_games: number;
  wins: number;
  losses: number;
  draws: number;
  best_streak: number;
  current_streak: number;
  win_rate: number;
};

type Totals = {
  games: number;
  wins: number;
  losses: number;
  draws: number;
  pending: number;
  points: number;
};

function achieved(value: number, threshold: number) {
  return value >= threshold;
}

export default function AchievementsClient({ username }: { username: string }) {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [totals, setTotals] = useState<Totals | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch(`/api/user/predictions?username=${encodeURIComponent(username)}&limit=40&offset=0`, {
          cache: "no-store"
        });
        const json = await res.json();
        if (!res.ok) throw new Error(json?.error || "Failed to load achievements");
        setProfile(json?.profile || null);
        setTotals(json?.totals || null);
      } catch (e: any) {
        setError(e?.message || "Failed to load achievements");
      }
    };
    load();
  }, [username]);

  const cards = useMemo(() => {
    const wins = totals?.wins ?? profile?.wins ?? 0;
    const games = totals?.games ?? profile?.total_games ?? 0;
    const points = profile?.points ?? 0;
    const streak = profile?.best_streak ?? 0;

    return [
      { key: "starter", title: "Starter", desc: "Play 1 game", done: achieved(games, 1), progress: `${games}/1` },
      { key: "grinder", title: "Grinder", desc: "Play 25 games", done: achieved(games, 25), progress: `${games}/25` },
      { key: "winner", title: "Winner", desc: "Win 10 rounds", done: achieved(wins, 10), progress: `${wins}/10` },
      { key: "streak3", title: "Hot Streak", desc: "Reach 3 best streak", done: achieved(streak, 3), progress: `${streak}/3` },
      { key: "streak7", title: "On Fire", desc: "Reach 7 best streak", done: achieved(streak, 7), progress: `${streak}/7` },
      { key: "points1k", title: "Point Hunter", desc: "Reach 1,000 points", done: achieved(points, 1000), progress: `${points}/1000` }
    ];
  }, [profile, totals]);

  if (error) return <div className={styles.stateError}>{error}</div>;
  if (!profile) return <div className={styles.state}>Loading achievements...</div>;

  return (
    <>
      <section className={styles.summary}>
        <div><span>Player</span><strong>{username}</strong></div>
        <div><span>Total Points</span><strong>{profile.points}</strong></div>
        <div><span>Total Games</span><strong>{totals?.games ?? profile.total_games}</strong></div>
        <div><span>Win Rate</span><strong>{profile.win_rate}%</strong></div>
      </section>

      <section className={styles.grid}>
        {cards.map((c) => (
          <article key={c.key} className={`${styles.card} ${c.done ? styles.done : ""}`}>
            <div className={styles.cardTop}>
              <h3>{c.title}</h3>
              <span className={styles.badge}>{c.done ? "Unlocked" : "Locked"}</span>
            </div>
            <p>{c.desc}</p>
            <div className={styles.progress}>{c.progress}</div>
          </article>
        ))}
      </section>
    </>
  );
}
