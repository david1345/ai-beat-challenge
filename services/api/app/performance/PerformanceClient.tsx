"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import styles from "./page.module.css";

type Profile = {
  username: string;
  points: number;
  level: number;
  wins: number;
  losses: number;
  draws: number;
  win_rate: number;
  total_games: number;
  current_streak: number;
  best_streak: number;
};

type RoundItem = {
  round_id: string;
  round_number: number;
  asset: string;
  timeframe: string;
  prediction_at: string;
  settle_at: string;
  start_price: number;
  end_price: number | null;
  user_prediction: string | null;
  ai_prediction: string;
  ai_confidence: number | null;
  ai_reasoning: string | null;
  result: string | null;
  status: string;
  time_remaining: number;
};

type HistoryItem = {
  game_id: string;
  mode: string;
  created_at: string;
  completed_at: string | null;
  user_score: number;
  ai_score: number;
  points_earned: number;
  status: string;
  summary: {
    total_rounds: number;
    wins: number;
    losses: number;
    draws: number;
    pending: number;
  };
  rounds: RoundItem[];
};

type Totals = {
  games: number;
  rounds?: number;
  wins: number;
  losses: number;
  draws: number;
  pending: number;
  points: number;
};

function formatDateTime(value: string | null | undefined) {
  if (!value) return "-";
  const ms = Date.parse(value);
  if (!Number.isFinite(ms)) return "-";
  const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
  return new Date(ms).toLocaleString(undefined, {
    timeZone: tz,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  });
}

function shortenGameId(gameId: string) {
  if (!gameId) return "-";
  return `${gameId.slice(0, 8)}...`;
}

function normalizeStatus(status: string) {
  if (status === "completed") return "Completed";
  if (status === "in_progress") return "In Progress";
  if (status === "pending") return "Pending";
  return status;
}

function roundOutcomeLabel(round: RoundItem) {
  if (round.result === "user_win") return "Win";
  if (round.result === "ai_win") return "Lose";
  if (round.result === "draw") return "Draw";
  if (round.status === "pending_pick") return "Pending Pick";
  if (round.status === "pending") return `Pending (${round.time_remaining}s)`;
  return "In Progress";
}

export default function PerformanceClient({
  username,
  focusGameId,
  view = "all",
}: {
  username: string;
  focusGameId?: string;
  view?: "all" | "stats" | "history";
}) {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [totals, setTotals] = useState<Totals | null>(null);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [error, setError] = useState("");

  useEffect(() => {
    const load = async () => {
      try {
        const overviewRes = await fetch(
          `/api/user/predictions?username=${encodeURIComponent(username)}&limit=40&offset=0`,
          { cache: "no-store" }
        );
        const overviewJson = await overviewRes.json();
        if (!overviewRes.ok) throw new Error(overviewJson?.error || "Failed to load performance");

        setProfile(overviewJson?.profile || null);
        setTotals(overviewJson?.totals || null);
        setHistory(Array.isArray(overviewJson?.entries) ? overviewJson.entries : []);
      } catch (e: any) {
        setError(e?.message || "Failed to load performance");
      }
    };
    load();
  }, [username]);

  if (error) return <div className={styles.error}>{error}</div>;
  if (!profile) return <div className={styles.state}>Loading performance...</div>;

  return (
    <div className={styles.layout}>
      {view !== "history" ? (
      <section className={styles.card}>
        <h2>Overview</h2>
        <div className={styles.grid}>
          <div><span>Total Points</span><strong>{profile.points}</strong></div>
          <div><span>Total Settled Matches</span><strong>{totals?.games ?? profile.total_games}</strong></div>
          <div><span>Total Rounds (Loaded)</span><strong>{totals?.rounds ?? (totals ? totals.wins + totals.losses + totals.draws + totals.pending : profile.total_games)}</strong></div>
          <div><span>Round Wins</span><strong>{totals?.wins ?? profile.wins}</strong></div>
          <div><span>Round Losses</span><strong>{totals?.losses ?? profile.losses}</strong></div>
          <div><span>Pending Rounds</span><strong>{totals?.pending ?? 0}</strong></div>
          <div><span>Win Rate</span><strong>{profile.win_rate}%</strong></div>
          <div><span>Current Streak</span><strong>{profile.current_streak}</strong></div>
          <div><span>Best Streak</span><strong>{profile.best_streak}</strong></div>
          <div><span>Points Earned (tracked)</span><strong>+{totals?.points ?? 0}</strong></div>
        </div>
      </section>
      ) : null}

      {view !== "stats" ? (
      <section className={styles.card}>
        <h2>Prediction Timeline</h2>
        {history.length === 0 ? <div className={styles.empty}>No predictions yet.</div> : history.map((g) => (
          <article
            className={`${styles.gameCard} ${focusGameId === g.game_id ? styles.focusedGame : ""}`}
            key={g.game_id}
          >
            <div className={styles.gameHeader}>
              <div className={styles.gameTitle}>
                <span className={styles.modeBadge}>{g.mode}</span>
                <strong>Game {shortenGameId(g.game_id)}</strong>
              </div>
              <span className={`${styles.statusBadge} ${g.status === "completed" ? styles.completed : styles.pending}`}>
                {normalizeStatus(g.status)}
              </span>
            </div>

            <div className={styles.metaGrid}>
              <div><span>Prediction Time</span><strong>{formatDateTime(g.created_at)}</strong></div>
              <div><span>Settlement Time</span><strong>{formatDateTime(g.completed_at)}</strong></div>
              <div><span>Score</span><strong>You {g.user_score} : {g.ai_score} AI</strong></div>
              <div><span>Points</span><strong>+{g.points_earned}</strong></div>
            </div>

            <div className={styles.table}>
              <div className={styles.thead}>
                <span>Round Overview</span>
                <span>Your Pick</span>
                <span>AI Pick</span>
                <span>Status / Outcome</span>
              </div>
              {g.rounds.map((round) => (
                <div className={styles.trow} key={round.round_id}>
                  <span className={styles.roundOverview}>
                    <strong>Round {round.round_number}</strong> · {round.asset} · {round.timeframe}
                    <small>
                      Predicted {formatDateTime(round.prediction_at)} · Evaluated {formatDateTime(round.settle_at)}
                    </small>
                  </span>
                  <span>{round.user_prediction || "-"}</span>
                  <span>{round.ai_prediction}</span>
                  <span>{roundOutcomeLabel(round)}</span>
                </div>
              ))}
            </div>
          </article>
        ))}
      </section>
      ) : null}

      <div className={styles.actions}><Link href="/play" className={styles.linkBtn}>Back to Play</Link></div>
    </div>
  );
}
