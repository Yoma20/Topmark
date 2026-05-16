import './legal.scss';

const PrivacyPolicy = () => {
  return (
    <div className="legal">
      <div className="legal__hero">
        <h1>Privacy Policy</h1>
        <p>Last updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
      </div>

      <div className="legal__container">

        <p className="legal__intro">
          TopMark ("we," "us," or "our") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our platform at topmark.pro. Please read this policy carefully. By using TopMark, you agree to the practices described below.
        </p>

        <section className="legal__section">
          <h2>1. Information We Collect</h2>
          <h3>Information You Provide</h3>
          <ul>
            <li>Account registration details (name, email address, password)</li>
            <li>Profile information (profile picture, bio, skills, country)</li>
            <li>Payment information (processed securely by our payment provider — we do not store card details)</li>
            <li>Communications through our messaging system</li>
            <li>Order details and requirements you submit</li>
          </ul>
          <h3>Information Collected Automatically</h3>
          <ul>
            <li>Log data (IP address, browser type, pages visited, time spent)</li>
            <li>Device information (operating system, device type)</li>
            <li>Cookies and similar tracking technologies</li>
          </ul>
        </section>

        <section className="legal__section">
          <h2>2. How We Use Your Information</h2>
          <p>We use the information we collect to:</p>
          <ul>
            <li>Create and manage your account</li>
            <li>Facilitate transactions between students and experts</li>
            <li>Process payments and prevent fraud</li>
            <li>Provide customer support</li>
            <li>Send transactional emails (order confirmations, messages, OTP codes)</li>
            <li>Improve our platform and services</li>
            <li>Comply with legal obligations</li>
          </ul>
          <p>We do not sell your personal data to third parties.</p>
        </section>

        <section className="legal__section">
          <h2>3. Sharing of Information</h2>
          <p>We may share your information with:</p>
          <ul>
            <li><strong>Other users:</strong> Your public profile information (username, profile picture, ratings) is visible to other users on the platform.</li>
            <li><strong>Service providers:</strong> Third-party vendors who assist us in operating the platform (payment processors, email providers, hosting services).</li>
            <li><strong>Legal authorities:</strong> When required by law or to protect our rights and the safety of users.</li>
          </ul>
        </section>

        <section className="legal__section">
          <h2>4. Cookies</h2>
          <p>
            TopMark uses cookies and similar technologies to maintain your session, remember your preferences, and analyse platform usage. You can control cookie settings through your browser, but disabling cookies may affect platform functionality.
          </p>
        </section>

        <section className="legal__section">
          <h2>5. Data Retention</h2>
          <p>
            We retain your personal data for as long as your account is active or as needed to provide services. You may request deletion of your account and associated data by contacting us at info@topmark.pro. Some data may be retained for legal or compliance purposes.
          </p>
        </section>

        <section className="legal__section">
          <h2>6. Security</h2>
          <p>
            We implement industry-standard security measures to protect your data, including HTTPS encryption, secure session management, and access controls. However, no method of transmission over the internet is 100% secure and we cannot guarantee absolute security.
          </p>
        </section>

        <section className="legal__section">
          <h2>7. Your Rights</h2>
          <p>Depending on your location, you may have the right to:</p>
          <ul>
            <li>Access the personal data we hold about you</li>
            <li>Request correction of inaccurate data</li>
            <li>Request deletion of your data</li>
            <li>Object to or restrict processing of your data</li>
            <li>Data portability</li>
          </ul>
          <p>To exercise these rights, contact us at info@topmark.pro.</p>
        </section>

        <section className="legal__section">
          <h2>8. Children's Privacy</h2>
          <p>
            TopMark is not intended for users under the age of 18. We do not knowingly collect personal information from children. If you believe we have collected information from a minor, please contact us immediately.
          </p>
        </section>

        <section className="legal__section">
          <h2>9. Changes to This Policy</h2>
          <p>
            We may update this Privacy Policy from time to time. We will notify you of significant changes by posting the new policy on this page with an updated date. Your continued use of TopMark after changes constitutes acceptance of the updated policy.
          </p>
        </section>

        <section className="legal__section">
          <h2>10. Contact Us</h2>
          <p>If you have questions about this Privacy Policy, please contact us at:</p>
          <p><strong>Email:</strong> info@topmark.pro</p>
        </section>

      </div>
    </div>
  );
};

export default PrivacyPolicy;