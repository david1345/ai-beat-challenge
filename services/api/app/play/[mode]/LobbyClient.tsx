"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { getSupabaseBrowserClient } from "@/lib/supabase-browser";
import styles from "./page.module.css";

const DEFAULT_USERNAME = "guest-player";

function normalizeUsername(raw?: string | null) {
  const v = (raw || "").trim().toLowerCase().replace(/[^a-z0-9._-]/g, "-").slice(0, 32);
  return v || DEFAULT_USERNAME;
}

export default function LobbyClient({ modeSlug, modeValue }: { modeSlug: string; modeValue: string }) {
  const router = useRouter();
  const [isStarting, setIsStarting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (typeof window === "undefined") return;
    const saved = window.localStorage.getItem("abc:username");
    if (saved?.trim()) return;

    const sync = async () => {
      try {
        const supabase = getSupabaseBrowserClient();
        const { data } = await supabase.auth.getSession();
        const user = data?.session?.user;
        if (!user) return;
        const next = normalizeUsername((user.user_metadata?.nickname as string | undefined) || user.email?.split("@")[0]);
        window.localStorage.setItem("abc:username", next);
      } catch {
        // noop
      }
    };

    sync();
  }, []);

  const getUsername = async () => {
    if (typeof window === "undefined") return DEFAULT_USERNAME;

    const saved = window.localStorage.getItem("abc:username");
    if (saved && saved.trim()) return normalizeUsername(saved);

    try {
      const supabase = getSupabaseBrowserClient();
      const { data } = await supabase.auth.getSession();
      const user = data?.session?.user;
      if (user) {
        const username = normalizeUsername((user.user_metadata?.nickname as string | undefined) || user.email?.split("@")[0]);
        window.localStorage.setItem("abc:username", username);
        return username;
      }
    } catch {
      // noop
    }

    const guest = `${DEFAULT_USERNAME}-${Math.random().toString(36).slice(2, 8)}`;
    window.localStorage.setItem("abc:username", guest);
    return guest;
  };

  const handleStartBattle = async () => {
    setError("");
    setIsStarting(true);

    try {
      const username = await getUsername();
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
