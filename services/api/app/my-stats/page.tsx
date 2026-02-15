import PerformanceClient from "@/app/performance/PerformanceClient";
import styles from "@/app/performance/page.module.css";

export default async function MyStatsPage({
  searchParams,
}: {
  searchParams: Promise<{ username?: string }>;
}) {
  const params = await searchParams;
  const username = params?.username || "guest-player";

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div className={styles.title}>My Stats</div>
        <div className={styles.meta}>User: {username}</div>
      </header>
      <main className={styles.main}>
        <PerformanceClient username={username} view="stats" />
      </main>
    </div>
  );
}
