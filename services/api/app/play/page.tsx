import Link from "next/link";
import styles from "./page.module.css";

const modes = [
  {
    key: "flash",
    title: "FLASH",
    emoji: "⚡",
    subtitle: "Play 3 min · 1m chart",
    reward: "Reward up to 150pt",
  },
  {
    key: "speed",
    title: "SPEED",
    emoji: "💎",
    subtitle: "Play 5 min · 3m chart",
    reward: "Reward up to 300pt",
  },
  {
    key: "standard",
    title: "STANDARD",
    emoji: "🔥",
    subtitle: "Play 15 min · 5m chart",
    reward: "Reward up to 500pt",
  },
];

export default function Play() {
  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <Link href="/" className={styles.brand}>AI Beat Challenge</Link>
        <div className={styles.headerMeta}>
          <Link href="/performance?username=web-player" className={styles.metaLink}>Performance</Link>
        </div>
      </header>

      <main className={styles.main}>
        <div className={styles.hero}>
          <h1>Choose your challenge</h1>
          <p>Short, skill-based rounds. The market decides who wins.</p>
        </div>

        <div className={styles.grid}>
          {modes.map((mode) => (
            <Link key={mode.key} href={`/play/${mode.key}`} className={styles.card}>
              <div className={styles.cardTitle}>
                <span className={styles.cardEmoji}>{mode.emoji}</span>
                {mode.title}
              </div>
              <div className={styles.cardSubtitle}>{mode.subtitle}</div>
              <div className={styles.cardReward}>{mode.reward}</div>
              <div className={styles.cardCta}>Select →</div>
            </Link>
          ))}
        </div>
      </main>
    </div>
  );
}
