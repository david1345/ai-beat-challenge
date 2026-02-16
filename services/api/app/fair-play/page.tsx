import Link from "next/link";
import styles from "../legal.module.css";

export default function FairPlayPage() {
  return (
    <main className={styles.page}>
      <div className={styles.wrap}>
        <Link href="/" className={styles.back}>
          ← Back
        </Link>
        <section className={styles.card}>
          <h1 className={styles.title}>Fair Play Policy (AI Beat Challenge)</h1>
          <p className={styles.updated}>Last updated: February 13, 2026</p>
          <p className={styles.p}>Our goal is a fair, skill-based experience where users compete under consistent rules.</p>

          <h2 className={styles.sectionTitle}>1. Same Evaluation Standard</h2>
          <p className={styles.p}>User predictions and AI predictions are evaluated using:</p>
          <ul className={styles.list}>
            <li>the same market window for a given game round, and</li>
            <li>the same close price (or defined reference price) for the round.</li>
          </ul>

          <h2 className={styles.sectionTitle}>2. Timing &amp; Server Clock</h2>
          <p className={styles.p}>The Service uses server-side timestamps to determine submission cutoffs and evaluation windows.</p>
          <p className={styles.p}>Network latency may affect what you see locally; the server clock is authoritative.</p>

          <h2 className={styles.sectionTitle}>3. Market Data &amp; Reference Price</h2>
          <p className={styles.p}>Results rely on market data from third-party sources. Data may be delayed or revised. If a data anomaly occurs (e.g., missing candle, extreme outlier, provider outage), we may:</p>
          <ul className={styles.list}>
            <li>pause affected modes,</li>
            <li>mark affected rounds as “void” (no points change), or</li>
            <li>correct outcomes to reflect the best available reference data.</li>
          </ul>

          <h2 className={styles.sectionTitle}>4. Ties and Edge Cases</h2>
          <p className={styles.p}>If the evaluated result is exactly neutral (e.g., no net change within the defined window), we may treat it as:</p>
          <ul className={styles.list}>
            <li>a draw (no points change), or</li>
            <li>a defined default outcome, as specified in the game UI or season rules.</li>
          </ul>

          <h2 className={styles.sectionTitle}>5. Prohibited Advantage</h2>
          <p className={styles.p}>You must not attempt to gain unfair advantage by:</p>
          <ul className={styles.list}>
            <li>automation/bots,</li>
            <li>traffic manipulation,</li>
            <li>reverse engineering internal endpoints,</li>
            <li>exploiting bugs or UI desync.</li>
          </ul>

          <h2 className={styles.sectionTitle}>6. Enforcement</h2>
          <p className={styles.p}>Violations may result in score invalidation, rank removal, restrictions, or bans under the Anti-Abuse policy.</p>

          <h2 className={styles.sectionTitle}>7. Transparency</h2>
          <p className={styles.p}>We may publish additional details about scoring, season resets, data sources, and anti-cheat measures as the Service evolves.</p>

          <p className={styles.p}>
            Questions: <a className={styles.link} href="mailto:support@aibeatchallenge.gg">support@aibeatchallenge.gg</a>
          </p>
        </section>
      </div>
    </main>
  );
}
