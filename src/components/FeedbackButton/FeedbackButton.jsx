import { useState } from 'react';
import newRequest from '../../utils/newRequest';
import './FeedbackButton.scss';

const TYPES = [
    { value: 'bug',      label: 'Bug Report' },
    { value: 'idea',     label: 'Feature Request' },
    { value: 'category', label: 'Missing Category' },
    { value: 'other',    label: 'Other' },
  ];

const DISMISS_KEY = 'topmark_feedback_btn_dismissed';

const FeedbackButton = () => {
  const [open,        setOpen]    = useState(false);
  const [reportType,  setType]    = useState('bug');
  const [message,     setMessage] = useState('');
  const [status,      setStatus]  = useState('idle'); // idle | loading | success | error
  const [errorMsg,    setError]   = useState('');

  // NEW — lets the user permanently hide the floating button. Persisted so
  // it stays hidden across reloads/sessions, not just for this page view.
  const [dismissed, setDismissed] = useState(
    () => localStorage.getItem(DISMISS_KEY) === 'true'
  );

  const handleDismiss = (e) => {
    e.stopPropagation(); // don't also trigger the open-modal click
    localStorage.setItem(DISMISS_KEY, 'true');
    setDismissed(true);
  };

  const reset = () => {
    setType('bug');
    setMessage('');
    setStatus('idle');
    setError('');
  };

  const handleClose = () => {
    setOpen(false);
    setTimeout(reset, 300); // wait for close animation
  };

  const handleSubmit = async () => {
    if (!message.trim()) {
      setError('Please enter a message.');
      return;
    }
    setStatus('loading');
    setError('');
    try {
      await newRequest.post('/feedback/', { report_type: reportType, message });
      setStatus('success');
    } catch (err) {
      setError(
        err?.response?.data?.message?.[0] ||
        err?.response?.data?.detail ||
        'Something went wrong. Please try again.'
      );
      setStatus('error');
    }
  };

  // Fully hidden once dismissed — nothing renders, not even the modal shell.
  if (dismissed) return null;

  return (
    <>
      {/* Floating trigger button */}
      <div className="fb-trigger-wrap">
        <button
          className="fb-trigger"
          onClick={() => setOpen(true)}
          aria-label="Send feedback"
          type="button"
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
          </svg>
          <span>Feedback</span>
        </button>
        <button
          className="fb-trigger-dismiss"
          onClick={handleDismiss}
          aria-label="Hide feedback button"
          title="Hide this button"
          type="button"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>
      </div>

      {/* Overlay */}
      {open && <div className="fb-overlay" onClick={handleClose} />}

      {/* Modal */}
      <div className={`fb-modal${open ? ' fb-modal--open' : ''}`} role="dialog" aria-modal="true" aria-label="Feedback form">

        <div className="fb-modal__header">
          <h3>Send Feedback</h3>
          <button className="fb-modal__close" onClick={handleClose} type="button" aria-label="Close">✕</button>
        </div>

        {status === 'success' ? (
          <div className="fb-modal__success">
            <span className="fb-modal__success-icon">✓</span>
            <p>Thanks for your feedback!</p>
            <button className="fb-btn fb-btn--primary" onClick={handleClose} type="button">Close</button>
          </div>
        ) : (
          <div className="fb-modal__body">
            <label className="fb-label">What is this about?</label>
            <div className="fb-types">
              {TYPES.map(t => (
                <button
                  key={t.value}
                  type="button"
                  className={`fb-type-pill${reportType === t.value ? ' fb-type-pill--active' : ''}`}
                  onClick={() => setType(t.value)}
                >
                  {t.label}
                </button>
              ))}
            </div>

            <label className="fb-label" htmlFor="fb-message">Your message</label>
            <textarea
              id="fb-message"
              className="fb-textarea"
              rows={5}
              placeholder="Describe the bug, idea, or anything else…"
              value={message}
              onChange={e => { setMessage(e.target.value); setError(''); }}
            />

            {errorMsg && <p className="fb-error">{errorMsg}</p>}

            <div className="fb-modal__footer">
              <button className="fb-btn fb-btn--ghost" onClick={handleClose} type="button">Cancel</button>
              <button
                className="fb-btn fb-btn--primary"
                onClick={handleSubmit}
                disabled={status === 'loading'}
                type="button"
              >
                {status === 'loading' ? 'Sending…' : 'Send'}
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default FeedbackButton;