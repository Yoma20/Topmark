// src/components/messaging/ConversationList.jsx
import { formatDistanceToNow } from "./utils";

/** Renders a real profile picture if available, otherwise falls back to the
 *  coloured initial avatar that was there before. */
function Avatar({ user, size = 40, className = "conv-avatar" }) {
  if (user?.profile_picture) {
    return (
      <img
        src={user.profile_picture}
        alt={user.username}
        className={`${className} ${className}--img`}
        style={{ width: size, height: size, borderRadius: "50%", objectFit: "cover" }}
        onError={(e) => {
          // If the image fails to load, swap it out for the initial fallback
          e.currentTarget.style.display = "none";
          e.currentTarget.nextSibling?.style.removeProperty("display");
        }}
      />
    );
  }
  return (
    <div
      className={className}
      style={{ width: size, height: size }}
      aria-label={user?.username}
    >
      {user?.username?.charAt(0).toUpperCase()}
    </div>
  );
}

export { Avatar };

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
      
         <span className="conves"> Clean!</span>
      
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

        // NEW: prefer real backend presence (REST heartbeat-driven — see
        // presence.py). Falls back to the old "last message < 10 min"
        // heuristic only if the backend hasn't been updated yet, so this
        // degrades gracefully rather than breaking.
        const isOnline = typeof other?.is_online === "boolean"
          ? other.is_online
          : (last ? Date.now() - new Date(last.created_at).getTime() < 10 * 60 * 1000 : false);

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
            <div className="conv-avatar-wrap">
              <Avatar user={other} size={40} className="conv-avatar" />
              <span
                className={`conv-status-dot ${
                  isOnline ? "conv-status-dot--online" : "conv-status-dot--offline"
                }`}
                title={isOnline ? "Online" : "Offline"}
              />
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
              {conv.gig_title && (
                <div className="conv-gig-tag">📎 {conv.gig_title}</div>
              )}
            </div>
          </li>
        );
      })}
    </ul>
  );
}