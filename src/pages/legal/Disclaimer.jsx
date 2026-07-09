import './legal.scss';

const Disclaimer = () => {
  return (
    <div className="legal">
      <div className="legal__hero">
        <h1>Disclaimer</h1>
        <p>Last updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
      </div>

      <div className="legal__container">

        <p className="legal__intro">
          Please read this Disclaimer carefully before using TopMark. By accessing or using our platform, you acknowledge and agree to the terms set out below.
        </p>

        <section className="legal__section">
          <h2>1. Nature of Services</h2>
          <p>
            TopMark is a marketplace platform that connects students with independent academic professionals. The services provided by Experts on TopMark are intended for reference, research assistance, tutoring, and educational support purposes only.
          </p>
          <p>
            Any work delivered through TopMark is intended to be used as a study aid, reference material, or example of how a particular topic or assignment might be approached. It is the sole responsibility of the student to ensure that their use of any delivered work complies with the academic integrity policies of their institution.
          </p>
        </section>

        <section className="legal__section">
          <h2>2. Academic Integrity</h2>
          <p>
            TopMark does not condone academic dishonesty, plagiarism, or any violation of institutional academic integrity policies. Students are solely responsible for how they use any content or assistance obtained through the platform. TopMark accepts no liability for any academic consequences resulting from the misuse of services obtained through the platform.
          </p>
        </section>

        <section className="legal__section">
          <h2>3. No Guarantee of Outcomes</h2>
          <p>
            TopMark does not guarantee any specific academic outcome, grade, or result from the use of its services. The quality and effectiveness of assistance depends on the individual Expert and the information provided by the student.
          </p>
        </section>

        <section className="legal__section">
          <h2>4. Expert Independence</h2>
          <p>
            Experts on TopMark are independent contractors, not employees of TopMark. TopMark is not responsible for the actions, conduct, or quality of work of any Expert. TopMark provides the platform through which Experts and students connect, but is not a party to any agreement between them.
          </p>
        </section>

        <section className="legal__section">
          <h2>5. Accuracy of Information</h2>
          <p>
            While TopMark takes reasonable steps to ensure that information on the platform is accurate and up to date, we make no warranties as to the completeness, accuracy, or reliability of any content. Users rely on information provided through the platform at their own risk.
          </p>
        </section>

        <section className="legal__section">
          <h2>6. Third-Party Links</h2>
          <p>
            TopMark may contain links to third-party websites. These links are provided for convenience only. TopMark has no control over the content of third-party sites and accepts no responsibility for them or for any loss or damage that may arise from your use of them.
          </p>
        </section>

        <section className="legal__section">
          <h2>7. Limitation of Liability</h2>
          <p>
            To the maximum extent permitted by applicable law, TopMark shall not be liable for any direct, indirect, incidental, consequential, or punitive damages arising from your use of the platform or services obtained through it.
          </p>
        </section>

        <section className="legal__section">
          <h2>8. Changes</h2>
          <p>
            TopMark reserves the right to update this Disclaimer at any time. Continued use of the platform following any changes constitutes your acceptance of the revised Disclaimer.
          </p>
        </section>

        <section className="legal__section">
          <h2>9. Contact</h2>
          <p>If you have questions about this Disclaimer, contact us at info@topmark.pro.</p>
        </section>

      </div>
    </div>
  );
};

export default Disclaimer;