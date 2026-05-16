import './legal.scss';

const RefundPolicy = () => {
  return (
    <div className="legal">
      <div className="legal__hero">
        <h1>Refund Policy</h1>
        <p>Last updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
      </div>

      <div className="legal__container">

        <p className="legal__intro">
          At TopMark, we are committed to ensuring a fair experience for both students and experts. This Refund Policy outlines the circumstances under which refunds are granted.
        </p>

        <section className="legal__section">
          <h2>1. Eligibility for Refund</h2>
          <p>You may be eligible for a full or partial refund in the following circumstances:</p>
          <ul>
            <li>The Expert fails to deliver the order within the agreed timeframe and does not request an extension.</li>
            <li>The delivered work does not match the requirements you submitted at the time of order.</li>
            <li>The Expert cancels the order before delivery.</li>
            <li>Both parties mutually agree to cancel the order.</li>
          </ul>
        </section>

        <section className="legal__section">
          <h2>2. Non-Refundable Circumstances</h2>
          <p>Refunds will generally not be issued in the following situations:</p>
          <ul>
            <li>You change your mind after submitting requirements and the Expert has already begun work.</li>
            <li>The delivered work meets the requirements you submitted but you are dissatisfied with the outcome.</li>
            <li>You provided incomplete or incorrect requirements and the Expert delivered based on what was provided.</li>
            <li>The order has been marked as complete for more than 14 days without a dispute being raised.</li>
          </ul>
        </section>

        <section className="legal__section">
          <h2>3. Revision Requests</h2>
          <p>
            Before requesting a refund, Buyers are encouraged to use the revision allowance included in their package. Most packages include one or more free revisions. Refund requests submitted without first requesting a revision may be declined.
          </p>
        </section>

        <section className="legal__section">
          <h2>4. How to Request a Refund</h2>
          <p>To request a refund:</p>
          <ul>
            <li>Contact TopMark support at info@topmark.pro within 14 days of order completion.</li>
            <li>Include your order ID and a clear explanation of why you are requesting a refund.</li>
            <li>Attach any relevant evidence (screenshots, delivered files, communication).</li>
          </ul>
          <p>Our team will review your request within 5 business days and notify you of the outcome.</p>
        </section>

        <section className="legal__section">
          <h2>5. Refund Processing</h2>
          <p>
            Approved refunds will be returned to your original payment method. Processing time is typically 5–10 business days depending on your bank or card issuer. TopMark service fees may be non-refundable in partial refund scenarios.
          </p>
        </section>

        <section className="legal__section">
          <h2>6. Disputes</h2>
          <p>
            If you and your Expert cannot reach an agreement, TopMark support will mediate and make a final decision based on the evidence provided by both parties. TopMark's decision is final.
          </p>
        </section>

        <section className="legal__section">
          <h2>7. Contact</h2>
          <p>For refund requests or questions, contact us at info@topmark.pro.</p>
        </section>

      </div>
    </div>
  );
};

export default RefundPolicy;