import { useEffect, useRef, useState, useCallback, useContext } from "react";
import AuthContext from "../AuthContext";
import { getConversations } from "../api/messaging";
import { useMessaging } from "../MessagingContext";
import ConversationList from "../components/messaging/ConversationList";
import ChatWindow from "../components/messaging/ChatWindow";
import "./MessagingPage.scss";

export default function MessagingPage() {
  const { user: currentUser } = useContext(AuthContext);
  const { unreadCount: unreadTotal, refreshUnread } = useMessaging();

  const [conversations, setConversations]   = useState([]);
  const [activeConv, setActiveConv]         = useState(null);
  const [loadingConvs, setLoadingConvs]     = useState(true);
  const [convError, setConvError]           = useState(null);

  // Mobile only — "list" or "chat"
  const [mobileView, setMobileView] = useState("list");

  const fetchConversationsRef = useRef(null);

  const fetchConversations = useCallback(async () => {
    try {
      const data = await getConversations();
      const list = Array.isArray(data) ? data : (data?.results ?? []);

      setConversations((prev) => {
        if (
          prev.length === list.length &&
          JSON.stringify(prev) === JSON.stringify(list)
        ) return prev;
        return list;
      });

      setConvError((prev) => (prev === null ? prev : null));

      setActiveConv((prev) => {
        if (!prev) return prev;
        const fresh = list.find((c) => c.id === prev.id);
        if (!fresh) return prev;
        return JSON.stringify(fresh) === JSON.stringify(prev) ? prev : fresh;
      });
    } catch (err) {
      setConvError(
        err?.response?.data?.detail || err.message || "Failed to load conversations"
      );
    } finally {
      setLoadingConvs((prev) => (prev ? false : prev));
    }
  }, []);

  useEffect(() => {
    fetchConversationsRef.current = fetchConversations;
  }, [fetchConversations]);

  // ── Polling — never navigates, stays on page ──────────────────────────────
  useEffect(() => {
    if (!currentUser?.id) return;
    fetchConversationsRef.current?.();
    const interval = setInterval(() => {
      fetchConversationsRef.current?.();
    }, 5000);
    return () => clearInterval(interval);
  }, [currentUser?.id]);

  // ── Select a conversation — NO navigation, just state update ─────────────
  const handleSelectConversation = (conv) => {
    setActiveConv(conv);
    setMobileView("chat"); // only matters on mobile
  };

  // ── Back button — just resets state, does NOT navigate/go back ───────────
  const handleBackToList = () => {
    setMobileView("list");
    setActiveConv(null);
    // ❌ DO NOT call navigate(-1) or navigate('/') — that's what was breaking it
  };

  const handleMessageSent = useCallback(() => {
    fetchConversationsRef.current?.();
    refreshUnread();
  }, [refreshUnread]);

  if (!currentUser) {
    return (
      <div className="msg-page msg-page--auth-required">
        <p>Please log in to access your messages.</p>
      </div>
    );
  }

  return (
    <div className="msg-page">
      <div className="msg-page__body">

        {/* ── Sidebar (conversation list) ── */}
        <aside
          className={`msg-sidebar ${
            mobileView === "chat" ? "msg-sidebar--hidden-mobile" : ""
          }`}
        >
          <div className="msg-sidebar__header">
            <h1 className="msg-sidebar__title">
              Messages
              {unreadTotal > 0 && (
                <span className="msg-page__badge">{unreadTotal}</span>
              )}
            </h1>
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
            onSelect={handleSelectConversation}   // ← sets state, no navigation
            loading={loadingConvs}
            currentUserId={currentUser.id}
          />
        </aside>

        {/* ── Main chat panel ── */}
        <main
          className={`msg-main ${
            mobileView === "list" ? "msg-main--hidden-mobile" : ""
          }`}
        >
          {/* Back button — mobile only, resets to list view without navigating */}
          {mobileView === "chat" && (
            <button className="msg-back-btn" onClick={handleBackToList}>
              ← Back to messages
            </button>
          )}

          <ChatWindow
            conversation={activeConv}
            currentUserId={currentUser.id}
            currentUserType={currentUser.user_type}
            onMessageSent={handleMessageSent}
          />
        </main>

      </div>
    </div>
  );
}