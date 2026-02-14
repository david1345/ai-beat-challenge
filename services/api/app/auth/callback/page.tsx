"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getSupabaseBrowserClient } from "@/lib/supabase-browser";

export default function AuthCallbackPage() {
  const router = useRouter();
  const [status, setStatus] = useState("Signing in...");

  useEffect(() => {
    const run = async () => {
      try {
        const params = new URLSearchParams(window.location.search);
        const code = params.get("code");
        if (code) {
          const supabase = getSupabaseBrowserClient();
          const { error } = await supabase.auth.exchangeCodeForSession(code);
          if (error) throw error;
        }
        setStatus("Success. Redirecting...");
        router.replace("/");
      } catch (e: any) {
        setStatus(`Sign in failed: ${e?.message || "unknown error"}`);
      }
    };
    run();
  }, [router]);

  return (
    <main style={{ minHeight: "100vh", display: "grid", placeItems: "center", background: "#0b0f1a", color: "#e2e8f0" }}>
      <div>{status}</div>
    </main>
  );
}
