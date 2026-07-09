import { Link } from 'react-router-dom';
import './about.scss';

const About = () => {
  return (
    <div className="about">
      <section className="about__hero">
        <h1>About <span className="site-footer__logo">
              <span className="site-footer__logo--top">Top</span>
              <span className="site-footer__logo--mark">Mark</span>
            </span></h1>
        <p>Connecting students with expert academic professionals worldwide.</p>
      </section>

      <section className="about__mission">
        <div className="about__container">
          <div className="about__block">
            <h2>Our Mission</h2>
            <p>
              TopMark was founded with a simple but powerful idea: every student deserves access to expert academic guidance. We bridge the gap between students seeking support and qualified academic professionals ready to help — making high-quality academic assistance accessible, transparent, and reliable.
            </p>
          </div>

          <div className="about__block">
            <h2>What We Do</h2>
            <p>
              TopMark is a marketplace where students connect directly with vetted academic experts across every subject — from Law and Biology to Data Science and Essay Writing. Students browse expert profiles, review their qualifications and ratings, and hire the right expert for their specific needs.
            </p>
          </div>

          <div className="about__values">
            <h2>Our Values</h2>
            <div className="about__values-grid">
              <div className="about__value-card">
                <span></span>
                <h3>Quality</h3>
                <p>Every expert on TopMark is vetted for their qualifications and track record.</p>
              </div>
              <div className="about__value-card">
                <span></span>
                <h3>Trust</h3>
                <p>Secure payments, transparent reviews, and full buyer protection on every order.</p>
              </div>
              <div className="about__value-card">
                <span></span>
                <h3>Speed</h3>
                <p>Get matched with the right expert fast — even for urgent deadlines.</p>
              </div>
              <div className="about__value-card">
                <span></span>
                <h3>Accessibility</h3>
                <p>World-class academic support available to every student, anywhere.</p>
              </div>
            </div>
          </div>

          <div className="about__cta">
            <h2>Ready to get started?</h2>
            <p>Join thousands of students already using TopMark to achieve their academic goals.</p>
            <Link to="/register" className="about__btn">Create Free Account</Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default About;