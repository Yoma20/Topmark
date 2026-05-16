import { useState } from 'react';
import './support.scss';

const Support = () => {
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    // Replace with your actual support email endpoint or Resend API call
    await new Promise((r) => setTimeout(r, 1000)); // simulate send
    setSubmitted(true);
    setLoading(false);
  };

  return (
    <div className="support">
      <div className="support__hero">
        <h1>Support Center</h1>
        <p>We're here to help. Send us a message and we'll get back to you within 24 hours.</p>
      </div>

      <div className="support__container">

        <div className="support__cards">
          <div className="support__card">
            <span>📧</span>
            <h3>Email Us</h3>
            <p>info@topmark.pro</p>
          </div>
          <div className="support__card">
            <span>⏱️</span>
            <h3>Response Time</h3>
            <p>Within 24 hours</p>
          </div>
          <div className="support__card">
            <span>📋</span>
            <h3>Before You Write</h3>
            <p>Check our <a href="/faq">FAQ</a> — your question may already be answered.</p>
          </div>
        </div>

        {submitted ? (
          <div className="support__success">
            <span>✅</span>
            <h2>Message sent!</h2>
            <p>Thank you for reaching out. We'll get back to you at <strong>{form.email}</strong> within 24 hours.</p>
          </div>
        ) : (
          <form className="support__form" onSubmit={handleSubmit}>
            <h2>Send a Message</h2>

            <div className="support__row">
              <div className="support__field">
                <label>Your Name</label>
                <input
                  type="text"
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  placeholder="John Smith"
                  required
                />
              </div>
              <div className="support__field">
                <label>Email Address</label>
                <input
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  placeholder="john@example.com"
                  required
                />
              </div>
            </div>

            <div className="support__field">
              <label>Subject</label>
              <select name="subject" value={form.subject} onChange={handleChange} required>
                <option value="">Select a subject…</option>
                <option value="order">Order Issue</option>
                <option value="payment">Payment / Refund</option>
                <option value="account">Account Problem</option>
                <option value="expert">Expert Complaint</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div className="support__field">
              <label>Message</label>
              <textarea
                name="message"
                value={form.message}
                onChange={handleChange}
                placeholder="Describe your issue in as much detail as possible…"
                rows={6}
                required
              />
            </div>

            <button type="submit" className="support__btn" disabled={loading}>
              {loading ? 'Sending…' : 'Send Message'}
            </button>
          </form>
        )}

      </div>
    </div>
  );
};

export default Support;