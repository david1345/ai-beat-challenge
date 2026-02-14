import Link from "next/link";
import styles from "../legal.module.css";

export default function AntiAbusePage() {
  return (
    <main className={styles.page}>
      <div className={styles.wrap}>
        <Link href="/" className={styles.back}>← Back</Link>
        <section className={styles.card}>
          <h1 className={styles.title}>Anti-Abuse</h1>
          <p className={styles.updated}>Last updated: February 13, 2026</p>
          <p className={styles.p}>We monitor abnormal request rates, scripted behavior, and exploit attempts. Accounts may be rate limited, suspended, or removed to protect fair competition.</p>
        </section>
      </div>
    </main>
  );
}
