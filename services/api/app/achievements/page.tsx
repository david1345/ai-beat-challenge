import Link from "next/link";
import styles from "./page.module.css";
import AchievementsClient from "./AchievementsClient";

export default async function AchievementsPage({
  searchParams,
}: {
  searchParams: Promise<{ username?: string }>;
}) {
  const params = await searchParams;
  const username = params?.username || "guest-player";

  return (
    <main className={styles.page}>
      <div className={styles.wrap}>
        <div className={styles.topBar}>
          <Link href="/" className={styles.back}>← Back</Link>
          <h1 className={styles.title}>Achievements</h1>
        </div>
        <AchievementsClient username={username} />
      </div>
    </main>
  );
}
