import './legal.scss';

const TermsOfService = () => {
  return (
    <div className="legal">
      <div className="legal__hero">
        <h1>Terms of Service</h1>
        <p>Last updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
      </div>

      <div className="legal__container">

        <p className="legal__intro">
          Welcome to TopMark. By accessing or using our platform at topmark.pro, you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use TopMark.
        </p>

        <section className="legal__section">
          <h2>1. Overview</h2>
          <p>
            TopMark is an online marketplace that connects students ("Buyers") with academic professionals ("Experts" or "Sellers"). TopMark provides the platform infrastructure; we are not a party to any agreement between Buyers and Experts and do not employ Experts.
          </p>
        </section>

        <section className="legal__section">
          <h2>2. Eligibility</h2>
          <p>
            You must be at least 18 years old to use TopMark. By using the platform, you represent that you are 18 or older and have the legal capacity to enter into a binding agreement.
          </p>
        </section>

        <section className="legal__section">
          <h2>3. Accounts</h2>
          <ul>
            <li>You are responsible for maintaining the confidentiality of your account credentials.</li>
            <li>You are responsible for all activity that occurs under your account.</li>
            <li>You must provide accurate and complete information when registering.</li>
            <li>TopMark reserves the right to suspend or terminate accounts that violate these terms.</li>
          </ul>
        </section>

        <section className="legal__section">
          <h2>4. Services and Orders</h2>
          <h3>For Buyers</h3>
          <ul>
            <li>You may browse and purchase services (Gigs) offered by Experts on the platform.</li>
            <li>After payment, you must submit clear and complete requirements to allow the Expert to fulfil your order.</li>
            <li>You agree to communicate respectfully with Experts and TopMark support.</li>
          </ul>
          <h3>For Experts</h3>
          <ul>
            <li>You may create Gigs offering your academic expertise.</li>
            <li>You agree to deliver work that meets the described quality and within the agreed timeframe.</li>
            <li>You represent that you have the necessary skills and qualifications to perform the services you offer.</li>
            <li>You must not submit plagiarised or AI-generated work unless explicitly agreed with the Buyer.</li>
          </ul>
        </section>

        <section className="legal__section">
          <h2>5. Payments and Fees</h2>
          <ul>
            <li>All payments are processed through our secure payment provider.</li>
            <li>TopMark charges a service fee on each transaction.</li>
            <li>Funds are held and released according to our payment schedule.</li>
            <li>All prices are displayed in USD unless otherwise stated.</li>
          </ul>
        </section>

        <section className="legal__section">
          <h2>6. Cancellations and Refunds</h2>
          <p>
            Cancellations and refunds are governed by our Refund Policy. In general, orders may be eligible for a refund if the Expert fails to deliver, delivers work that does not match the agreed requirements, or if both parties mutually agree to cancel.
          </p>
        </section>

        <section className="legal__section">
          <h2>7. Intellectual Property</h2>
          <p>
            Upon full payment and completion of an order, the Buyer receives full ownership of the delivered work product, unless otherwise agreed in writing between Buyer and Expert.
          </p>
          <p>
            TopMark retains ownership of all platform content, branding, software, and technology. You may not copy, reproduce, or distribute any part of the platform without our written permission.
          </p>
        </section>

        <section className="legal__section">
          <h2>8. Prohibited Conduct</h2>
          <p>You agree not to:</p>
          <ul>
            <li>Use TopMark for any unlawful purpose</li>
            <li>Attempt to circumvent the platform to transact directly with other users outside TopMark</li>
            <li>Post false, misleading, or fraudulent content</li>
            <li>Harass, abuse, or threaten other users</li>
            <li>Attempt to gain unauthorised access to the platform or other accounts</li>
            <li>Upload malicious code or interfere with the platform's operation</li>
          </ul>
        </section>

        <section className="legal__section">
          <h2>9. Disclaimer of Warranties</h2>
          <p>
            TopMark is provided on an "as is" and "as available" basis. We make no warranties, express or implied, regarding the platform's reliability, accuracy, or fitness for a particular purpose. We do not guarantee that the platform will be uninterrupted or error-free.
          </p>
        </section>

        <section className="legal__section">
          <h2>10. Limitation of Liability</h2>
          <p>
            To the fullest extent permitted by law, TopMark shall not be liable for any indirect, incidental, special, consequential, or punitive damages arising out of your use of the platform, even if we have been advised of the possibility of such damages.
          </p>
        </section>

        <section className="legal__section">
          <h2>11. Governing Law</h2>
          <p>
            These Terms shall be governed by and construed in accordance with applicable law. Any disputes arising from these Terms or your use of TopMark shall be resolved through binding arbitration or in the courts of competent jurisdiction.
          </p>
        </section>

        <section className="legal__section">
          <h2>12. Changes to Terms</h2>
          <p>
            We reserve the right to modify these Terms at any time. We will notify users of material changes. Continued use of the platform after changes constitutes your acceptance of the new Terms.
          </p>
        </section>

        <section className="legal__section">
          <h2>13. Contact</h2>
          <p>For questions about these Terms, contact us at info@topmark.pro.</p>
        </section>

      </div>
    </div>
  );
};

export default TermsOfService;