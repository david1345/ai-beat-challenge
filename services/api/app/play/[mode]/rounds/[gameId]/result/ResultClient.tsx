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
  result: string;
  time_remaining?: number;
  evaluation_candle?: {
    open_at: string;
    close_at: string;
  };
};

type ResultPayload = {
  status: "pending" | "completed";
  user_score: number;
  ai_score: number;
  points_earned: number;
  rounds: Round[];
};

function formatSeconds(totalSeconds: number) {
  const mins = Math.floor(totalSeconds / 60);
  const secs = totalSeconds % 60;
  return `${mins}:${String(secs).padStart(2, "0")}`;
}

export default function ResultClient({ gameId, username, mode }: { gameId: string; username: string; mode: string }) {
  const [data, setData] = useState<ResultPayload | null>(null);
  const [error, setError] = useState("");
  const [analyzing, setAnalyzing] = useState(true);
  const [pulse, setPulse] = useState(0);
  const [polling, setPolling] = useState(true);

  const fetchResult = async () => {
    const res = await fetch(`/api/game/result?game_id=${gameId}`, { cache: "no-store" });
    const json = await res.json();
    if (!res.ok) throw new Error(json?.error || "Failed to fetch result");
    setData(json);
    return json as ResultPayload;
  };

  useEffect(() => {
    const phaseTimer = setTimeout(() => setAnalyzing(false), 4200);
    const pulseTimer = setInterval(() => {
      setPulse((v) => (v + 1) % 3);
    }, 450);

    return () => {
      clearTimeout(phaseTimer);
      clearInterval(pulseTimer);
    };
  }, []);

  useEffect(() => {
    let timer: NodeJS.Timeout | null = null;

    const poll = async () => {
      try {
        const json = await fetchResult();
        if (polling && json.status !== "completed") {
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
  }, [gameId, polling]);

  const maxRemaining = useMemo(() => {
    if (!data?.rounds?.length) return 0;
    return Math.max(0, ...data.rounds.map((r) => (typeof r.time_remaining === "number" ? r.time_remaining : 0)));
  }, [data]);


  if (error) return <div className={styles.error}>{error}</div>;
  if (!data) return <div className={styles.state}>Loading result...</div>;

  if (analyzing) {
    return (
      <section className={styles.panel}>
        <div className={styles.analysisCard}>
          <div className={styles.analysisTitle}>AI is analyzing technical signals{".".repeat(pulse + 1)}</div>
          <div className={styles.analysisSub}>Scanning structure, momentum, volatility, and key levels.</div>
        </div>
      </section>
    );
  }

  return (
    <section className={styles.panel}>
      <div className={styles.score}>You {data.user_score} : {data.ai_score} AI</div>
      <div className={styles.points}>Points: +{data.points_earned}</div>

      {data.status !== "completed" ? (
        <div className={styles.state}>Settlement pending · next resolve in {formatSeconds(maxRemaining)}</div>
      ) : (
        <div className={styles.done}>Settlement complete.</div>
      )}

      <div className={styles.actions}>
        <Link href={`/play/${mode}/rounds/${gameId}/check?username=${encodeURIComponent(username)}`} className={styles.linkBtn}>
          Check Result
        </Link>
        <Link href="/" className={styles.linkBtnSecondary}>Back to Home</Link>
      </div>

      <div className={styles.tableWrap}>
        <table className={styles.table}>
          <colgroup>
            <col className={styles.colOverview} />
            <col className={styles.colUser} />
            <col className={styles.colAiPick} />
            <col className={styles.colAnalysis} />
          </colgroup>
          <thead>
            <tr>
              <th>Round Overview</th>
              <th>Your Pick</th>
              <th>AI Pick</th>
              <th>AI Analysis</th>
            </tr>
          </thead>
          <tbody>
            {data.rounds.map((r) => (
              <tr key={r.round_id}>
                <td>
                  <div className={styles.overviewMain}>Round {r.round_number} · {r.asset} · {r.timeframe}</div>
                  <div className={styles.overviewSub}>Start {r.start_price} · End {r.end_price ?? "pending"}</div>
                  {r.evaluation_candle ? (
                    <div className={styles.overviewSub}>
                      Eval {new Date(r.evaluation_candle.open_at).toLocaleTimeString()} → {new Date(r.evaluation_candle.close_at).toLocaleTimeString()}
                    </div>
                  ) : null}
                  <div className={styles.overviewSub}>Result: {r.result}</div>
                </td>
                <td>{r.user_prediction ?? "-"}</td>
                <td>{r.ai_prediction ?? "-"}</td>
                <td>
                  <div className={styles.analysisLine}>Confidence: {r.ai_confidence ?? "-"}{typeof r.ai_confidence === "number" ? "%" : ""}</div>
                  <div className={styles.analysisLine}>{r.ai_reasoning || "Pending AI analysis"}</div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
