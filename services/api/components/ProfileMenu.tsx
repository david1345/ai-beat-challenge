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

    supabase.auth.getUser().then(({ data }) => setUser(data.user ?? null));

    const {
      data: { subscription }
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      router.refresh();
    });

    return () => subscription.unsubscribe();
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

  const usernameForRoutes =
    (user?.user_metadata?.nickname as string | undefined)?.trim() ||
    user?.email?.split("@")[0] ||
    "web-player";

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
