"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import styles from "./page.module.css";

type Round = {
  round_id: string;
  round_number: number;
  asset: string;
  timeframe: string;
  start_price: number;
  end_price: number | null;
  user_prediction: string | null;
  ai_prediction: string;
  ai_confidence?: number | null;
  ai_reasoning?: string | null;
  result: string | null;
  time_remaining?: number;
};

type ResultPayload = {
  status: "pending" | "completed";
  user_score: number;
  ai_score: number;
  points_earned: number;
  rounds: Round[];
};

type PredictionGame = {
  game_id: string;
  mode: string;
  status: string;
  created_at: string;
  completed_at: string | null;
  user_score: number;
  ai_score: number;
  points_earned: number;
  rounds: Round[];
};

type PredictionsPayload = {
  entries: PredictionGame[];
};

function formatSeconds(totalSeconds: number) {
  const mins = Math.floor(totalSeconds / 60);
  const secs = totalSeconds % 60;
  return `${mins}:${String(secs).padStart(2, "0")}`;
}

function formatDateTime(value?: string | null) {
  if (!value) return "-";
  const normalized = /([zZ]|[+-]\d{2}:\d{2})$/.test(value) ? value : `${value}Z`;
  const ms = Date.parse(normalized);
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

function roundStatus(round: Round) {
  if (round.result === "user_win") return "Win";
  if (round.result === "ai_win") return "Lose";
  if (round.result === "draw") return "Draw";
  if (!round.user_prediction) return "Pending Pick";
  if (typeof round.time_remaining === "number" && round.time_remaining > 0) {
    return `Pending (${round.time_remaining}s)`;
  }
  return "In Progress";
}

export default function CheckClient({ gameId, username }: { gameId: string; username: string }) {
  const [data, setData] = useState<ResultPayload | null>(null);
  const [entries, setEntries] = useState<PredictionGame[]>([]);
  const [error, setError] = useState("");

  useEffect(() => {
    let timer: NodeJS.Timeout | null = null;

    const poll = async () => {
      try {
        const res = await fetch(`/api/game/result?game_id=${gameId}`, { cache: "no-store" });
        const json = await res.json();
        if (!res.ok) throw new Error(json?.error || "Failed to fetch result");
        setData(json);

        const predRes = await fetch(
          `/api/user/predictions?username=${encodeURIComponent(username)}&limit=20&offset=0`,
          { cache: "no-store" }
        );
        const predJson = await predRes.json();
        if (predRes.ok && Array.isArray(predJson?.entries)) {
          setEntries(predJson.entries);
        }

        if (json.status !== "completed") {
          timer = setTimeout(poll, 3000);
        }
      } catch (e: any) {
        setError(e?.message || "Failed to fetch result");
      }
    };

    poll();
    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [gameId]);

  const maxRemaining = useMemo(() => {
    if (!data?.rounds?.length) return 0;
    return Math.max(0, ...data.rounds.map((r) => (typeof r.time_remaining === "number" ? r.time_remaining : 0)));
  }, [data]);

  if (error) return <div className={styles.error}>{error}</div>;
  if (!data) return <div className={styles.state}>Loading...</div>;

  return (
    <section className={styles.wrap}>
      <section className={styles.panel}>
      <div className={styles.score}>You {data.user_score} : {data.ai_score} AI</div>
      <div className={styles.points}>Points: +{data.points_earned}</div>
      {data.status !== "completed" ? (
        <div className={styles.state}>Waiting for market settlement · {formatSeconds(maxRemaining)}</div>
      ) : (
        <div className={styles.done}>Final result settled.</div>
      )}

      <div className={styles.actions}>
        <Link href={`/performance?username=${encodeURIComponent(username)}&focus=${encodeURIComponent(gameId)}`} className={styles.linkBtn}>
          Go to Performance
        </Link>
        <Link href="/" className={styles.linkBtnSecondary}>
          Back to Home
        </Link>
      </div>
      </section>

      <section className={styles.panel}>
        <h3 className={styles.sectionTitle}>Current Prediction Overview</h3>
        <div className={styles.table}>
          <div className={styles.thead}>
            <span>Round Overview</span>
            <span>Your Pick</span>
            <span>AI Pick</span>
            <span>Status</span>
          </div>
          {data.rounds.map((round) => (
            <div className={styles.trow} key={round.round_id}>
              <span className={styles.overview}>
                <strong>Round {round.round_number}</strong> · {round.asset} · {round.timeframe}
                <small>
                  Start {round.start_price} · End {round.end_price ?? "-"}
                </small>
              </span>
              <span>{round.user_prediction || "-"}</span>
              <span>{round.ai_prediction || "-"}</span>
              <span>{roundStatus(round)}</span>
            </div>
          ))}
        </div>
      </section>

      <section className={styles.panel}>
        <h3 className={styles.sectionTitle}>History / Pending Timeline</h3>
        <div className={styles.timeline}>
          {entries.length === 0 ? (
            <div className={styles.state}>No prediction history yet.</div>
          ) : (
            entries.map((g) => (
              <article className={styles.gameCard} key={g.game_id}>
                <div className={styles.gameHead}>
                  <strong>{g.mode} · {g.game_id.slice(0, 8)}...</strong>
                  <span className={styles.gameState}>{g.status}</span>
                </div>
                <div className={styles.gameMeta}>
                  <span>Predict: {formatDateTime(g.created_at)}</span>
                  <span>Settle: {formatDateTime(g.completed_at)}</span>
                  <span>Score: You {g.user_score}:{g.ai_score} AI</span>
                  <span>Points: +{g.points_earned}</span>
                </div>
              </article>
            ))
          )}
        </div>
      </section>
    </section>
  );
}
