import PerformanceClient from "@/app/performance/PerformanceClient";
import styles from "@/app/performance/page.module.css";

export default async function MatchHistoryPage({
  searchParams,
}: {
  searchParams: Promise<{ username?: string; focus?: string }>;
}) {
  const params = await searchParams;
  const username = params?.username || "web-player";
  const focusGameId = params?.focus || "";

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div className={styles.title}>Match History</div>
        <div className={styles.meta}>User: {username}</div>
      </header>
      <main className={styles.main}>
        <PerformanceClient username={username} focusGameId={focusGameId} view="history" />
      </main>
    </div>
  );
}
