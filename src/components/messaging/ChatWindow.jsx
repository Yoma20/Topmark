import { useEffect, useRef, useState, useCallback } from "react";
import newRequest from "../../utils/newRequest";
import { getMessages } from "../../api/messaging";
import OfferCard from "../offerCard/OfferCard";
import SendOfferModal from "../offerCard/SendOfferModal";
import { Avatar } from "./ConversationList";

// ── Simple emoji picker ───────────────────────────────────────────────────────
const EMOJI_LIST = [
  "😊","😂","❤️","👍","🙏","😭","😍","🔥","✅","💯",
  "🎉","😅","🤔","👀","💪","✨","😢","🥹","😎","🤝",
  "👋","🙌","💬","📎","📝","⭐","🚀","💡","✔️","❓",
];

function EmojiPicker({ onSelect, onClose }) {
  const ref = useRef(null);

  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) onClose();
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [onClose]);

  return (
    <div className="emoji-picker" ref={ref} role="dialog" aria-label="Emoji picker">
      {EMOJI_LIST.map((emoji) => (
        <button
          key={emoji}
          className="emoji-picker__btn"
          onClick={() => onSelect(emoji)}
          aria-label={emoji}
        >
          {emoji}
        </button>
      ))}
    </div>
  );
}

// ── Attachment pill shown in the input area before sending ────────────────────
function AttachmentPreview({ file, onRemove }) {
  const isImage = file.type.startsWith("image/");
  const isVideo = file.type.startsWith("video/");
  const icon = isImage ? "🖼️" : isVideo ? "🎬" : "📄";
  const name = file.name.length > 22 ? file.name.slice(0, 20) + "…" : file.name;

  return (
    <div className="attach-preview">
      <span className="attach-preview__icon">{icon}</span>
      <span className="attach-preview__name">{name}</span>
      <button className="attach-preview__remove" onClick={onRemove} aria-label="Remove attachment">
        ✕
      </button>
    </div>
  );
}

// ── Renders a file message bubble ─────────────────────────────────────────────
function FileBubble({ fileUrl, fileName }) {
  if (!fileUrl) return <span className="msg-file-missing">File unavailable</span>;

  const ext = fileName?.split(".").pop()?.toLowerCase() ?? "";
  const isImage = ["jpg", "jpeg", "png", "gif", "webp"].includes(ext);
  const isVideo = ["mp4", "webm", "mov"].includes(ext);

  if (isImage) {
    return (
      <a href={fileUrl} target="_blank" rel="noopener noreferrer" className="msg-file-image-link">
        <img src={fileUrl} alt={fileName} className="msg-file-image" />
      </a>
    );
  }

  if (isVideo) {
    return (
      <video controls className="msg-file-video" preload="metadata">
        <source src={fileUrl} />
        Your browser does not support the video tag.
      </video>
    );
  }

  // Generic file download link
  const icon = ext === "pdf" ? "📄" : ext === "zip" ? "🗜️" : "📎";
  const displayName = fileName?.length > 30 ? fileName.slice(0, 28) + "…" : fileName;
  return (
    <a href={fileUrl} download={fileName} className="msg-file-link" target="_blank" rel="noopener noreferrer">
      <span className="msg-file-link__icon">{icon}</span>
      <span className="msg-file-link__name">{displayName}</span>
      <span className="msg-file-link__dl">↓</span>
    </a>
  );
}

