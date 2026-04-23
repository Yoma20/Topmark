// src/components/messaging/ConversationList.jsx
import { formatDistanceToNow } from "./utils";

export default function ConversationList({
  conversations,
  activeId,
  onSelect,
  loading,
  currentUserId,
}) {
  if (loading) {
    return (
      <div className="conv-list conv-list--loading">
        {[1, 2, 3].map((i) => (
          <div key={i} className="conv-item conv-item--skeleton">
            <div className="skeleton skeleton--avatar" />
            <div className="skeleton-lines">
              <div className="skeleton skeleton--line" />
              <div className="skeleton skeleton--line skeleton--short" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (!conversations.length) {
    return (
      <div className="conv-list conv-list--empty">
        <span>💬</span>
        <p>No conversations yet.</p>
        <small>Start one by messaging an expert or student.</small>
      </div>
    );
  }

  return (
    <ul className="conv-list">
      {conversations.map((conv) => {
        const other = conv.other_participant;
        const last = conv.last_message;
        const unread = conv.unread_count;
        const isActive = conv.id === activeId;
        const isMine = last?.sender_id === currentUserId;

        return (
          <li
            key={conv.id}
            className={`conv-item ${isActive ? "conv-item--active" : ""} ${
              unread > 0 ? "conv-item--unread" : ""
            }`}
            onClick={() => onSelect(conv)}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => e.key === "Enter" && onSelect(conv)}
          >
            <div className="conv-avatar">
              {other.username.charAt(0).toUpperCase()}
            </div>
            <div className="conv-info">
              <div className="conv-header">
                <span className="conv-name">{other.username}</span>
                {last && (
                  <span className="conv-time">
                    {formatDistanceToNow(last.created_at)}
                  </span>
                )}
              </div>
              <div className="conv-preview">
                <span className="conv-preview-text">
                  {last
                    ? `${isMine ? "You: " : ""}${last.content}`
                    : "No messages yet"}
                </span>
                {unread > 0 && (
                  <span className="conv-badge">{unread > 99 ? "99+" : unread}</span>
                )}
              </div>
            </div>
          </li>
        );
      })}
    </ul>
  );
}
