import Link from "next/link";
import styles from "../legal.module.css";

export default function PrivacyPage() {
  return (
    <main className={styles.page}>
      <div className={styles.wrap}>
        <Link href="/" className={styles.back}>← Back</Link>
        <section className={styles.card}>
          <h1 className={styles.title}>Privacy</h1>
          <p className={styles.updated}>Last updated: February 13, 2026</p>
          <p className={styles.p}>We collect account and gameplay data (predictions, scores, timestamps) to run the service, show rankings, and improve quality.</p>
          <p className={styles.p}>We do not sell personal data. You may request account deletion through support.</p>
        </section>
      </div>
    </main>
  );
}