// ── Main component ────────────────────────────────────────────────────────────
const ChatWindow = ({ conversation, currentUserId, currentUserType, onMessageSent }) => {
  const [messages, setMessages] = useState([]);
  const [loadingMsgs, setLoadingMsgs] = useState(false);
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const [sendError, setSendError] = useState("");
  const [showOfferModal, setShowOfferModal] = useState(false);
  const [showEmoji, setShowEmoji] = useState(false);
  const [attachments, setAttachments] = useState([]); // File[]

  const bottomRef = useRef(null);
  const textareaRef = useRef(null);
  const fileInputRef = useRef(null);
  const imageInputRef = useRef(null);
  const videoInputRef = useRef(null);

  const convIdRef = useRef(null);
  const fetchMessagesRef = useRef(null);
  const prevMsgCountRef = useRef(0);

  const isExpert = currentUserType === "expert";

  // ── Fetch messages ──────────────────────────────────────────────────────────
  const fetchMessages = useCallback(async (convId) => {
    if (!convId) return;
    try {
      const msgs = await getMessages(convId);
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
  }, []);

  useEffect(() => { fetchMessagesRef.current = fetchMessages; }, [fetchMessages]);

  useEffect(() => {
    if (!conversation) {
      setMessages([]);
      prevMsgCountRef.current = 0;
      return;
    }
    if (convIdRef.current === conversation.id) return;
    convIdRef.current = conversation.id;
    setMessages([]);
    prevMsgCountRef.current = 0;
    setLoadingMsgs(true);
    fetchMessagesRef.current?.(conversation.id);
  }, [conversation?.id]);

  useEffect(() => {
    if (!conversation?.id) return;
    const id = conversation.id;
    const interval = setInterval(() => { fetchMessagesRef.current?.(id); }, 4000);
    return () => clearInterval(interval);
  }, [conversation?.id]);

  useEffect(() => {
    if (messages.length > prevMsgCountRef.current) {
      bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }
    prevMsgCountRef.current = messages.length;
  }, [messages]);

  // ── Send ────────────────────────────────────────────────────────────────────
  const handleSend = async () => {
    const content = text.trim();
    if ((!content && attachments.length === 0) || sending) return;

    // Build optimistic messages — one per file + one for text
    const optimisticIds = [];
    const optimisticMessages = [];

    if (content) {
      const opt = {
        id: `opt-${Date.now()}-text`,
        sender: { id: currentUserId },
        content,
        message_type: "text",
        is_read: false,
        created_at: new Date().toISOString(),
        _optimistic: true,
      };
      optimisticMessages.push(opt);
      optimisticIds.push(opt.id);
    }

    attachments.forEach((f, i) => {
      const opt = {
        id: `opt-${Date.now()}-file-${i}`,
        sender: { id: currentUserId },
        content: "",
        message_type: "file",
        file_url: URL.createObjectURL(f),
        file_name: f.name,
        is_read: false,
        created_at: new Date().toISOString(),
        _optimistic: true,
      };
      optimisticMessages.push(opt);
      optimisticIds.push(opt.id);
    });

    setMessages((prev) => [...prev, ...optimisticMessages]);
    setText("");
    setAttachments([]);
    setSending(true);
    setSendError("");

    try {
      const formData = new FormData();
      if (content) formData.append("content", content);
      attachments.forEach((f) => formData.append("files", f));

      const res = await newRequest.post(
        `/messaging/conversations/${conversation.id}/send/`,
        formData,
        { headers: { "Content-Type": "multipart/form-data" } }
      );

      // Server returns a single object or an array
      const serverMessages = Array.isArray(res.data) ? res.data : [res.data];

      setMessages((prev) => {
        // Remove all optimistic placeholders, then append the real messages
        const withoutOptimistic = prev.filter((m) => !optimisticIds.includes(m.id));
        return [...withoutOptimistic, ...serverMessages];
      });
      onMessageSent?.();
    } catch (err) {
      const detail = err?.response?.data?.detail || "Failed to send. Click to retry.";
      setSendError(detail);
      setMessages((prev) => prev.filter((m) => !optimisticIds.includes(m.id)));
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

  const handleEmojiSelect = (emoji) => {
    setText((prev) => prev + emoji);
    setShowEmoji(false);
    textareaRef.current?.focus();
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files || []);
    setAttachments((prev) => [...prev, ...files].slice(0, 5));
    e.target.value = "";
  };

  const removeAttachment = (index) => {
    setAttachments((prev) => prev.filter((_, i) => i !== index));
  };

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
        <Avatar user={otherParticipant} size={42} className="chat-header-avatar" />
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
             Send Offer
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
              <div key={msg.id} className={`msg ${isMine ? "msg--mine" : "msg--theirs"}`}>
                <OfferCard
                  offer={msg.offer}
                  currentUserId={currentUserId}
                  onResponded={() => {
                    fetchMessagesRef.current?.(conversation.id);
                    onMessageSent?.();
                  }}
                />
                <span className="msg-meta">
                  {new Date(msg.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                </span>
              </div>
            );
          }

          if (msg.message_type === "file") {
            return (
              <div
                key={msg.id}
                className={`msg ${isMine ? "msg--mine" : "msg--theirs"} ${msg._optimistic ? "msg--optimistic" : ""}`}
              >
                {!isMine && <Avatar user={otherParticipant} size={28} className="conv-avatar" />}
                <div className="msg-bubble msg-bubble--file">
                  <FileBubble fileUrl={msg.file_url} fileName={msg.file_name} />
                </div>
                <span className="msg-meta">
                  {new Date(msg.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                  {isMine && msg.is_read && <span className="msg-read-indicator"> ✓✓</span>}
                </span>
              </div>
            );
          }

          return (
            <div
              key={msg.id}
              className={`msg ${isMine ? "msg--mine" : "msg--theirs"} ${msg._optimistic ? "msg--optimistic" : ""}`}
            >
              {!isMine && <Avatar user={otherParticipant} size={28} className="conv-avatar" />}
              <div className="msg-bubble">{msg.content}</div>
              <span className="msg-meta">
                {new Date(msg.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                {isMine && msg.is_read && <span className="msg-read-indicator"> ✓✓</span>}
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

      {/* Attachment previews */}
      {attachments.length > 0 && (
        <div className="attach-preview-row">
          {attachments.map((file, i) => (
            <AttachmentPreview key={i} file={file} onRemove={() => removeAttachment(i)} />
          ))}
        </div>
      )}

      {/* Input row */}
      <div className="chat-input-row">
        <input ref={fileInputRef}  type="file" accept=".pdf,.doc,.docx,.txt,.xls,.xlsx,.ppt,.pptx,.zip" multiple style={{ display: "none" }} onChange={handleFileChange} />
        <input ref={imageInputRef} type="file" accept="image/*" multiple style={{ display: "none" }} onChange={handleFileChange} />
        <input ref={videoInputRef} type="file" accept="video/*" multiple style={{ display: "none" }} onChange={handleFileChange} />

        <div className="chat-attach-group">
          <button className="chat-attach-btn" onClick={() => imageInputRef.current?.click()} title="Attach photo" aria-label="Attach photo" disabled={sending}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/>
            </svg>
          </button>
          <button className="chat-attach-btn" onClick={() => videoInputRef.current?.click()} title="Attach video" aria-label="Attach video" disabled={sending}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <polygon points="23 7 16 12 23 17 23 7"/><rect x="1" y="5" width="15" height="14" rx="2"/>
            </svg>
          </button>
          <button className="chat-attach-btn" onClick={() => fileInputRef.current?.click()} title="Attach document" aria-label="Attach document" disabled={sending}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48"/>
            </svg>
          </button>
        </div>

        <div className="chat-emoji-wrap">
          <button
            className={`chat-attach-btn ${showEmoji ? "chat-attach-btn--active" : ""}`}
            onClick={() => setShowEmoji((v) => !v)}
            title="Emoji"
            aria-label="Emoji"
            disabled={sending}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <circle cx="12" cy="12" r="10"/><path d="M8 14s1.5 2 4 2 4-2 4-2"/><line x1="9" y1="9" x2="9.01" y2="9"/><line x1="15" y1="9" x2="15.01" y2="9"/>
            </svg>
          </button>
          {showEmoji && (
            <EmojiPicker onSelect={handleEmojiSelect} onClose={() => setShowEmoji(false)} />
          )}
        </div>

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
          disabled={(!text.trim() && attachments.length === 0) || sending}
          aria-label="Send message"
        >
          ➤
        </button>
      </div>

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