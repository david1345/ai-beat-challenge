import Link from "next/link";
import styles from "./page.module.css";
import LeaderboardClient from "./LeaderboardClient";

export default function LeaderboardPage() {
  return (
    <main className={styles.page}>
      <div className={styles.wrap}>
        <div className={styles.topBar}>
          <Link href="/" className={styles.back}>← Back</Link>
          <h1 className={styles.title}>Leaderboard</h1>
        </div>
        <LeaderboardClient />
      </div>
    </main>
  );
}
