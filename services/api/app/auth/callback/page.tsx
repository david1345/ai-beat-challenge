"use client";

import { useEffect, useState } from "react";
import { getSupabaseBrowserClient } from "@/lib/supabase-browser";

function toUsername(email?: string | null, nickname?: string | null) {
  const base = (nickname || email?.split("@")[0] || "guest-player").trim().toLowerCase();
  return base.replace(/[^a-z0-9._-]/g, "-").slice(0, 32) || "guest-player";
}

export default function AuthCallbackPage() {
  const [status, setStatus] = useState("Signing in...");

  useEffect(() => {
    let cancelled = false;

    const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

    const run = async () => {
      try {
        const supabase = getSupabaseBrowserClient();
        const params = new URLSearchParams(window.location.search);
        const code = params.get("code");

        if (code) {
          const { error } = await supabase.auth.exchangeCodeForSession(code);
          if (error) throw error;
        }

        let sessionUser = null as any;
        for (let i = 0; i < 12; i += 1) {
          const { data } = await supabase.auth.getSession();
          sessionUser = data?.session?.user ?? null;
          if (sessionUser) break;
          await sleep(200);
        }

        if (!sessionUser) {
          throw new Error("No active session after Google login");
        }

        const username = toUsername(sessionUser.email, sessionUser.user_metadata?.nickname);
        if (!cancelled && typeof window !== "undefined") {
          window.localStorage.setItem("abc:username", username);
        }

        setStatus("Success. Redirecting...");
        window.location.replace("/?auth=success");
      } catch (e: any) {
        setStatus(`Sign in failed: ${e?.message || "unknown error"}`);
      }
    };

    run();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <main style={{ minHeight: "100vh", display: "grid", placeItems: "center", background: "#0b0f1a", color: "#e2e8f0" }}>
      <div>{status}</div>
    </main>
  );
}
