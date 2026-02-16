import Link from "next/link";
import styles from "../legal.module.css";

export default function AntiAbusePage() {
  return (
    <main className={styles.page}>
      <div className={styles.wrap}>
        <Link href="/" className={styles.back}>
          ← Back
        </Link>
        <section className={styles.card}>
          <h1 className={styles.title}>Anti-Abuse Policy (AI Beat Challenge)</h1>
          <p className={styles.updated}>Last updated: February 13, 2026</p>
          <p className={styles.p}>We protect fair competition and platform stability.</p>

          <h2 className={styles.sectionTitle}>1. What We Monitor</h2>
          <p className={styles.p}>We may detect and act on:</p>
          <ul className={styles.list}>
            <li>abnormal request rates (bursting, scraping),</li>
            <li>scripted play patterns (automation),</li>
            <li>multi-account evasion or coordinated manipulation,</li>
            <li>exploitation attempts (bugs, injection, tampering),</li>
            <li>harassment or harmful behavior.</li>
          </ul>

          <h2 className={styles.sectionTitle}>2. Prohibited Activities</h2>
          <p className={styles.p}>Examples include:</p>
          <ul className={styles.list}>
            <li>bots/macros to submit predictions,</li>
            <li>attempts to bypass timers, manipulate client code, or alter requests,</li>
            <li>exploiting vulnerability disclosures without responsible reporting,</li>
            <li>impersonation, account trading, or selling ranks/points,</li>
            <li>harassment, hate, threats, or targeted abuse.</li>
          </ul>

          <h2 className={styles.sectionTitle}>3. Enforcement Actions</h2>
          <p className={styles.p}>Depending on severity:</p>
          <ul className={styles.list}>
            <li>warnings and rate limits</li>
            <li>temporary restrictions (cooldowns)</li>
            <li>score/rank invalidation (voided points)</li>
            <li>suspension or termination</li>
            <li>device/account bans</li>
          </ul>
          <p className={styles.p}>We may act immediately without notice to prevent harm.</p>

          <h2 className={styles.sectionTitle}>4. Reporting Abuse</h2>
          <p className={styles.p}>
            Report abuse or security issues via{' '}
            <a className={styles.link} href="mailto:support@aibeatchallenge.gg">support@aibeatchallenge.gg</a>.
          </p>
          <p className={styles.p}>Include:</p>
          <ul className={styles.list}>
            <li>your account email,</li>
            <li>approximate time,</li>
            <li>game ID(s) if available,</li>
            <li>description and screenshots (optional).</li>
          </ul>

          <h2 className={styles.sectionTitle}>5. Responsible Disclosure</h2>
          <p className={styles.p}>
            If you find a security vulnerability, please report it privately. Do not publicly disclose exploit details
            before we have a reasonable chance to address it.
          </p>
        </section>
      </div>
    </main>
  );
}
