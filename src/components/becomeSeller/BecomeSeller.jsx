import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './becomeseller.scss';

const STATS = [
  { value: '50K+', label: 'Active Students' },
  { value: '98%', label: 'Satisfaction Rate' },
  { value: '$85', label: 'Avg. Hourly Rate' },
  { value: '24h', label: 'Avg. Response Time' },
];

const STEPS = [
  {
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
        <circle cx="12" cy="7" r="4"/>
      </svg>
    ),
    step: '01',
    title: 'Build Your Expert Profile',
    desc: 'Showcase your academic credentials, field of expertise, and a compelling bio that attracts the right students.',
  },
  {
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
      </svg>
    ),
    step: '02',
    title: 'Set Your Availability',
    desc: 'Control when and how you work. Toggle availability on or off anytime to manage your workload with full flexibility.',
  },
  {
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="3" width="20" height="14" rx="2" ry="2"/>
        <line x1="8" y1="21" x2="16" y2="21"/>
        <line x1="12" y1="17" x2="12" y2="21"/>
      </svg>
    ),
    step: '03',
    title: 'Receive & Complete Orders',
    desc: 'Students submit their assignments — you review, accept, and deliver high-quality academic support on your terms.',
  },
  {
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <line x1="12" y1="1" x2="12" y2="23"/>
        <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
      </svg>
    ),
    step: '04',
    title: 'Get Paid Securely',
    desc: 'Earn through our escrow-protected payment system. Funds are released once students confirm delivery — always secure.',
  },
];

const PERKS = [
  { icon: '🎓', title: 'Academic Focus', desc: 'Purpose-built for academic work across Law, STEM, Business, and more.' },
  { icon: '🔒', title: 'Verified Platform', desc: 'ID-verified experts only. Students trust your credentials are real.' },
  { icon: '⚡', title: 'Instant Matching', desc: 'Our algorithm surfaces your profile to the most relevant students.' },
  { icon: '📊', title: 'Performance Insights', desc: 'Track ratings, reviews, and earnings with a detailed expert dashboard.' },
  { icon: '💬', title: 'Integrated Messaging', desc: 'Chat directly with students before accepting any assignment.' },
  { icon: '🌍', title: 'Global Reach', desc: 'Connect with students from universities worldwide, 24/7.' },
];

const BecomeSeller = () => {
  const navigate = useNavigate();

  return (
    <div className="become-expert">
      {/* ── Hero ─────────────────────────────────────── */}
      <section className="be-hero">
        <div className="be-hero__badge">For Academic Experts</div>
        <h1 className="be-hero__title">
          Share your expertise.<br />
          <span className="be-hero__accent">Earn on your schedule.</span>
        </h1>
        <p className="be-hero__sub">
          Join thousands of verified academic professionals helping students succeed —
          on terms that work for you.
        </p>
        <div className="be-hero__cta">
          <button className="be-btn be-btn--primary" onClick={() => navigate('/becomeSeller2')}>
            Start Your Application
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="5" y1="12" x2="19" y2="12"/>
              <polyline points="12 5 19 12 12 19"/>
            </svg>
          </button>
          <Link to="/" className="be-btn be-btn--ghost">Back to Home</Link>
        </div>

        {/* Stats row */}
        <div className="be-stats">
          {STATS.map((s) => (
            <div className="be-stat" key={s.label}>
              <span className="be-stat__value">{s.value}</span>
              <span className="be-stat__label">{s.label}</span>
            </div>
          ))}
        </div>
      </section>

      {/* ── How It Works ─────────────────────────────── */}
      <section className="be-section">
        <div className="be-section__header">
          <h2>How It Works</h2>
          <p>Four simple steps from sign-up to your first payout.</p>
        </div>
        <div className="be-steps">
          {STEPS.map((s, i) => (
            <div className="be-step" key={i}>
              <div className="be-step__num">{s.step}</div>
              <div className="be-step__icon">{s.icon}</div>
              <h3 className="be-step__title">{s.title}</h3>
              <p className="be-step__desc">{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Why TopMark ──────────────────────────────── */}
      <section className="be-section be-section--alt">
        <div className="be-section__header">
          <h2>Why Experts Choose TopMark</h2>
          <p>A platform built specifically for serious academic professionals.</p>
        </div>
        <div className="be-perks">
          {PERKS.map((p) => (
            <div className="be-perk" key={p.title}>
              <div className="be-perk__icon">{p.icon}</div>
              <h4 className="be-perk__title">{p.title}</h4>
              <p className="be-perk__desc">{p.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Final CTA ────────────────────────────────── */}
      <section className="be-cta-footer">
        <h2>Ready to become an expert?</h2>
        <p>It takes less than 5 minutes to create your profile and start earning.</p>
        <button className="be-btn be-btn--primary be-btn--lg" onClick={() => navigate('/becomeSeller2')}>
          Create Your Expert Profile
        </button>
      </section>
    </div>
  );
};

export default BecomeSeller;