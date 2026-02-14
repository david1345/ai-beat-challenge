import Link from "next/link";
import styles from "../legal.module.css";

export default function TermsPage() {
  return (
    <main className={styles.page}>
      <div className={styles.wrap}>
        <Link href="/" className={styles.back}>← Back</Link>
        <section className={styles.card}>
          <h1 className={styles.title}>Terms</h1>
          <p className={styles.updated}>Last updated: February 13, 2026</p>
          <h2 className={styles.sectionTitle}>1. Service scope</h2>
          <p className={styles.p}>AI Beat Challenge is a skill-based market prediction game for entertainment and learning. No real-money payouts are provided.</p>
          <h2 className={styles.sectionTitle}>2. Eligibility</h2>
          <p className={styles.p}>You must be 18+ and comply with local laws when accessing the service.</p>
          <h2 className={styles.sectionTitle}>3. Points and rankings</h2>
          <p className={styles.p}>Points are in-app only, non-transferable, and have no monetary value.</p>
        </section>
      </div>
    </main>
  );
}
