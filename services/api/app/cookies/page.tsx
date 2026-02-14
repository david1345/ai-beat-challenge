import Link from "next/link";
import styles from "../legal.module.css";

export default function CookiesPage() {
  return (
    <main className={styles.page}>
      <div className={styles.wrap}>
        <Link href="/" className={styles.back}>← Back</Link>
        <section className={styles.card}>
          <h1 className={styles.title}>Cookies</h1>
          <p className={styles.updated}>Last updated: February 13, 2026</p>
          <p className={styles.p}>Cookies are used for sign-in sessions, security checks, and improving product experience. You can control cookies in your browser settings.</p>
        </section>
      </div>
    </main>
  );
}
