import Link from "next/link";
import styles from "../legal.module.css";

export default function PrivacyPage() {
  return (
    <main className={styles.page}>
      <div className={styles.wrap}>
        <Link href="/" className={styles.back}>
          ← Back
        </Link>
        <section className={styles.card}>
          <h1 className={styles.title}>Privacy Policy (AI Beat Challenge)</h1>
          <p className={styles.updated}>Last updated: February 13, 2026</p>
          <p className={styles.p}>
            This Privacy Policy explains how AI Beat Challenge ("we", "us") collects, uses, and shares information
            when you use the Service.
          </p>

          <h2 className={styles.sectionTitle}>1. Information We Collect</h2>
          <h2 className={styles.sectionTitle}>A) Account Information</h2>
          <p className={styles.p}>When you sign in (e.g., via Google), we may receive:</p>
          <ul className={styles.list}>
            <li>email address,</li>
            <li>display name,</li>
            <li>profile image (if provided),</li>
            <li>a provider user ID (for authentication).</li>
          </ul>

          <h2 className={styles.sectionTitle}>B) Gameplay and Usage Data</h2>
          <p className={styles.p}>We collect data needed to operate the Service, such as:</p>
          <ul className={styles.list}>
            <li>predictions submitted, timestamps, selected mode/timeframe,</li>
            <li>results, points earned, rank/season data,</li>
            <li>session identifiers, device/browser information,</li>
            <li>approximate location derived from IP (country/region level),</li>
            <li>logs for security, debugging, and abuse prevention.</li>
          </ul>

          <h2 className={styles.sectionTitle}>C) Support Communications</h2>
          <p className={styles.p}>
            If you contact support, we collect the information you submit (e.g., email, message contents, game IDs).
          </p>

          <h2 className={styles.sectionTitle}>2. How We Use Information</h2>
          <p className={styles.p}>We use information to:</p>
          <ul className={styles.list}>
            <li>authenticate users and provide the Service,</li>
            <li>calculate results, points, and rankings,</li>
            <li>prevent fraud, abuse, and security incidents,</li>
            <li>improve performance, reliability, and user experience,</li>
            <li>communicate about updates, policy changes, or support requests.</li>
          </ul>

          <h2 className={styles.sectionTitle}>3. Legal Bases (Where Applicable)</h2>
          <p className={styles.p}>Depending on your location, we process data based on:</p>
          <ul className={styles.list}>
            <li>performance of a contract (providing the Service),</li>
            <li>legitimate interests (security, fraud prevention, service improvement),</li>
            <li>consent (where required, e.g., certain cookies/analytics),</li>
            <li>legal obligations.</li>
          </ul>

          <h2 className={styles.sectionTitle}>4. Sharing of Information</h2>
          <p className={styles.p}>We do not sell personal data.</p>
          <p className={styles.p}>We may share information with:</p>
          <ul className={styles.list}>
            <li>service providers (hosting, analytics, email/support tooling) who process data on our behalf,</li>
            <li>identity providers (e.g., Google) as part of sign-in,</li>
            <li>law enforcement or regulators when required by law,</li>
            <li>to protect rights and safety (fraud/security investigations).</li>
          </ul>
          <p className={styles.p}>
            We may publish leaderboard information (e.g., display name, avatar, rank, points) as part of the
            Service&apos;s core functionality.
          </p>

          <h2 className={styles.sectionTitle}>5. Data Retention</h2>
          <p className={styles.p}>We retain data as long as necessary to:</p>
          <ul className={styles.list}>
            <li>operate the Service,</li>
            <li>comply with legal obligations,</li>
            <li>resolve disputes,</li>
            <li>enforce policies.</li>
          </ul>
          <p className={styles.p}>We may retain certain security logs for a limited period to prevent abuse.</p>

          <h2 className={styles.sectionTitle}>6. Your Choices and Rights</h2>
          <p className={styles.p}>You may:</p>
          <ul className={styles.list}>
            <li>
              request account deletion by contacting{' '}
              <a className={styles.link} href="mailto:support@aibeatchallenge.gg">support@aibeatchallenge.gg</a>
            </li>
            <li>manage cookies via browser settings (see Cookies Policy).</li>
          </ul>
          <p className={styles.p}>
            Where applicable (e.g., GDPR/CCPA), you may have rights to access, correct, delete, or restrict
            processing. We will respond as required by law.
          </p>

          <h2 className={styles.sectionTitle}>7. International Transfers</h2>
          <p className={styles.p}>
            If you access the Service from outside the country where our servers/providers are located, your data may
            be processed internationally. We use appropriate safeguards where required.
          </p>

          <h2 className={styles.sectionTitle}>8. Security</h2>
          <p className={styles.p}>
            We use reasonable administrative, technical, and organizational measures to protect information. No method
            of transmission or storage is 100% secure.
          </p>

          <h2 className={styles.sectionTitle}>9. Children&apos;s Privacy</h2>
          <p className={styles.p}>The Service is intended for users 18+. We do not knowingly collect personal data from children.</p>

          <h2 className={styles.sectionTitle}>10. Changes to This Policy</h2>
          <p className={styles.p}>
            We may update this Privacy Policy from time to time. We will update the “Last updated” date and, when
            appropriate, provide additional notice.
          </p>

          <h2 className={styles.sectionTitle}>11. Contact</h2>
          <p className={styles.p}>
            Privacy questions or deletion requests:{' '}
            <a className={styles.link} href="mailto:support@aibeatchallenge.gg">support@aibeatchallenge.gg</a>
          </p>
        </section>
      </div>
    </main>
  );
}
