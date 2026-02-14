import Link from "next/link";
import styles from "../legal.module.css";

export default function FairPlayPage() {
  return (
    <main className={styles.page}>
      <div className={styles.wrap}>
        <Link href="/" className={styles.back}>← Back</Link>
        <section className={styles.card}>
          <h1 className={styles.title}>Fair Play</h1>
          <p className={styles.updated}>Last updated: February 13, 2026</p>
          <p className={styles.p}>Users and AI are evaluated against the same market windows and close prices. Manipulation, automation abuse, or tampering attempts may lead to restrictions.</p>
        </section>
      </div>
    </main>
  );
}
