"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import styles from "./page.module.css";

type Round = {
  round_id: string;
  asset: string;
  timeframe: string;
  current_price?: number;
  start_price?: number;
};

type StartPayload = {
  game_id: string;
  mode: string;
  rounds: Round[];
};

const BASE_POINTS: Record<string, number> = {
  flash: 100,
  speed: 150,
  standard: 250,
};

function getTvInterval(timeframe: string) {
  if (timeframe.endsWith("m")) return timeframe.replace("m", "");
  if (timeframe.endsWith("h")) return (Number(timeframe.replace("h", "")) * 60).toString();
  return "5";
}

function buildWidgetUrl(symbol: string, timeframe: string) {
  const interval = getTvInterval(timeframe);
  const params = new URLSearchParams({
    symbol: `BINANCE:${symbol}`,
    interval,
    theme: "dark",
    style: "1",
    timezone: "Etc/UTC",
    hide_top_toolbar: "0",
    hide_legend: "0",
    saveimage: "0",
    withdateranges: "0",
    studies: "",
  });
  return `https://s.tradingview.com/widgetembed/?${params.toString()}`;
}

export default function RoundsClient({ mode, gameId }: { mode: string; gameId: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [rounds, setRounds] = useState<Round[]>([]);
  const [predictions, setPredictions] = useState<Record<string, "UP" | "DOWN">>({});
  const [submitState, setSubmitState] = useState<"idle" | "submitting" | "done">("idle");
  const [username, setUsername] = useState("web-player");
  const [activeRoundIndex, setActiveRoundIndex] = useState(0);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const url = new URL(window.location.href);
    const qUsername = url.searchParams.get("username");
    if (qUsername && qUsername.trim()) {
      setUsername(qUsername.trim());
      window.localStorage.setItem("abc:username", qUsername.trim());
      return;
    }
    const saved = window.localStorage.getItem("abc:username");
    if (saved && saved.trim()) setUsername(saved.trim());
  }, []);

  useEffect(() => {
    const load = async () => {
      try {
        const cached = typeof window !== "undefined" ? sessionStorage.getItem(`game:${gameId}`) : null;
        if (cached) {
          const parsed = JSON.parse(cached) as StartPayload;
          if (Array.isArray(parsed?.rounds) && parsed.rounds.length > 0) {
            setRounds(parsed.rounds);
            setLoading(false);
            return;
          }
        }

        const res = await fetch(`/api/game/result?game_id=${gameId}`);
        const json = await res.json();
        if (!res.ok) throw new Error(json?.error || "Failed to load rounds");

        const fallbackRounds = (json.rounds || []).map((r: any) => ({
          round_id: r.round_id,
          asset: r.asset,
          timeframe: r.timeframe,
          start_price: r.start_price,
        }));

        if (!fallbackRounds.length) throw new Error("No rounds found for this game");
        setRounds(fallbackRounds);
      } catch (e: any) {
        setError(e?.message || "Failed to load rounds");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [gameId]);

  useEffect(() => {
    fetch("/api/game/predict", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ game_id: gameId }),
    }).catch(() => null);
  }, [gameId]);

  const allSelected = useMemo(
    () => rounds.length > 0 && rounds.every((r) => predictions[r.round_id]),
    [rounds, predictions]
  );

  const activeRound = rounds[activeRoundIndex];
  const base = BASE_POINTS[mode] ?? 100;
  const expectedPoints = [
    { score: "1:0", points: Math.round((base * 1) / 3) },
    { score: "2:0", points: Math.round((base * 2) / 3) },
    { score: "3:0", points: base },
  ];

  const selectRound = (index: number) => {
    setActiveRoundIndex(index);
  };

  const pickDirection = (round: Round, direction: "UP" | "DOWN", index: number) => {
    if (index > 0 && !predictions[rounds[index - 1].round_id]) return;
    setPredictions((prev) => ({ ...prev, [round.round_id]: direction }));
    if (index < rounds.length - 1) setActiveRoundIndex(index + 1);
  };

  const submitPredictions = async () => {
    if (!allSelected || submitState === "submitting") return;
    setError("");
    setSubmitState("submitting");
    try {
      const payload = {
        game_id: gameId,
        predictions: rounds.map((round) => ({
          round_id: round.round_id,
          direction: predictions[round.round_id],
        })),
      };

      const res = await fetch("/api/game/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.error || "Failed to submit predictions");
      setSubmitState("done");
      router.push(`/play/${mode}/rounds/${gameId}/result?username=${encodeURIComponent(username)}`);
    } catch (e: any) {
      setError(e?.message || "Failed to submit predictions");
      setSubmitState("idle");
    }
  };

  if (loading) return <div className={styles.state}>Loading rounds...</div>;
  if (error && !rounds.length) return <div className={styles.stateError}>{error}</div>;

  return (
    <section className={styles.dualPanel}>
      <div className={styles.orderPanel}>
        <div className={styles.panelHeader}>
          <div className={styles.panelTitle}>Forecast Ticket · {mode.toUpperCase()}</div>
          <div className={styles.panelMeta}>Pick Round 1 → Round 2 → Round 3</div>
        </div>

        <div className={styles.roundRows}>
          {rounds.map((round, index) => {
            const selected = predictions[round.round_id];
            const enabled = index === 0 || Boolean(predictions[rounds[index - 1].round_id]);
            return (
              <div key={round.round_id} className={`${styles.roundRow} ${activeRoundIndex === index ? styles.roundRowActive : ""}`}>
                <button className={styles.roundBtn} onClick={() => enabled && selectRound(index)} disabled={!enabled}>
                  Round {index + 1} · {round.asset} · {round.timeframe}
                </button>
                <div className={styles.pickButtons}>
                  <button
                    className={`${styles.pickBtn} ${selected === "UP" ? styles.activeUp : ""}`}
                    disabled={!enabled}
                    onClick={() => pickDirection(round, "UP", index)}
                  >
                    UP
                  </button>
                  <button
                    className={`${styles.pickBtn} ${selected === "DOWN" ? styles.activeDown : ""}`}
                    disabled={!enabled}
                    onClick={() => pickDirection(round, "DOWN", index)}
                  >
                    DOWN
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        <div className={styles.rewardCard}>
          <div className={styles.rewardTitle}>Expected Reward</div>
          {expectedPoints.map((x) => (
            <div key={x.score} className={styles.rewardRow}>
              <span>Lead {x.score}</span>
              <strong>+{x.points} pt</strong>
            </div>
          ))}
        </div>

        <div className={styles.footer}>
          <button className={styles.submit} disabled={!allSelected || submitState === "submitting"} onClick={submitPredictions}>
            {submitState === "submitting" ? "Submitting..." : allSelected ? "Prediction Complete" : "Pick all rounds"}
          </button>
          {error ? <div className={styles.inlineError}>{error}</div> : null}
        </div>
      </div>

      <div className={styles.chartPanel}>
        {activeRound ? (
          <>
            <div className={styles.chartHeader}>
              <div>{activeRound.asset}</div>
              <div>{activeRound.timeframe} chart</div>
            </div>
            <iframe
              key={`${activeRound.asset}-${activeRound.timeframe}`}
              className={styles.tvFrame}
              src={buildWidgetUrl(activeRound.asset, activeRound.timeframe)}
              title={`chart-${activeRound.asset}`}
              loading="lazy"
            />
          </>
        ) : null}
      </div>
    </section>
  );
}
