import Link from "next/link";
import styles from "../legal.module.css";

export default function SupportPage() {
  return (
    <main className={styles.page}>
      <div className={styles.wrap}>
        <Link href="/" className={styles.back}>← Back</Link>
        <section className={styles.card}>
          <h1 className={styles.title}>Support</h1>
          <p className={styles.updated}>Last updated: February 13, 2026</p>
          <p className={styles.p}>Need help? Contact: support@aibeatchallenge.gg</p>
          <p className={styles.p}>For account, policy, or abuse reports, include your email and recent game ID.</p>
        </section>
      </div>
    </main>
  );
}
