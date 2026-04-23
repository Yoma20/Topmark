// src/components/messaging/ChatWindow.jsx
import { useEffect, useRef, useState, useCallback } from "react";
import { getMessages, sendMessage } from "../../api/messaging";
import { formatTime } from "./utils";

const POLL_INTERVAL = 4000; // ms — poll for new messages every 4 seconds

export default function ChatWindow({ conversation, currentUserId, onMessageSent }) {
  const [messages, setMessages] = useState([]);
  const [draft, setDraft] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const [loadingMsgs, setLoadingMsgs] = useState(true);
  const bottomRef = useRef(null);
  const intervalRef = useRef(null);
  const inputRef = useRef(null);

  const fetchMessages = useCallback(async (silent = false) => {
    if (!conversation) return;
    if (!silent) setLoadingMsgs(true);
    try {
      const data = await getMessages(conversation.id);
      setMessages(data);
    } catch {
      // Silently fail on background polls
    } finally {
      if (!silent) setLoadingMsgs(false);
    }
  }, [conversation]);

  // Initial load + start polling
  useEffect(() => {
    if (!conversation) return;
    setMessages([]);
    setDraft("");
    setError("");
    fetchMessages(false);
    inputRef.current?.focus();

    intervalRef.current = setInterval(() => fetchMessages(true), POLL_INTERVAL);
    return () => clearInterval(intervalRef.current);
  }, [conversation, fetchMessages]);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async () => {
    const text = draft.trim();
    if (!text || sending) return;
    setError("");
    setSending(true);

    // Optimistic UI — add message locally before server confirms
    const optimistic = {
      id: `opt-${Date.now()}`,
      content: text,
      sender: { id: currentUserId },
      created_at: new Date().toISOString(),
      is_read: false,
      optimistic: true,
    };
    setMessages((prev) => [...prev, optimistic]);
    setDraft("");

    try {
      const confirmed = await sendMessage(conversation.id, text);
      // Replace optimistic msg with confirmed one
      setMessages((prev) =>
        prev.map((m) => (m.id === optimistic.id ? confirmed : m))
      );
      onMessageSent?.();
    } catch (err) {
      // Roll back optimistic message and show error
      setMessages((prev) => prev.filter((m) => m.id !== optimistic.id));
      setError(
        err.response?.data?.detail || "Failed to send. Please try again."
      );
      setDraft(text); // restore draft
    } finally {
      setSending(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const other = conversation?.other_participant;

  if (!conversation) {
    return (
      <div className="chat-empty">
        <div className="chat-empty-icon">💬</div>
        <p>Select a conversation to start chatting</p>
      </div>
    );
  }

  return (
    <div className="chat-window">
      {/* Header */}
      <div className="chat-header">
        <div className="chat-header-avatar">
          {other.username.charAt(0).toUpperCase()}
        </div>
        <div>
          <div className="chat-header-name">{other.username}</div>
          <div className="chat-header-role">{other.user_type}</div>
        </div>
      </div>

      {/* Messages */}
      <div className="chat-messages">
        {loadingMsgs ? (
          <div className="chat-loading">Loading messages…</div>
        ) : messages.length === 0 ? (
          <div className="chat-no-messages">
            Say hello to {other.username}! 👋
          </div>
        ) : (
          messages.map((msg) => {
            const isMine = msg.sender?.id === currentUserId || msg.sender === currentUserId;
            return (
              <div
                key={msg.id}
                className={`msg ${isMine ? "msg--mine" : "msg--theirs"} ${
                  msg.optimistic ? "msg--optimistic" : ""
                }`}
              >
                <div className="msg-bubble">{msg.content}</div>
                <div className="msg-meta">
                  {formatTime(msg.created_at)}
                  {isMine && (
                    <span className="msg-read-indicator">
                      {msg.is_read ? " ✓✓" : " ✓"}
                    </span>
                  )}
                </div>
              </div>
            );
          })
        )}
        <div ref={bottomRef} />
      </div>

      {/* Error banner */}
      {error && (
        <div className="chat-error" role="alert">
          ⚠️ {error}
          <button onClick={() => setError("")}>✕</button>
        </div>
      )}

      {/* Input */}
      <div className="chat-input-row">
        <textarea
          ref={inputRef}
          className="chat-input"
          placeholder={`Message ${other.username}…`}
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={handleKeyDown}
          maxLength={5000}
          rows={1}
          disabled={sending}
          aria-label="Type a message"
        />
        <button
          className={`chat-send-btn ${sending ? "chat-send-btn--sending" : ""}`}
          onClick={handleSend}
          disabled={!draft.trim() || sending}
          aria-label="Send message"
        >
          {sending ? "…" : "➤"}
        </button>
      </div>
      <div className="chat-char-count">
        {draft.length > 0 && `${draft.length}/5000`}
      </div>
    </div>
  );
}
