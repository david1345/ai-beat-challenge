import Link from "next/link";
import styles from "../legal.module.css";

export default function CookiesPage() {
  return (
    <main className={styles.page}>
      <div className={styles.wrap}>
        <Link href="/" className={styles.back}>
          ← Back
        </Link>
        <section className={styles.card}>
          <h1 className={styles.title}>Cookies Policy (AI Beat Challenge)</h1>
          <p className={styles.updated}>Last updated: February 13, 2026</p>
          <p className={styles.p}>We use cookies and similar technologies to operate the Service.</p>

          <h2 className={styles.sectionTitle}>1. What Are Cookies?</h2>
          <p className={styles.p}>
            Cookies are small text files stored by your browser. Some are essential for sign-in and security.
          </p>

          <h2 className={styles.sectionTitle}>2. Types of Cookies We Use</h2>
          <h2 className={styles.sectionTitle}>A) Strictly Necessary</h2>
          <p className={styles.p}>Used for:</p>
          <ul className={styles.list}>
            <li>authentication sessions,</li>
            <li>security and fraud prevention,</li>
            <li>load balancing and basic functionality.</li>
          </ul>

          <h2 className={styles.sectionTitle}>B) Preferences (Optional)</h2>
          <p className={styles.p}>Used to remember settings (e.g., UI preferences) if implemented.</p>

          <h2 className={styles.sectionTitle}>C) Analytics (Optional)</h2>
          <p className={styles.p}>Used to understand feature usage and improve the Service, if enabled.</p>

          <h2 className={styles.sectionTitle}>3. Your Controls</h2>
          <p className={styles.p}>
            You can control cookies via your browser settings, including blocking or deleting cookies. Note: blocking
            necessary cookies may prevent sign-in or break core functionality.
          </p>

          <h2 className={styles.sectionTitle}>4. Updates</h2>
          <p className={styles.p}>We may update this policy as cookie usage changes.</p>

          <p className={styles.p}>
            Contact: <a className={styles.link} href="mailto:support@aibeatchallenge.gg">support@aibeatchallenge.gg</a>
          </p>
        </section>
      </div>
    </main>
  );
}
