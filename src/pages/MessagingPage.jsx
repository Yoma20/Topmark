import { useEffect, useState, useCallback, useContext } from "react";
import { useParams } from "react-router-dom";
import AuthContext from "../AuthContext";
import { getConversations, getUnreadCount } from "../api/messaging";
import ConversationList from "../components/messaging/ConversationList";
import ChatWindow from "../components/messaging/ChatWindow";
import "./MessagingPage.scss";

export default function MessagingPage() {
  const { user: currentUser } = useContext(AuthContext);
  const { convId } = useParams();

  const [conversations, setConversations] = useState([]);
  const [activeConv, setActiveConv] = useState(null);
  const [loadingConvs, setLoadingConvs] = useState(true);
  const [unreadTotal, setUnreadTotal] = useState(0);
  const [mobileView, setMobileView] = useState("list");
  const [convError, setConvError] = useState(null);

  const fetchConversations = useCallback(async () => {
    try {
      const data = await getConversations();
      const list = Array.isArray(data) ? data : (data?.results ?? []);
      setConversations(list);
      setConvError(null);
      setActiveConv((prev) => {
        if (!prev) return prev;
        return list.find((c) => c.id === prev.id) ?? prev;
      });
    } catch (err) {
      setConvError(err?.response?.data?.detail || err.message || "Failed to load conversations");
    } finally {
      setLoadingConvs(false);
    }
  }, []);

  const fetchUnread = useCallback(async () => {
    try {
      const count = await getUnreadCount();
      setUnreadTotal(count);
    } catch {
      // non-critical
    }
  }, []);

  useEffect(() => {
    if (!currentUser) return;
    fetchConversations();
    fetchUnread();
    const interval = setInterval(() => {
      fetchConversations();
      fetchUnread();
    }, 5000);
    return () => clearInterval(interval);
  }, [currentUser, fetchConversations, fetchUnread]);

  useEffect(() => {
    if (convId && conversations.length > 0 && !activeConv) {
      const match = conversations.find((c) => String(c.id) === String(convId));
      if (match) {
        setActiveConv(match);
        setMobileView("chat");
      }
    }
  }, [convId, conversations, activeConv]);

  const handleSelectConversation = (conv) => {
    setActiveConv(conv);
    setMobileView("chat");
  };

  const handleMessageSent = () => fetchConversations();

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
    <div className="msg-page">
      <div className="msg-page__body">
        <aside className={`msg-sidebar ${mobileView === "chat" ? "msg-sidebar--hidden-mobile" : ""}`}>
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
            onSelect={handleSelectConversation}
            loading={loadingConvs}
            currentUserId={currentUser.id}
          />
        </aside>

        <main className={`msg-main ${mobileView === "list" ? "msg-main--hidden-mobile" : ""}`}>
          {mobileView === "chat" && (
            <button className="msg-back-btn" onClick={handleBackToList}>
              ← Back
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