import ResultClient from "./ResultClient";
import styles from "./page.module.css";
import Link from "next/link";

export default async function ResultPage({
  params,
  searchParams,
}: {
  params: Promise<{ mode: string; gameId: string }>;
  searchParams: Promise<{ username?: string }>;
}) {
  const { mode, gameId } = await params;
  const query = await searchParams;
  const username = query?.username || "guest-player";

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <Link href={`/play/${mode}`} className={styles.back}>← Lobby</Link>
        <div className={styles.title}>Result · {mode.toUpperCase()}</div>
        <div className={styles.meta}>Game ID: {gameId}</div>
      </header>
      <main className={styles.main}>
        <ResultClient gameId={gameId} username={username} mode={mode} />
      </main>
    </div>
  );
}
