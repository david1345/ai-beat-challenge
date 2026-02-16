import Link from "next/link";
import styles from "../legal.module.css";

export default function TermsPage() {
  return (
    <main className={styles.page}>
      <div className={styles.wrap}>
        <Link href="/" className={styles.back}>
          ← Back
        </Link>
        <section className={styles.card}>
          <h1 className={styles.title}>Terms of Service (AI Beat Challenge)</h1>
          <p className={styles.updated}>Last updated: February 13, 2026</p>

          <h2 className={styles.sectionTitle}>1. Introduction</h2>
          <p className={styles.p}>
            These Terms of Service ("Terms") govern your access to and use of AI Beat Challenge (the "Service"). By
            accessing or using the Service, you agree to these Terms.
          </p>
          <p className={styles.p}>If you do not agree, do not use the Service.</p>

          <h2 className={styles.sectionTitle}>2. Entertainment-Only / No Financial Advice</h2>
          <p className={styles.p}>The Service is a skill-based prediction game for entertainment and learning purposes only.</p>
          <ul className={styles.list}>
            <li>No real money wagering.</li>
            <li>No cash rewards.</li>
            <li>Points, ranks, and badges have no monetary value and are not redeemable.</li>
          </ul>
          <p className={styles.p}>
            Nothing on the Service constitutes financial, investment, legal, tax, or trading advice. You are solely
            responsible for any decisions you make outside the Service.
          </p>

          <h2 className={styles.sectionTitle}>3. Eligibility</h2>
          <p className={styles.p}>You must:</p>
          <ul className={styles.list}>
            <li>be 18 years or older (or the age of majority where you live, whichever is higher),</li>
            <li>be legally permitted to access the Service under local laws, and</li>
            <li>use the Service in compliance with these Terms.</li>
          </ul>
          <p className={styles.p}>We do not knowingly allow children to use the Service.</p>

          <h2 className={styles.sectionTitle}>4. Accounts and Sign-In</h2>
          <p className={styles.p}>You may sign in using a third-party identity provider (e.g., Google). You are responsible for:</p>
          <ul className={styles.list}>
            <li>maintaining the confidentiality of your account access,</li>
            <li>all activity that occurs under your account, and</li>
            <li>providing accurate information.</li>
          </ul>
          <p className={styles.p}>We may restrict or terminate accounts that violate these Terms.</p>

          <h2 className={styles.sectionTitle}>5. How the Game Works (High-Level)</h2>
          <p className={styles.p}>
            The Service lets you make predictions (e.g., UP/DOWN) within defined timeframes. Outcomes are determined
            using the Service&apos;s market data source(s) and the evaluation rules described in the Fair Play policy.
          </p>
          <p className={styles.p}>
            We may adjust game parameters, supported assets, timeframes, scoring formulas, or anti-cheat measures to
            protect fairness and stability.
          </p>

          <h2 className={styles.sectionTitle}>6. Points, Rankings, and Virtual Items</h2>
          <ul className={styles.list}>
            <li>Points are virtual, non-transferable, and non-refundable.</li>
            <li>Points cannot be sold, exchanged, or converted to cash or anything of value.</li>
            <li>
              Rankings are for entertainment and may change due to scoring updates, fraud prevention, or data
              corrections.
            </li>
            <li>We may reset seasons, ranks, or points (in whole or part) to ensure fair competition.</li>
          </ul>

          <h2 className={styles.sectionTitle}>7. Prohibited Conduct</h2>
          <p className={styles.p}>You agree not to:</p>
          <ul className={styles.list}>
            <li>use bots, scripts, automation, or scraping to play or manipulate outcomes,</li>
            <li>exploit bugs or vulnerabilities, or attempt to bypass security,</li>
            <li>interfere with the Service (e.g., abnormal traffic, denial-of-service),</li>
            <li>falsify identity, impersonate others, or create accounts to evade sanctions,</li>
            <li>harass, threaten, or abuse other users,</li>
            <li>use the Service for unlawful purposes.</li>
          </ul>

          <h2 className={styles.sectionTitle}>8. Anti-Abuse Enforcement</h2>
          <p className={styles.p}>We may apply measures including:</p>
          <ul className={styles.list}>
            <li>rate limiting,</li>
            <li>temporary restrictions,</li>
            <li>score/rank invalidation,</li>
            <li>suspension or termination,</li>
            <li>device/account bans.</li>
          </ul>
          <p className={styles.p}>We may take action with or without notice when necessary to protect users or the Service.</p>

          <h2 className={styles.sectionTitle}>9. Intellectual Property</h2>
          <p className={styles.p}>
            The Service, including software, design, branding, and content, is owned by the operator or licensors and
            protected by applicable laws. You may not copy, modify, distribute, reverse engineer, or create derivative
            works except where permitted by law.
          </p>

          <h2 className={styles.sectionTitle}>10. Third-Party Services</h2>
          <p className={styles.p}>
            The Service may rely on third-party providers (identity, analytics, hosting, market data). We are not
            responsible for third-party services and their terms/privacy practices.
          </p>

          <h2 className={styles.sectionTitle}>11. Availability and Changes</h2>
          <p className={styles.p}>
            We may change, suspend, or discontinue any part of the Service at any time. We do not guarantee
            uninterrupted availability.
          </p>

          <h2 className={styles.sectionTitle}>12. Disclaimers</h2>
          <p className={styles.p}>THE SERVICE IS PROVIDED "AS IS" AND "AS AVAILABLE."</p>
          <p className={styles.p}>
            We disclaim all warranties to the maximum extent permitted by law, including fitness for a particular
            purpose and non-infringement.
          </p>
          <p className={styles.p}>
            Market data may be delayed, incomplete, or inaccurate. You acknowledge that outcomes may be affected by
            data latency or provider limitations.
          </p>

          <h2 className={styles.sectionTitle}>13. Limitation of Liability</h2>
          <p className={styles.p}>
            To the maximum extent permitted by law, the operator is not liable for indirect, incidental, special,
            consequential, or punitive damages, or any loss of profits, data, or goodwill, arising from your use of
            the Service.
          </p>

          <h2 className={styles.sectionTitle}>14. Indemnity</h2>
          <p className={styles.p}>
            You agree to indemnify and hold harmless the operator from claims arising from your misuse of the Service
            or violation of these Terms.
          </p>

          <h2 className={styles.sectionTitle}>15. Termination</h2>
          <p className={styles.p}>
            You may stop using the Service at any time. We may terminate or restrict access if you violate these Terms
            or to protect the Service.
          </p>

          <h2 className={styles.sectionTitle}>16. Governing Law</h2>
          <p className={styles.p}>
            These Terms are governed by the laws of Republic of Korea, excluding conflict-of-law rules.
          </p>
          <p className={styles.p}>
            Any disputes shall be resolved in the courts located in Seoul Central District Court, Seoul, Republic of Korea, unless mandatory local law
            provides otherwise.
          </p>

          <h2 className={styles.sectionTitle}>17. Contact</h2>
          <p className={styles.p}>
            Questions about these Terms: <a className={styles.link} href="mailto:support@aibeatchallenge.gg">support@aibeatchallenge.gg</a>
          </p>
        </section>
      </div>
    </main>
  );
}
