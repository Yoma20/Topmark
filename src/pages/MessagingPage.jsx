import { useEffect, useState, useCallback, useContext } from "react";
import AuthContext from "../AuthContext";
import { getConversations, getUnreadCount } from "../api/messaging";
import ConversationList from "../components/messaging/ConversationList";
import ChatWindow from "../components/messaging/ChatWindow";
import "./MessagingPage.scss";

export default function MessagingPage() {
  const { user: currentUser } = useContext(AuthContext);

  const [conversations, setConversations] = useState([]);
  const [activeConv, setActiveConv] = useState(null);
  const [loadingConvs, setLoadingConvs] = useState(true);
  const [unreadTotal, setUnreadTotal] = useState(0);
  const [mobileView, setMobileView] = useState("list");

  const fetchConversations = useCallback(async () => {
    try {
      const data = await getConversations();
      setConversations(data);
      if (activeConv) {
        const updated = data.find((c) => c.id === activeConv.id);
        if (updated) setActiveConv(updated);
      }
    } catch (err) {
      console.error("Failed to load conversations", err);
    } finally {
      setLoadingConvs(false);
    }
  }, [activeConv]);

  const fetchUnread = useCallback(async () => {
    try {
      const count = await getUnreadCount();
      setUnreadTotal(count);
    } catch {
      // Non-critical
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
  }, [currentUser]); // eslint-disable-line

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
      <div className="msg-page__header">
        <h1 className="msg-page__title">
          Messages
          {unreadTotal > 0 && (
            <span className="msg-page__badge">{unreadTotal}</span>
          )}
        </h1>
      </div>

      <div className="msg-page__body">
        <aside className={`msg-sidebar ${mobileView === "chat" ? "msg-sidebar--hidden-mobile" : ""}`}>
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
            onMessageSent={handleMessageSent}
          />
        </main>
      </div>
    </div>
  );
}