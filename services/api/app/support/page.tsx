import Link from "next/link";
import styles from "../legal.module.css";

export default function SupportPage() {
  return (
    <main className={styles.page}>
      <div className={styles.wrap}>
        <Link href="/" className={styles.back}>
          ← Back
        </Link>
        <section className={styles.card}>
          <h1 className={styles.title}>Support (AI Beat Challenge)</h1>
          <p className={styles.updated}>Last updated: February 13, 2026</p>
          <p className={styles.p}>Need help, want to report a bug, request account deletion, or report abuse?</p>
          <p className={styles.p}>
            Email: <a className={styles.link} href="mailto:support@aibeatchallenge.gg">support@aibeatchallenge.gg</a>
          </p>

          <p className={styles.p}>When contacting support, please include:</p>
          <ul className={styles.list}>
            <li>the email used to sign in,</li>
            <li>the approximate time of the issue,</li>
            <li>your game ID(s) (if shown),</li>
            <li>screenshots or screen recording (optional).</li>
          </ul>

          <h2 className={styles.sectionTitle}>Common requests</h2>
          <ul className={styles.list}>
            <li>Account deletion: Email us from the address you used to sign in.</li>
            <li>Policy questions: Include a link to the relevant page (Terms/Privacy/etc.).</li>
            <li>Abuse reports: Provide evidence if possible.</li>
          </ul>
        </section>
      </div>
    </main>
  );
}
