import { useState, useEffect, useRef, useContext } from "react";
import { useNavigate } from "react-router-dom";
import AuthContext from "../../AuthContext";
import newRequest from "../../utils/newRequest";
import "./ContactDrawer.scss";

const MAX_CHARS = 500;

const QUICK_REPLIES = [
  "What's your turnaround time?",
  "Do you offer revisions?",
  "Can you handle urgent deadlines?",
  "What citation styles do you support?",
];

/**
 * ContactDrawer
 *
 * Props:
 *   isOpen        — boolean, controls drawer visibility
 *   onClose       — () => void
 *   expertUsername — string, e.g. "Empeno"
 *   expertId      — number
 *   gigId         — number
 *   gigTitle      — string, used to pre-fill the message
 */
export default function ContactDrawer({
  isOpen,
  onClose,
  expertUsername = "the expert",
  expertId,
  gigId,
  gigTitle = "",
}) {
  const { user: currentUser } = useContext(AuthContext);
  const navigate = useNavigate();

  const defaultMessage = `Hey ${expertUsername}, I'm looking for help with "${gigTitle}" and wanted to reach out. `;

  const [message, setMessage] = useState(defaultMessage);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState(null);
  const textareaRef = useRef(null);
  const drawerRef = useRef(null);

  // Reset & focus when opened
  useEffect(() => {
    if (isOpen) {
      setMessage(defaultMessage);
      setError(null);
      setSending(false);
      setTimeout(() => {
        if (textareaRef.current) {
          textareaRef.current.focus();
          // Place cursor at end
          const len = textareaRef.current.value.length;
          textareaRef.current.setSelectionRange(len, len);
        }
      }, 320); // after slide-in animation
    }
  }, [isOpen]); // eslint-disable-line

  // Close on Escape
  useEffect(() => {
    const handler = (e) => { if (e.key === "Escape") onClose(); };
    if (isOpen) document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [isOpen, onClose]);

  // Prevent body scroll when open
  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [isOpen]);

  const handleQuickReply = (chip) => {
    setMessage((prev) => {
      const trimmed = prev.trimEnd();
      const separator = trimmed.endsWith("?") || trimmed.endsWith(".") ? " " : ". ";
      const next = trimmed + separator + chip;
      return next.length <= MAX_CHARS ? next : prev;
    });
    textareaRef.current?.focus();
  };

  const handleSend = async () => {
    const trimmed = message.trim();
    if (!trimmed || sending) return;
    setSending(true);
    setError(null);
    try {
    await newRequest.post("/messaging/conversations/start/", {
        recipient_id: expertId,
        initial_message: trimmed,
         gig_id: gigId,
     });
      // NEW — tags the moment a lead actually reaches out to an expert for
      // the first time. This is the real "did the funnel convert" signal
      // for gig pages — separate from sign_up, since a user can already be
      // registered and this still be their first contact with this expert.
      window.dataLayer = window.dataLayer || [];
      window.dataLayer.push({
        event: "contact_expert_success",
        expert_id: expertId,
        gig_id: gigId,
      });
      onClose();
      navigate("/messages"); // stay off the gig URL, no conversation ID leaked
    } catch (err) {
      console.error(err);
      setError(err?.response?.data?.detail || "Something went wrong. Please try again.");
      setSending(false);
    }
  };

  const charsLeft = MAX_CHARS - message.length;
  const isOverLimit = charsLeft < 0;
  const canSend = message.trim().length > 0 && !isOverLimit && !sending;

  return (
    <>
      {/* Backdrop */}
      <div
        className={`cd-backdrop ${isOpen ? "cd-backdrop--visible" : ""}`}
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Drawer panel */}
      <aside
        ref={drawerRef}
        className={`cd-drawer ${isOpen ? "cd-drawer--open" : ""}`}
        role="dialog"
        aria-modal="true"
        aria-label={`Contact ${expertUsername}`}
      >
        {/* Header */}
        <header className="cd-drawer__header">
          <div className="cd-drawer__header-inner">
            <div className="cd-drawer__avatar">
              {expertUsername.charAt(0).toUpperCase()}
            </div>
            <div>
              <p className="cd-drawer__to">Message to</p>
              <p className="cd-drawer__name">{expertUsername}</p>
            </div>
          </div>
          <button
            className="cd-drawer__close"
            onClick={onClose}
            aria-label="Close"
          >
            ✕
          </button>
        </header>

        {/* Gig context pill */}
        {gigTitle && (
          <div className="cd-drawer__gig-pill">
            <span className="cd-drawer__gig-pill-label">Re:</span>
            <span className="cd-drawer__gig-pill-title">{gigTitle}</span>
          </div>
        )}

        {/* Body */}
        <div className="cd-drawer__body">
          {/* Quick reply chips */}
          <div className="cd-chips" role="group" aria-label="Quick reply suggestions">
            <p className="cd-chips__label">Suggested questions</p>
            <div className="cd-chips__row">
              {QUICK_REPLIES.map((chip) => (
                <button
                  key={chip}
                  className="cd-chip"
                  onClick={() => handleQuickReply(chip)}
                  disabled={sending}
                >
                  {chip}
                </button>
              ))}
            </div>
          </div>

          {/* Textarea */}
          <div className="cd-textarea-wrap">
            <textarea
              ref={textareaRef}
              className={`cd-textarea ${isOverLimit ? "cd-textarea--overlimit" : ""}`}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Write your message…"
              rows={6}
              maxLength={MAX_CHARS + 50} // soft limit enforced by UI
              disabled={sending}
              aria-label="Message"
            />
            <div className={`cd-char-count ${isOverLimit ? "cd-char-count--over" : charsLeft < 60 ? "cd-char-count--warn" : ""}`}>
              {isOverLimit ? `${Math.abs(charsLeft)} over limit` : `${charsLeft} left`}
            </div>
          </div>

          {/* Error */}
          {error && (
            <div className="cd-error" role="alert">
              <span>⚠ {error}</span>
              <button onClick={() => setError(null)} aria-label="Dismiss">✕</button>
            </div>
          )}
        </div>

        {/* Footer */}
        <footer className="cd-drawer__footer">
          <button className="cd-btn cd-btn--cancel" onClick={onClose} disabled={sending}>
            Cancel
          </button>
          <button
            className={`cd-btn cd-btn--send ${sending ? "cd-btn--loading" : ""}`}
            onClick={handleSend}
            disabled={!canSend}
          >
            {sending ? (
              <>
                <span className="cd-spinner" aria-hidden="true" />
                Sending…
              </>
            ) : (
              <>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <line x1="22" y1="2" x2="11" y2="13" />
                  <polygon points="22 2 15 22 11 13 2 9 22 2" />
                </svg>
                Send Message
              </>
            )}
          </button>
        </footer>
      </aside>
    </>
  );
}