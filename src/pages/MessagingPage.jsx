import { useEffect, useRef, useState, useCallback, useContext } from "react";
import { useParams } from "react-router-dom";
import AuthContext from "../AuthContext";
import { getConversations } from "../api/messaging";
import { useMessaging } from "../MessagingContext";
import ConversationList from "../components/messaging/ConversationList";
import ChatWindow from "../components/messaging/ChatWindow";
import "./MessagingPage.scss";

function ChatEmptyState() {
  return (
    <div className="chat-empty-state">
      <div className="chat-empty-state__icon-wrap">
        <svg
          className="chat-empty-state__icon"
          viewBox="0 0 80 80"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden="true"
        >
          <rect x="8" y="22" width="64" height="44" rx="6" fill="#94C2ED" opacity="0.18" />
          <rect x="8" y="22" width="64" height="44" rx="6" stroke="#94C2ED" strokeWidth="2.5" />
          <path d="M8 28 L40 50 L72 28" stroke="#94C2ED" strokeWidth="2.5" strokeLinejoin="round" fill="none" />
          <rect x="55" y="14" width="3" height="14" rx="1.5" fill="#86BB71" />
          <rect x="55" y="10" width="10" height="7" rx="1.5" fill="#86BB71" />
          <circle cx="20" cy="18" r="2" fill="#94C2ED" opacity="0.5" />
          <circle cx="14" cy="30" r="1.5" fill="#94C2ED" opacity="0.35" />
          <circle cx="66" cy="16" r="1.5" fill="#86BB71" opacity="0.5" />
        </svg>
      </div>
      <h2 className="chat-empty-state__title">Select a conversation</h2>
      <p className="chat-empty-state__subtitle">
        Choose a chat from the left to start messaging.
      </p>
    </div>
  );
}

export default function MessagingPage() {
  const { user: currentUser } = useContext(AuthContext);
  const { unreadCount: unreadTotal, refreshUnread } = useMessaging();
  const { convId } = useParams();

  const [conversations, setConversations] = useState([]);
  const [activeConv, setActiveConv] = useState(null);
  const [loadingConvs, setLoadingConvs] = useState(true);
  const [mobileView, setMobileView] = useState("list");
  const [convError, setConvError] = useState(null);
  const [darkMode, setDarkMode] = useState(false);

  const fetchConversationsRef = useRef(null);

  const fetchConversations = useCallback(async () => {
    try {
      const data = await getConversations();
      const list = Array.isArray(data) ? data : (data?.results ?? []);
      setConversations((prev) => {
        if (prev.length === list.length && JSON.stringify(prev) === JSON.stringify(list)) return prev;
        return list;
      });
      setConvError((prev) => prev === null ? prev : null);
      setActiveConv((prev) => {
        if (!prev) return prev;
        const fresh = list.find((c) => c.id === prev.id);
        if (!fresh) return prev;
        return JSON.stringify(fresh) === JSON.stringify(prev) ? prev : fresh;
      });
    } catch (err) {
      setConvError(err?.response?.data?.detail || err.message || "Failed to load conversations");
    } finally {
      setLoadingConvs((prev) => prev ? false : prev);
    }
  }, []);

  useEffect(() => { fetchConversationsRef.current = fetchConversations; }, [fetchConversations]);

  useEffect(() => {
    if (!currentUser?.id) return;
    fetchConversationsRef.current?.();
    const interval = setInterval(() => { fetchConversationsRef.current?.(); }, 5000);
    return () => clearInterval(interval);
  }, [currentUser?.id]);

  const didAutoSelectRef = useRef(false);
  useEffect(() => {
    if (!convId || didAutoSelectRef.current) return;
    const match = conversations.find((c) => String(c.id) === String(convId));
    if (match) {
      didAutoSelectRef.current = true;
      setActiveConv(match);
      setMobileView("chat");
    }
  }, [convId, conversations]);

  const handleSelectConversation = (conv) => {
    setActiveConv(conv);
    setMobileView("chat");
  };

  const handleMessageSent = useCallback(() => {
    fetchConversationsRef.current?.();
    refreshUnread();
  }, [refreshUnread]);

  const handleBackToList = () => {
    setMobileView("list");
    setActiveConv(null);
  };

  if (!currentUser) {
    return (
      <div className="msg-page msg-page--auth-required">
        <p>Please log in to access your messages.</p>
      </div>
    );
  }

  return (
    <div className={`msg-page ${darkMode ? "msg-page--dark" : "msg-page--light"}`}>
      <div className="msg-page__body">

        {/* Sidebar — always visible on desktop, toggles on mobile */}
        <aside className={`msg-sidebar ${mobileView === "chat" ? "msg-sidebar--hidden-mobile" : ""}`}>
          <div className="msg-sidebar__header">
            <div className="msg-sidebar__title-row">
              <h1 className="msg-sidebar__title">
                Messages
                {unreadTotal > 0 && (
                  <span className="msg-page__badge">{unreadTotal}</span>
                )}
              </h1>
              <button
                className="msg-theme-toggle"
                onClick={() => setDarkMode((d) => !d)}
                aria-label={darkMode ? "Switch to light mode" : "Switch to dark mode"}
                title={darkMode ? "Light mode" : "Dark mode"}
              >
                {darkMode ? "☀" : "🌙"}
              </button>
            </div>
            <input
              className="msg-sidebar__search"
              type="text"
              placeholder="Search conversations…"
            />
          </div>

          {convError && (
            <div className="msg-sidebar__error">
              <strong>Could not load conversations:</strong> {convError}
            </div>
          )}

          <ConversationList
            conversations={conversations}
            activeId={activeConv?.id}
            onSelect={handleSelectConversation}
            loading={loadingConvs}
            currentUserId={currentUser.id}
          />
        </aside>

        {/* Main chat panel — always visible on desktop */}
        <main className={`msg-main ${mobileView === "list" ? "msg-main--hidden-mobile" : ""}`}>
          {mobileView === "chat" && (
            <button className="msg-back-btn" onClick={handleBackToList}>
              ← Back
            </button>
          )}
          {activeConv ? (
            <ChatWindow
              conversation={activeConv}
              currentUserId={currentUser.id}
              currentUserType={currentUser.user_type}
              onMessageSent={handleMessageSent}
            />
          ) : (
            <ChatEmptyState />
          )}
        </main>

      </div>
    </div>
  );
}