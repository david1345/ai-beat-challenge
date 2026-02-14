import Link from "next/link";
import styles from "./page.module.css";
import LobbyClient from "./LobbyClient";

const MODE_COPY: Record<string, { title: string; subtitle: string; timeframes: string; assets: string; modeValue: string }> = {
  flash: {
    title: "FLASH",
    subtitle: "Play 3 min",
    timeframes: "1m chart",
    assets: "Random 3 assets per game",
    modeValue: "FLASH",
  },
  speed: {
    title: "SPEED",
    subtitle: "Play 5 min",
    timeframes: "3m chart",
    assets: "Random 3 assets per game",
    modeValue: "SPEED",
  },
  standard: {
    title: "STANDARD",
    subtitle: "Play 15 min",
    timeframes: "5m chart",
    assets: "Random 3 assets per game",
    modeValue: "STANDARD",
  },
};

export default async function Lobby({ params }: { params: Promise<{ mode: string }> }) {
  const resolvedParams = await params;
  const mode = resolvedParams?.mode ? resolvedParams.mode.toLowerCase() : "flash";
  const copy = MODE_COPY[mode] ?? MODE_COPY.flash;

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <Link href="/play" className={styles.back}>← Modes</Link>
        <div className={styles.headerTitle}>{copy.title}</div>
        <div className={styles.headerMeta}>{copy.subtitle}</div>
      </header>

      <main className={styles.main}>
        <section className={styles.panel}>
          <div className={styles.panelHeader}>Lobby setup</div>
          <div className={styles.controls}>
            <div className={styles.controlCard}>
              <div className={styles.controlLabel}>Assets</div>
              <div className={styles.controlValue}>{copy.assets}</div>
              <div className={styles.controlHint}>Mode preset</div>
            </div>
            <div className={styles.controlCard}>
              <div className={styles.controlLabel}>Rounds</div>
              <div className={styles.controlValue}>3</div>
              <div className={styles.controlHint}>Best of 3</div>
            </div>
            <div className={styles.controlCard}>
              <div className={styles.controlLabel}>Timeframes</div>
              <div className={styles.controlValue}>{copy.timeframes}</div>
              <div className={styles.controlHint}>{copy.subtitle}</div>
            </div>
          </div>

          <LobbyClient modeSlug={mode} modeValue={copy.modeValue} />
        </section>

        <section className={styles.preview}>
          <div className={styles.previewCard}>
            <div className={styles.previewTitle}>AI opponent</div>
            <div className={styles.previewStat}>Win rate: 63%</div>
            <div className={styles.previewMeta}>Analyzes RSI, EMA, MACD, volume</div>
          </div>
          <div className={styles.previewCard}>
            <div className={styles.previewTitle}>Your edge</div>
            <div className={styles.previewStat}>Streak: 2 wins</div>
            <div className={styles.previewMeta}>Points today: +210</div>
          </div>
        </section>
      </main>
    </div>
  );
}
