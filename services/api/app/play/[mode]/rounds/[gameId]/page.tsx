import Link from "next/link";
import styles from "./page.module.css";
import RoundsClient from "./RoundsClient";

const MODE_TITLE: Record<string, string> = {
  flash: "FLASH",
  speed: "SPEED",
  standard: "STANDARD",
};

export default async function RoundsPage({ params }: { params: Promise<{ mode: string; gameId: string }> }) {
  const { mode, gameId } = await params;
  const normalizedMode = (mode || "flash").toLowerCase();

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <Link href={`/play/${normalizedMode}`} className={styles.back}>← Lobby</Link>
        <div className={styles.headerTitle}>{MODE_TITLE[normalizedMode] || "FLASH"} · Round Picks</div>
        <div className={styles.headerMeta}>Game ID: {gameId.slice(0, 8)}...</div>
      </header>

      <main className={styles.main}>
        <RoundsClient mode={normalizedMode} gameId={gameId} />
      </main>
    </div>
  );
}
