"use client";

import { useEffect, useState } from "react";
import styles from "./page.module.css";

type Entry = {
  rank: number;
  username: string;
  points: number;
  wins: number;
  losses: number;
  draws: number;
  best_streak: number;
  current_streak: number;
};

export default function LeaderboardClient() {
  const [entries, setEntries] = useState<Entry[]>([]);
  const [error, setError] = useState("");

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch("/api/leaderboard", { cache: "no-store" });
        const json = await res.json();
        if (!res.ok) throw new Error(json?.error || "Failed to fetch leaderboard");
        setEntries(Array.isArray(json?.entries) ? json.entries : []);
      } catch (e: any) {
        setError(e?.message || "Failed to fetch leaderboard");
      }
    };
    load();
  }, []);

  if (error) return <div className={styles.stateError}>{error}</div>;

  return (
    <section className={styles.card}>
      <div className={styles.headRow}>
        <span>Rank</span>
        <span>Player</span>
        <span>Points</span>
        <span>W/L/D</span>
        <span>Streak</span>
      </div>
      {entries.length === 0 ? (
        <div className={styles.state}>No ranking data yet.</div>
      ) : (
        entries.map((e) => (
          <div key={`${e.rank}-${e.username}`} className={styles.row}>
            <span className={styles.rank}>#{e.rank}</span>
            <span className={styles.player}>{e.username}</span>
            <span className={styles.points}>{e.points}</span>
            <span>{e.wins}/{e.losses}/{e.draws}</span>
            <span>{e.current_streak} / best {e.best_streak}</span>
          </div>
        ))
      )}
    </section>
  );
}
