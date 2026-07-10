import { useEffect, useRef, useState, useCallback } from "react";
import newRequest from "../../utils/newRequest";
import { getMessages } from "../../api/messaging";
import { formatDistanceToNow } from "./utils";
import OfferCard from "../offerCard/OfferCard";
import SendOfferModal from "../offerCard/SendOfferModal";
import { Avatar } from "./ConversationList";

// ── Simple emoji picker (for composing) ────────────────────────────────────────
const EMOJI_LIST = [
  "😊","😂","❤️","👍","🙏","😭","😍","🔥","✅","💯",
  "🎉","😅","🤔","👀","💪","✨","😢","🥹","😎","🤝",
  "👋","🙌","💬","📎","📝","⭐","🚀","💡","✔️","❓",
];

// NEW — small, fast reaction strip shown per-message (kept short on purpose;
// this is a "tap a reaction" affordance, not the full composer picker above).
const QUICK_REACTIONS = ["👍", "❤️", "😂", "😮", "😢", "🙏"];

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

// NEW — the little popover of quick reactions, shown when you click the
// "react" button on a message.
function ReactionPicker({ onSelect, onClose }) {
  const ref = useRef(null);

  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) onClose();
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [onClose]);

  return (
    <div className="reaction-picker" ref={ref} role="dialog" aria-label="Add reaction">
      {QUICK_REACTIONS.map((emoji) => (
        <button
          key={emoji}
          className="reaction-picker__btn"
          onClick={() => onSelect(emoji)}
          aria-label={`React with ${emoji}`}
        >
          {emoji}
        </button>
      ))}
    </div>
  );
}

// NEW — the row of reaction pills rendered under a message that has any.
function ReactionRow({ reactions, onToggle }) {
  if (!reactions || reactions.length === 0) return null;
  return (
    <div className="reaction-row">
      {reactions.map((r) => (
        <button
          key={r.emoji}
          className={`reaction-pill ${r.reacted_by_me ? "reaction-pill--mine" : ""}`}
          onClick={() => onToggle(r.emoji)}
          title={r.reacted_by_me ? "Remove your reaction" : "React"}
        >
          <span>{r.emoji}</span>
          <span className="reaction-pill__count">{r.count}</span>
        </button>
      ))}
    </div>
  );
}

// NEW — three-dot menu for a message's own sender: Edit / Delete.
function MessageActionsMenu({ onEdit, onDelete, onClose }) {
  const ref = useRef(null);

  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) onClose();
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [onClose]);

  return (
    <div className="msg-actions-menu" ref={ref} role="menu">
      {onEdit && (
        <button role="menuitem" onClick={onEdit}>Edit</button>
      )}
      <button role="menuitem" className="msg-actions-menu__danger" onClick={onDelete}>
        Delete
      </button>
    </div>
  );
}

