"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import type { User } from "@supabase/supabase-js";
import { getSupabaseBrowserClient } from "@/lib/supabase-browser";
import styles from "./ProfileMenu.module.css";

export default function ProfileMenu() {
  const router = useRouter();
  const panelRef = useRef<HTMLDivElement | null>(null);
  const [open, setOpen] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const supabase = getSupabaseBrowserClient();

    const syncUser = async () => {
      const { data: sessionData } = await supabase.auth.getSession();
      if (sessionData?.session?.user) {
        setUser(sessionData.session.user);
        return true;
      }

      const { data } = await supabase.auth.getUser();
      setUser(data.user ?? null);
      return Boolean(data.user);
    };

    const syncWithRetry = async (retries = 10, delayMs = 250) => {
      for (let i = 0; i < retries; i += 1) {
        const ok = await syncUser();
        if (ok) return;
        await new Promise((resolve) => setTimeout(resolve, delayMs));
      }
    };

    syncWithRetry();

    const params = new URLSearchParams(window.location.search);
    if (params.get("auth") === "success") {
      syncWithRetry(20, 250).finally(() => {
        const clean = new URL(window.location.href);
        clean.searchParams.delete("auth");
        window.history.replaceState({}, "", clean.toString());
      });
    }

    const onFocus = () => {
      syncWithRetry(4, 200);
    };

    window.addEventListener("focus", onFocus);
    document.addEventListener("visibilitychange", onFocus);

    const {
      data: { subscription }
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      router.refresh();
    });

    return () => {
      window.removeEventListener("focus", onFocus);
      document.removeEventListener("visibilitychange", onFocus);
      subscription.unsubscribe();
    };
  }, [router]);

  useEffect(() => {
    const onDocClick = (e: MouseEvent) => {
      if (!panelRef.current) return;
      if (!panelRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, []);

  const label = useMemo(() => {
    if (!user) return "G";
    const nick = (user.user_metadata?.nickname as string | undefined)?.trim();
    if (nick) return nick.slice(0, 1).toUpperCase();
    if (user.email) return user.email.slice(0, 1).toUpperCase();
    return "U";
  }, [user]);

  const displayName =
    (user?.user_metadata?.nickname as string | undefined)?.trim() || user?.email?.split("@")[0] || "Guest";

const resolvedUsername =
    ((user?.user_metadata?.nickname as string | undefined)?.trim() || user?.email?.split("@")[0] || "guest-player")
      .toLowerCase()
      .replace(/[^a-z0-9._-]/g, "-")
      .slice(0, 32) || "guest-player";

  const usernameForRoutes = resolvedUsername;

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (user) {
      window.localStorage.setItem("abc:username", resolvedUsername);
    } else {
      window.localStorage.removeItem("abc:username");
    }
  }, [user, resolvedUsername]);

  const signInGoogle = async () => {
    setLoading(true);
    setError("");
    try {
      const supabase = getSupabaseBrowserClient();
      const { error: signInError } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/auth/callback`
        }
      });
      if (signInError) throw signInError;
    } catch (e: any) {
      setError(e?.message || "Google sign in failed");
      setLoading(false);
    }
  };

  const signOut = async () => {
    const supabase = getSupabaseBrowserClient();
    await supabase.auth.signOut();
    if (typeof window !== "undefined") window.localStorage.removeItem("abc:username");
    setOpen(false);
    router.refresh();
  };

  return (
    <div className={styles.wrap} ref={panelRef}>
      {user ? (
        <>
          <button className={styles.trigger} onClick={() => setOpen((v) => !v)} aria-label="Open profile menu">
            {label}
          </button>
          {open ? (
            <div className={styles.menu}>
              <div className={styles.userHead}>
                <div className={styles.userName}>{displayName}</div>
                <div className={styles.userEmail}>{user.email}</div>
              </div>

              <Link className={styles.item} href="/leaderboard" onClick={() => setOpen(false)}>
                🏆 Leaderboard
              </Link>
              <Link className={styles.item} href={`/my-stats?username=${encodeURIComponent(usernameForRoutes)}`} onClick={() => setOpen(false)}>
                📈 My Stats
              </Link>
              <Link className={styles.item} href={`/match-history?username=${encodeURIComponent(usernameForRoutes)}`} onClick={() => setOpen(false)}>
                🧾 Match History
              </Link>
              <Link className={styles.item} href={`/achievements?username=${encodeURIComponent(usernameForRoutes)}`} onClick={() => setOpen(false)}>
                🏅 Achievements
              </Link>
              <Link className={styles.item} href="/settings" onClick={() => setOpen(false)}>
                ⚙️ Settings
              </Link>

              <button className={styles.logout} onClick={signOut}>
                ↪ Log Out
              </button>
            </div>
          ) : null}
        </>
      ) : (
        <div className={styles.signInWrap}>
          <button className={styles.signInBtn} onClick={signInGoogle} disabled={loading}>
            {loading ? "Connecting..." : "Sign in with Google"}
          </button>
          {error ? <div className={styles.error}>{error}</div> : null}
        </div>
      )}
    </div>
  );
}
