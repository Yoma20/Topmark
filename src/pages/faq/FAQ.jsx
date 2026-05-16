import { useState } from 'react';
import './faq.scss';

const FAQS = [
  {
    category: "General",
    items: [
      { q: "What is TopMark?", a: "TopMark is an academic marketplace that connects students with qualified expert professionals. Students can browse expert profiles, compare ratings, and hire the right expert for their academic needs." },
      { q: "How does TopMark work?", a: "Browse gigs posted by experts, select the one that fits your needs, place an order, fill in your requirements, and receive your completed work. You can message your expert directly throughout the process." },
      { q: "Is TopMark available worldwide?", a: "Yes. TopMark is available to students globally. We primarily serve students in the US and UK, though anyone can use the platform." },
    ]
  },
  {
    category: "Orders & Payments",
    items: [
      { q: "How do I place an order?", a: "Find a gig you like, select a package, and proceed to checkout. After payment, you'll be prompted to fill in your specific requirements so the expert can get started." },
      { q: "What payment methods are accepted?", a: "We accept all major credit and debit cards including Visa and Mastercard, processed securely through our payment provider." },
      { q: "Is my payment secure?", a: "Yes. All payments are processed through a secure, encrypted payment gateway. TopMark never stores your card details." },
      { q: "Can I get a refund?", a: "Yes, subject to our Refund Policy. If an expert fails to deliver or the work does not meet the agreed requirements, you may be eligible for a full or partial refund. See our Refund Policy for full details." },
    ]
  },
  {
    category: "Experts",
    items: [
      { q: "How are experts vetted?", a: "Experts apply to join TopMark and are reviewed for their qualifications, subject expertise, and communication skills. Student reviews and ratings further ensure quality over time." },
      { q: "Can I communicate with my expert?", a: "Yes. TopMark has a built-in messaging system. Once you start a conversation or place an order, you can message your expert directly at any time." },
      { q: "What if I'm not happy with the work?", a: "Most packages include revision allowances. If you're unsatisfied after revisions, contact our support team and we will help mediate a resolution." },
    ]
  },
  {
    category: "For Experts",
    items: [
      { q: "How do I become an expert on TopMark?", a: "Click 'Become a Seller' in your account menu, complete your expert profile, and create your first gig. Our team reviews new expert profiles before they go live." },
      { q: "How do I get paid?", a: "Earnings are released after order completion. Payment is processed to your registered payout method." },
      { q: "What commission does TopMark take?", a: "TopMark takes a service fee from each transaction to cover platform operations, payment processing, and support." },
    ]
  },
];

const FAQ = () => {
  const [openIndex, setOpenIndex] = useState(null);

  const toggle = (key) => setOpenIndex(openIndex === key ? null : key);

  return (
    <div className="faq">
      <div className="faq__hero">
        <h1>Frequently Asked Questions</h1>
        <p>Everything you need to know about TopMark.</p>
      </div>

      <div className="faq__container">
        {FAQS.map((section) => (
          <div key={section.category} className="faq__section">
            <h2 className="faq__category">{section.category}</h2>
            {section.items.map((item, i) => {
              const key = `${section.category}-${i}`;
              const isOpen = openIndex === key;
              return (
                <div key={key} className={`faq__item ${isOpen ? 'faq__item--open' : ''}`}>
                  <button className="faq__question" onClick={() => toggle(key)}>
                    <span>{item.q}</span>
                    <span className="faq__icon">{isOpen ? '−' : '+'}</span>
                  </button>
                  {isOpen && <div className="faq__answer"><p>{item.a}</p></div>}
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
};

export default FAQ;