import { useEffect, useRef, useState, useCallback } from "react";
import newRequest from "../../utils/newRequest";
import { getMessages } from "../../api/messaging";
import OfferCard from "../offerCard/OfferCard";
import SendOfferModal from "../offerCard/SendOfferModal";

const ChatWindow = ({ conversation, currentUserId, currentUserType, onMessageSent }) => {
  const [messages, setMessages] = useState([]);
  const [loadingMsgs, setLoadingMsgs] = useState(false);
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const [sendError, setSendError] = useState("");
  const [showOfferModal, setShowOfferModal] = useState(false);

  const bottomRef = useRef(null);
  const textareaRef = useRef(null);

  // Track the conversation id the interval was set up for
  const convIdRef = useRef(null);
  // Stable ref to fetchMessages so the interval never needs rebuilding
  const fetchMessagesRef = useRef(null);
  // Track message count so we only scroll when a genuinely new message arrives
  const prevMsgCountRef = useRef(0);

  const isExpert = currentUserType === "expert";
  console.log("ChatWindow render, conv id:", conversation?.id);

  // ── Fetch messages ──────────────────────────────────────────────────────────
  const fetchMessages = useCallback(async (convId) => {
    if (!convId) return;
    try {
      const msgs = await getMessages(convId);
      // Only call setMessages if the content actually changed — compare by
      // last message id and count to avoid triggering a re-render on every poll.
      setMessages((prev) => {
        const sameCount = prev.length === msgs.length;
        const sameLastId =
          prev.length > 0 &&
          msgs.length > 0 &&
          prev[prev.length - 1].id === msgs[msgs.length - 1].id;
        return sameCount && sameLastId ? prev : msgs;
      });
    } catch (err) {
      console.error("Failed to load messages", err);
    } finally {
      setLoadingMsgs(false);
    }
  }, []); // empty deps — never recreated

  // Keep ref in sync
  useEffect(() => { fetchMessagesRef.current = fetchMessages; }, [fetchMessages]);

  // ── Reset + initial load when conversation changes ──────────────────────────
  useEffect(() => {
    if (!conversation) {
      setMessages([]);
      prevMsgCountRef.current = 0;
      return;
    }

    // Only re-initialise when the actual conversation id changes
    if (convIdRef.current === conversation.id) return;
    convIdRef.current = conversation.id;

    setMessages([]);
    prevMsgCountRef.current = 0;
    setLoadingMsgs(true);
    fetchMessagesRef.current?.(conversation.id);
  }, [conversation?.id]); // eslint-disable-line

  // ── Stable polling interval — keyed to conversation id ─────────────────────
  useEffect(() => {
    if (!conversation?.id) return;
    const id = conversation.id;
    const interval = setInterval(() => {
      fetchMessagesRef.current?.(id);
    }, 4000);
    return () => clearInterval(interval);
  }, [conversation?.id]); // only restarts when switching conversations

  // ── Scroll to bottom ONLY when message count increases ─────────────────────
  // Previously this ran on every setMessages call, including polls that return
  // the same data — which is what caused the page to "pull up" constantly.
  useEffect(() => {
    if (messages.length > prevMsgCountRef.current) {
      bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }
    prevMsgCountRef.current = messages.length;
  }, [messages]);

  // ── Send plain text message ─────────────────────────────────────────────────
  const handleSend = async () => {
    const content = text.trim();
    if (!content || sending) return;

    const optimisticMsg = {
      id: `opt-${Date.now()}`,
      sender: { id: currentUserId },
      content,
      message_type: "text",
      is_read: false,
      created_at: new Date().toISOString(),
      _optimistic: true,
    };
    setMessages((prev) => [...prev, optimisticMsg]);
    setText("");
    setSending(true);
    setSendError("");

    try {
      const res = await newRequest.post(
        `/messaging/conversations/${conversation.id}/send/`,
        { content }
      );
      setMessages((prev) =>
        prev.map((m) => (m.id === optimisticMsg.id ? res.data : m))
      );
      onMessageSent?.();
    } catch {
      setSendError("Failed to send. Click to retry.");
      setMessages((prev) => prev.filter((m) => m.id !== optimisticMsg.id));
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

  const handleTextChange = (e) => {
    setText(e.target.value);
    const el = textareaRef.current;
    if (el) {
      el.style.height = "auto";
      el.style.height = Math.min(el.scrollHeight, 120) + "px";
    }
  };

  // ── Render ──────────────────────────────────────────────────────────────────
  if (!conversation) {
    return (
      <div className="chat-window">
        <div className="chat-empty">
          <span className="chat-empty-icon">💬</span>
          <p>Select a conversation to start chatting</p>
        </div>
      </div>
    );
  }

  const otherParticipant = conversation.other_participant;
  const gigTitle = conversation.gig_title;
  const gigPackages = conversation.gig_packages || [];

  return (
    <div className="chat-window">
      {/* Header */}
      <div className="chat-header">
        <div className="chat-header-avatar">
          {otherParticipant?.username?.charAt(0).toUpperCase()}
        </div>
        <div>
          <div className="chat-header-name">{otherParticipant?.username}</div>
          <div className="chat-header-role">
            {otherParticipant?.user_type}
            {gigTitle && <> · {gigTitle}</>}
          </div>
        </div>

        {isExpert && (
          <button
            className="chat-offer-btn"
            onClick={() => setShowOfferModal(true)}
            title="Send a custom offer"
          >
            📋 Send Offer
          </button>
        )}
      </div>

      {/* Messages */}
      <div className="chat-messages">
        {loadingMsgs && messages.length === 0 && (
          <p className="chat-loading">Loading messages…</p>
        )}
        {!loadingMsgs && messages.length === 0 && (
          <p className="chat-no-messages">No messages yet. Say hello!</p>
        )}

        {messages.map((msg) => {
          const isMine = msg.sender?.id === currentUserId;

          if (msg.message_type === "offer" && msg.offer) {
            return (
              <div
                key={msg.id}
                className={`msg ${isMine ? "msg--mine" : "msg--theirs"}`}
              >
                <OfferCard
                  offer={msg.offer}
                  currentUserId={currentUserId}
                  onResponded={() => {
                    fetchMessagesRef.current?.(conversation.id);
                    onMessageSent?.();
                  }}
                />
                <span className="msg-meta">
                  {new Date(msg.created_at).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
              </div>
            );
          }

          return (
            <div
              key={msg.id}
              className={`msg ${isMine ? "msg--mine" : "msg--theirs"} ${
                msg._optimistic ? "msg--optimistic" : ""
              }`}
            >
              <div className="msg-bubble">{msg.content}</div>
              <span className="msg-meta">
                {new Date(msg.created_at).toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
                {isMine && msg.is_read && (
                  <span className="msg-read-indicator"> ✓✓</span>
                )}
              </span>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>

      {/* Error banner */}
      {sendError && (
        <div className="chat-error">
          <span>{sendError}</span>
          <button onClick={() => setSendError("")}>✕</button>
        </div>
      )}

      {/* Char count */}
      {text.length > 4500 && (
        <div className="chat-char-count">{text.length} / 5000</div>
      )}

      {/* Input row */}
      <div className="chat-input-row">
        <textarea
          ref={textareaRef}
          className="chat-input"
          value={text}
          onChange={handleTextChange}
          onKeyDown={handleKeyDown}
          placeholder="Type a message…"
          rows={1}
          disabled={sending}
          maxLength={5000}
        />
        <button
          className={`chat-send-btn ${sending ? "chat-send-btn--sending" : ""}`}
          onClick={handleSend}
          disabled={!text.trim() || sending}
          aria-label="Send message"
        >
          ➤
        </button>
      </div>

      {/* Send Offer Modal */}
      {showOfferModal && (
        <SendOfferModal
          convId={conversation.id}
          gigPackages={gigPackages}
          onClose={() => setShowOfferModal(false)}
          onSent={() => {
            fetchMessagesRef.current?.(conversation.id);
            onMessageSent?.();
          }}
        />
      )}
    </div>
  );
};

export default ChatWindow;