// ─── Attachment pill shown in the input area before sending ────────────────────
function AttachmentPreview({ file, onRemove }) {
  const isImage = file.type.startsWith("image/");
  const isVideo = file.type.startsWith("video/");
  const icon = isImage ? (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="18" height="18" rx="2" />
      <circle cx="8.5" cy="8.5" r="1.5" />
      <path d="M21 15l-5-5L5 21" />
    </svg>
  ) : isVideo ? (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="4" width="15" height="16" rx="2" />
      <path d="M17 8l5-3v14l-5-3V8z" />
    </svg>
  ) : (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <path d="M14 2v6h6" />
      <path d="M8 13h8M8 17h5" />
    </svg>
  );
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

// ─── Renders a file message bubble ─────────────────────────────────────────────
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
  const icon = ext === "pdf" ? (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <path d="M14 2v6h6" />
      <path d="M8 13h8M8 17h5" />
    </svg>
  ) : ext === "zip" ? (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <path d="M14 2v6h6" />
      <path d="M10 8v2M10 12v2M10 16v2" strokeWidth="2" />
      <path d="M8 8h4M8 12h4M8 16h4" />
    </svg>
  ) : (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66L9.41 17.41a2 2 0 0 1-2.83-2.83l8.49-8.48" />
    </svg>
  );
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

  // NEW — reactions / edit / delete / presence / typing state
  const [openReactionPickerId, setOpenReactionPickerId] = useState(null);
  const [openActionsMenuId, setOpenActionsMenuId] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [editText, setEditText] = useState("");
  const [otherPresence, setOtherPresence] = useState({ is_online: false, last_seen: null });
  const [otherTyping, setOtherTyping] = useState(false);

  const bottomRef = useRef(null);
  const textareaRef = useRef(null);
  const fileInputRef = useRef(null);
  const imageInputRef = useRef(null);
  const videoInputRef = useRef(null);

  const convIdRef = useRef(null);
  const fetchMessagesRef = useRef(null);
  const prevMsgCountRef = useRef(0);

  // NEW — typing-over-websocket refs (best-effort, see effect below)
  const typingSocketRef = useRef(null);
  const typingStopTimeoutRef = useRef(null);
  const lastTypingSentRef = useRef(false);

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

  // CHANGED — tightened from 120000ms to 15000ms so reactions / edits /
  // deletes from the other participant (and new messages, pending the
  // websocket fix) show up reasonably promptly instead of after 2 minutes.
  useEffect(() => {
    if (!conversation?.id) return;
    const id = conversation.id;
    const interval = setInterval(() => { fetchMessagesRef.current?.(id); }, 15000);
    return () => clearInterval(interval);
  }, [conversation?.id]);

  // NEW — presence poll for the other participant. This is fully
  // functional today (REST + heartbeat), independent of the websocket.
  useEffect(() => {
    const otherId = conversation?.other_participant?.id;
    if (!otherId) return;
    let cancelled = false;

    const poll = async () => {
      try {
        const res = await newRequest.get(`/messaging/presence/${otherId}/`);
        if (!cancelled) setOtherPresence(res.data);
      } catch {
        // presence just won't update this cycle
      }
    };

    poll();
    const interval = setInterval(poll, 20000);
    return () => { cancelled = true; clearInterval(interval); };
  }, [conversation?.other_participant?.id]);

  // NEW — best-effort typing indicator over the chat websocket. This will
  // simply fail to connect while the known ws/messaging connection issue
  // is unresolved, and is caught silently so it can never break the rest
  // of the chat. Once that's fixed, typing indicators activate with no
  // further changes needed here.
  useEffect(() => {
    if (!conversation?.id) return;
    let ws;
    try {
      const proto = window.location.protocol === "https:" ? "wss" : "ws";
      // Adjust VITE_WS_HOST if your unread-count socket elsewhere in the
      // app builds its URL differently — match that pattern here.
      const host = import.meta.env.VITE_WS_HOST || window.location.host;
      ws = new WebSocket(`${proto}://${host}/ws/messaging/${conversation.id}/`);

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (data.type === "typing") {
            setOtherTyping(!!data.is_typing);
            if (data.is_typing) {
              clearTimeout(typingStopTimeoutRef.current);
              typingStopTimeoutRef.current = setTimeout(() => setOtherTyping(false), 4000);
            }
          }
        } catch {
          // ignore malformed frames
        }
      };
      ws.onerror = () => {}; // known issue — don't spam the console further
      typingSocketRef.current = ws;
    } catch {
      typingSocketRef.current = null;
    }

    return () => {
      clearTimeout(typingStopTimeoutRef.current);
      setOtherTyping(false);
      try { ws?.close(); } catch {}
    };
  }, [conversation?.id]);

  const sendTypingSignal = useCallback((isTyping) => {
    const ws = typingSocketRef.current;
    if (ws && ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify({ type: "typing", is_typing: isTyping }));
      lastTypingSentRef.current = isTyping;
    }
  }, []);

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
        is_edited: false,
        is_deleted: false,
        reactions: [],
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
        is_edited: false,
        is_deleted: false,
        reactions: [],
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
    sendTypingSignal(false); // NEW — stop "typing" the moment we actually send

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

    // NEW — fire "typing" (debounced stop) over the websocket, best-effort.
    if (!lastTypingSentRef.current) sendTypingSignal(true);
    clearTimeout(typingStopTimeoutRef.current);
    typingStopTimeoutRef.current = setTimeout(() => sendTypingSignal(false), 2000);
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

  // NEW — reactions
  const handleToggleReaction = async (messageId, emoji) => {
    setOpenReactionPickerId(null);
    try {
      const res = await newRequest.post(`/messaging/messages/${messageId}/react/`, { emoji });
      setMessages((prev) => prev.map((m) => (m.id === messageId ? res.data : m)));
    } catch (err) {
      console.error("Failed to toggle reaction", err);
    }
  };

  // NEW — edit
  const startEdit = (msg) => {
    setOpenActionsMenuId(null);
    setEditingId(msg.id);
    setEditText(msg.content);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditText("");
  };

  const saveEdit = async (messageId) => {
    const content = editText.trim();
    if (!content) return;
    try {
      const res = await newRequest.patch(`/messaging/messages/${messageId}/edit/`, { content });
      setMessages((prev) => prev.map((m) => (m.id === messageId ? res.data : m)));
      setEditingId(null);
      setEditText("");
    } catch (err) {
      console.error("Failed to edit message", err);
    }
  };

  // NEW — delete
  const handleDeleteMessage = async (messageId) => {
    setOpenActionsMenuId(null);
    if (!window.confirm("Delete this message? This can't be undone.")) return;
    try {
      const res = await newRequest.delete(`/messaging/messages/${messageId}/delete/`);
      setMessages((prev) => prev.map((m) => (m.id === messageId ? res.data : m)));
    } catch (err) {
      console.error("Failed to delete message", err);
    }
  };

  if (!conversation) {
    return (
      <div className="chat-window">
        <div className="chat-empty">
        <span className="chat-empty-icon">
          <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
          </svg>
        </span>
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
            {/* CHANGED — real presence instead of just role/gig text */}
            {otherTyping ? (
              <span className="chat-header-typing">typing…</span>
            ) : otherPresence.is_online ? (
              <span className="chat-header-online">Online</span>
            ) : otherPresence.last_seen ? (
              <span>Last seen {formatDistanceToNow(otherPresence.last_seen)} ago</span>
            ) : (
              <>{otherParticipant?.user_type}</>
            )}
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
          const isEditingThis = editingId === msg.id;

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

          // NEW — deleted placeholder (applies to any type once soft-deleted)
          if (msg.is_deleted) {
            return (
              <div key={msg.id} className={`msg ${isMine ? "msg--mine" : "msg--theirs"}`}>
                {!isMine && <Avatar user={otherParticipant} size={28} className="conv-avatar" />}
                <div className="msg-bubble msg-bubble--deleted">
                  <em>This message was deleted</em>
                </div>
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
                <div className="msg-bubble-wrap">
                  <div className="msg-bubble msg-bubble--file">
                    <FileBubble fileUrl={msg.file_url} fileName={msg.file_name} />
                  </div>
                  {/* NEW — reactions + hover actions apply to files too */}
                  <ReactionRow reactions={msg.reactions} onToggle={(emoji) => handleToggleReaction(msg.id, emoji)} />
                  {!msg._optimistic && (
                    <div className="msg-hover-actions">
                      <button
                        className="msg-hover-actions__btn"
                        onClick={() => setOpenReactionPickerId(msg.id)}
                        aria-label="React"
                        title="React"
                      >
                        😊
                      </button>
                      {isMine && (
                        <button
                          className="msg-hover-actions__btn"
                          onClick={() => setOpenActionsMenuId(msg.id)}
                          aria-label="More options"
                          title="More options"
                        >
                          ⋯
                        </button>
                      )}
                    </div>
                  )}
                  {openReactionPickerId === msg.id && (
                    <ReactionPicker
                      onSelect={(emoji) => handleToggleReaction(msg.id, emoji)}
                      onClose={() => setOpenReactionPickerId(null)}
                    />
                  )}
                  {openActionsMenuId === msg.id && (
                    <MessageActionsMenu
                      onDelete={() => handleDeleteMessage(msg.id)}
                      onClose={() => setOpenActionsMenuId(null)}
                    />
                  )}
                </div>
                <span className="msg-meta">
                  {new Date(msg.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                  {isMine && msg.is_read && <span className="msg-read-indicator"> ✓✓</span>}
                </span>
              </div>
            );
          }

          // ── Regular text message ────────────────────────────────────────────
          return (
            <div
              key={msg.id}
              className={`msg ${isMine ? "msg--mine" : "msg--theirs"} ${msg._optimistic ? "msg--optimistic" : ""}`}
            >
              {!isMine && <Avatar user={otherParticipant} size={28} className="conv-avatar" />}
              <div className="msg-bubble-wrap">
                {isEditingThis ? (
                  <div className="msg-edit-wrap">
                    <textarea
                      className="msg-edit-textarea"
                      value={editText}
                      onChange={(e) => setEditText(e.target.value)}
                      rows={2}
                      autoFocus
                      maxLength={5000}
                    />
                    <div className="msg-edit-actions">
                      <button onClick={cancelEdit}>Cancel</button>
                      <button onClick={() => saveEdit(msg.id)} className="msg-edit-actions__save">Save</button>
                    </div>
                  </div>
                ) : (
                  <div className="msg-bubble">
                    {msg.content}
                    {msg.is_edited && <span className="msg-edited-tag"> (edited)</span>}
                  </div>
                )}

                {/* NEW — reactions */}
                <ReactionRow reactions={msg.reactions} onToggle={(emoji) => handleToggleReaction(msg.id, emoji)} />

                {/* NEW — hover actions: react (everyone), edit/delete (own messages) */}
                {!msg._optimistic && !isEditingThis && (
                  <div className="msg-hover-actions">
                    <button
                      className="msg-hover-actions__btn"
                      onClick={() => setOpenReactionPickerId(msg.id)}
                      aria-label="React"
                      title="React"
                    >
                      😊
                    </button>
                    {isMine && (
                      <button
                        className="msg-hover-actions__btn"
                        onClick={() => setOpenActionsMenuId(msg.id)}
                        aria-label="More options"
                        title="More options"
                      >
                        ⋯
                      </button>
                    )}
                  </div>
                )}
                {openReactionPickerId === msg.id && (
                  <ReactionPicker
                    onSelect={(emoji) => handleToggleReaction(msg.id, emoji)}
                    onClose={() => setOpenReactionPickerId(null)}
                  />
                )}
                {openActionsMenuId === msg.id && (
                  <MessageActionsMenu
                    onEdit={() => startEdit(msg)}
                    onDelete={() => handleDeleteMessage(msg.id)}
                    onClose={() => setOpenActionsMenuId(null)}
                  />
                )}
              </div>
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