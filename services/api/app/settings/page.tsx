"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getSupabaseBrowserClient } from "@/lib/supabase-browser";
import styles from "./settings.module.css";

export default function SettingsPage() {
  const [email, setEmail] = useState("");
  const [nickname, setNickname] = useState("");
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const supabase = getSupabaseBrowserClient();
        const { data } = await supabase.auth.getUser();
        const user = data.user;
        if (!user) {
          setStatus("Sign in first to edit profile.");
          return;
        }
        setEmail(user.email || "");
        setNickname((user.user_metadata?.nickname as string | undefined) || user.email?.split("@")[0] || "");
      } catch (e: any) {
        setStatus(e?.message || "Failed to load settings.");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const save = async () => {
    setStatus("Saving...");
    try {
      const supabase = getSupabaseBrowserClient();
      const { error } = await supabase.auth.updateUser({
        data: { nickname: nickname.trim() }
      });
      if (error) throw error;
      setStatus("Saved.");
    } catch (e: any) {
      setStatus(e?.message || "Failed to save.");
    }
  };

  return (
    <main className={styles.page}>
      <div className={styles.top}><Link href="/">← Back</Link></div>
      <section className={styles.card}>
        <h1>Profile Settings</h1>
        <p className={styles.sub}>Manage your public profile information.</p>

        <label>Nickname</label>
        <input value={nickname} onChange={(e) => setNickname(e.target.value)} disabled={loading} />

        <label>Email</label>
        <input value={email} disabled />

        <button onClick={save} disabled={loading}>Save Changes</button>
        {status ? <div className={styles.status}>{status}</div> : null}
      </section>

      <section className={styles.card}>
        <h2>App Preferences</h2>
        <div className={styles.prefRow}>
          <div>
            <div className={styles.prefTitle}>Notifications</div>
            <div className={styles.prefSub}>Receive alerts for result resolution.</div>
          </div>
          <span className={styles.toggleOn}>ON</span>
        </div>
        <div className={styles.prefRow}>
          <div>
            <div className={styles.prefTitle}>Dark Mode</div>
            <div className={styles.prefSub}>Always on for AI Beat Challenge.</div>
          </div>
          <span className={styles.toggleOn}>ON</span>
        </div>
      </section>
    </main>
  );
}
