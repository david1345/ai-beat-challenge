import Link from "next/link";
import styles from "./page.module.css";
import ProfileMenu from "@/components/ProfileMenu";

export default function Home() {
  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div className={styles.brand}>AI Beat Challenge</div>
        <nav className={styles.nav}>
          <a className={styles.navLink} href="/leaderboard">Leaderboard</a>
          <a className={styles.navLink} href="/docs">How it works</a>
          <ProfileMenu />
        </nav>
      </header>

      <main className={styles.main}>
        <section className={styles.hero}>
          <div className={styles.heroContent}>
            <p className={styles.kicker}>Predict. Compete. Improve.</p>
            <h1 className={styles.title}>Beat the AI, level up your market sense.</h1>
            <p className={styles.subtitle}>
              You and the AI make the same prediction. The market decides who’s right.
              Climb the leaderboard with every win.
            </p>
            <p className={styles.aiProof}>
              Challenge an AI trained on millions of real‑time market calls.
            </p>
            <div className={styles.ctaRow}>
              <Link className={styles.primary} href="/play">Play vs AI Now</Link>
              <button className={styles.secondary}>Watch Demo</button>
            </div>
            <div className={styles.statsRow}>
              <div>
                <div className={styles.statValue}>3–5 min</div>
                <div className={styles.statLabel}>Typical session</div>
              </div>
              <div>
                <div className={styles.statValue}>100%</div>
                <div className={styles.statLabel}>Skill‑based</div>
              </div>
              <div>
                <div className={styles.statValue}>Leaderboard</div>
                <div className={styles.statLabel}>Bragging rights</div>
              </div>
            </div>
            <div className={styles.badges}>
              <span className={styles.badge}>No cash rewards</span>
              <span className={styles.badgeMuted}>Points fuel your rank</span>
            </div>
          </div>
          <div className={styles.heroCard}>
            <div className={styles.cardHeader}>Today&apos;s Modes</div>
            <Link className={styles.modeCard} href="/play/flash">
              <div className={styles.modeTitle}>⚡ FLASH</div>
              <div className={styles.modeMeta}>Predict in 1m · Play 1 min</div>
              <div className={styles.modeReward}>Reward up to 150pt</div>
            </Link>
            <Link className={styles.modeCard} href="/play/speed">
              <div className={styles.modeTitle}>💎 SPEED</div>
              <div className={styles.modeMeta}>Predict in 3m · Play 3 min</div>
              <div className={styles.modeReward}>Reward up to 300pt</div>
            </Link>
            <Link className={styles.modeCardAlt} href="/play/standard">
              <div className={styles.modeTitle}>🔥 STANDARD</div>
              <div className={styles.modeMeta}>Predict in 5m · Play 5 min</div>
              <div className={styles.modeReward}>Reward up to 500pt</div>
            </Link>
          </div>
        </section>

        <section className={styles.afterSection}>
          <div className={styles.afterHeader}>
            <h2 className={styles.afterTitle}>Inside the arena</h2>
            <p className={styles.afterSubtitle}>
              A live snapshot of what your next battle feels like—activity, stats, and strategy.
            </p>
          </div>
          <div className={styles.afterGrid}>
            <div className={styles.afterCard}>
              <div className={styles.afterCardHeader}>
                <span>Active Battles</span>
                <span className={styles.afterMeta}>Last 60 min</span>
              </div>
              <div className={styles.afterList}>
                <div className={styles.afterRow}>
                  <div>
                    <div className={styles.afterRowTitle}>BTC · FLASH</div>
                    <div className={styles.afterRowMeta}>2m remaining · AI 62%</div>
                  </div>
                  <span className={styles.afterTagUp}>UP</span>
                </div>
                <div className={styles.afterRow}>
                  <div>
                    <div className={styles.afterRowTitle}>ETH · SPEED</div>
                    <div className={styles.afterRowMeta}>4m remaining · AI 58%</div>
                  </div>
                  <span className={styles.afterTagDown}>DOWN</span>
                </div>
                <div className={styles.afterRow}>
                  <div>
                    <div className={styles.afterRowTitle}>SOL · STANDARD</div>
                    <div className={styles.afterRowMeta}>12m remaining · AI 71%</div>
                  </div>
                  <span className={styles.afterTagUp}>UP</span>
                </div>
              </div>
            </div>

            <div className={styles.afterCard}>
              <div className={styles.afterCardHeader}>
                <span>Pulse Mix</span>
                <span className={styles.afterMeta}>Global leaderboard</span>
              </div>
              <div className={styles.afterStats}>
                <div>
                  <div className={styles.afterStatValue}>63%</div>
                  <div className={styles.afterStatLabel}>AI win rate</div>
                </div>
                <div>
                  <div className={styles.afterStatValue}>4.9k</div>
                  <div className={styles.afterStatLabel}>Battles today</div>
                </div>
                <div>
                  <div className={styles.afterStatValue}>+220</div>
                  <div className={styles.afterStatLabel}>Avg pts per win</div>
                </div>
              </div>
              <div className={styles.afterChart}>
                <div className={styles.afterBar} data-tone="up" />
                <div className={styles.afterBar} data-tone="up" />
                <div className={styles.afterBar} data-tone="down" />
                <div className={styles.afterBar} data-tone="up" />
                <div className={styles.afterBar} data-tone="down" />
                <div className={styles.afterBar} data-tone="up" />
                <div className={styles.afterBar} data-tone="up" />
              </div>
            </div>

            <div className={styles.afterCard}>
              <div className={styles.afterCardHeader}>
                <span>Live Feed</span>
                <span className={styles.afterMeta}>Community calls</span>
              </div>
              <div className={styles.feed}>
                <div className={styles.feedItem}>
                  <span className={styles.feedTime}>11:26</span>
                  <span className={styles.feedUser}>Aurora</span>
                  <span className={styles.feedPickUp}>UP</span>
                  <span className={styles.feedAsset}>BTC</span>
                </div>
                <div className={styles.feedItem}>
                  <span className={styles.feedTime}>11:24</span>
                  <span className={styles.feedUser}>Kaito</span>
                  <span className={styles.feedPickDown}>DOWN</span>
                  <span className={styles.feedAsset}>ETH</span>
                </div>
                <div className={styles.feedItem}>
                  <span className={styles.feedTime}>11:21</span>
                  <span className={styles.feedUser}>Nova</span>
                  <span className={styles.feedPickUp}>UP</span>
                  <span className={styles.feedAsset}>SOL</span>
                </div>
              </div>
              <button className={styles.afterButton}>Explore the arena</button>
            </div>
          </div>
        </section>
      </main>

      <footer className={styles.footer}>
        <div className={styles.footerLinks}>
          <Link href="/terms">TERMS</Link>
          <span>•</span>
          <Link href="/privacy">PRIVACY</Link>
          <span>•</span>
          <Link href="/fair-play">FAIR PLAY</Link>
          <span>•</span>
          <Link href="/anti-abuse">ANTI-ABUSE</Link>
          <span>•</span>
          <Link href="/cookies">COOKIES</Link>
          <span>•</span>
          <Link href="/support">SUPPORT</Link>
        </div>
        <div className={styles.footerWarn}>⚠ Entertainment Only · No Financial Advice · 18+ Only</div>
        <div className={styles.footerContact}>support@aibeatchallenge.gg</div>
      </footer>
    </div>
  );
}
