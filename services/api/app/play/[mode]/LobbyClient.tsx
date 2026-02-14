"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

const DEFAULT_USERNAME = "web-player";
import styles from "./page.module.css";

export default function LobbyClient({ modeSlug, modeValue }: { modeSlug: string; modeValue: string }) {
  const router = useRouter();
  const [isStarting, setIsStarting] = useState(false);
  const [error, setError] = useState("");

  const getUsername = () => {
    if (typeof window === "undefined") return DEFAULT_USERNAME;
    const saved = window.localStorage.getItem("abc:username");
    if (saved && saved.trim()) return saved.trim();
    window.localStorage.setItem("abc:username", DEFAULT_USERNAME);
    return DEFAULT_USERNAME;
  };

  const handleStartBattle = async () => {
    setError("");
    setIsStarting(true);

    try {
      const username = getUsername();
      const response = await fetch("/api/game/start", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username,
          mode: modeValue,
        }),
      });

      const payload = await response.json();

      if (!response.ok) {
        throw new Error(payload?.error || "Failed to start battle");
      }

      if (typeof window !== "undefined") {
        window.localStorage.setItem("abc:username", username);
        sessionStorage.setItem(`game:${payload.game_id}`, JSON.stringify(payload));
      }

      router.push(`/play/${modeSlug}/rounds/${payload.game_id}?username=${encodeURIComponent(username)}`);
    } catch (e: any) {
      setError(e?.message || "Failed to start battle");
      setIsStarting(false);
    }
  };

  return (
    <div className={styles.panelFooterWrap}>
      <div className={styles.panelFooter}>
        <button className={styles.primary} onClick={handleStartBattle} disabled={isStarting}>
          {isStarting ? "Starting..." : "Start battle"}
        </button>
        <button className={styles.secondary} onClick={() => router.push("/play")}>Adjust settings</button>
      </div>
      {error ? <div className={styles.inlineError}>{error}</div> : null}
    </div>
  );
}
