import Link from "next/link";
import CheckClient from "./CheckClient";
import styles from "./page.module.css";

export default async function CheckPage({
  params,
  searchParams,
}: {
  params: Promise<{ mode: string; gameId: string }>;
  searchParams: Promise<{ username?: string }>;
}) {
  const { mode, gameId } = await params;
  const query = await searchParams;
  const username = query?.username || "web-player";

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <Link href={`/play/${mode}/rounds/${gameId}/result?username=${encodeURIComponent(username)}`} className={styles.back}>
          ← Back
        </Link>
        <div className={styles.title}>Result Check · {mode.toUpperCase()}</div>
        <div className={styles.meta}>Game ID: {gameId.slice(0, 8)}...</div>
      </header>

      <main className={styles.main}>
        <CheckClient gameId={gameId} username={username} />
      </main>
    </div>
  );
}
