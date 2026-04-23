// src/pages/MessagingPage.jsx
import { useEffect, useState, useCallback } from "react";
import { getConversations, getUnreadCount } from "../api/messaging";
import ConversationList from "../components/messaging/ConversationList";
import ChatWindow from "../components/messaging/ChatWindow";
import "./MessagingPage.scss";

/**
 * MessagingPage
 *
 * Props:
 *   currentUser  – the logged-in user object, must have { id, username }
 *                  Pull this from your auth context / Redux store.
 *
 * Usage in your router:
 *   <Route path="/messages" element={<MessagingPage currentUser={user} />} />
 */
export default function MessagingPage({ currentUser }) {
  const [conversations, setConversations] = useState([]);
  const [activeConv, setActiveConv] = useState(null);
  const [loadingConvs, setLoadingConvs] = useState(true);
  const [unreadTotal, setUnreadTotal] = useState(0);
  const [mobileView, setMobileView] = useState("list"); // "list" | "chat"

  const fetchConversations = useCallback(async () => {
    try {
      const data = await getConversations();
      setConversations(data);

      // Keep active conversation in sync if it's updated
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
    fetchConversations();
    fetchUnread();

    // Refresh conversation list every 5 seconds (lightweight polling)
    const interval = setInterval(() => {
      fetchConversations();
      fetchUnread();
    }, 5000);
    return () => clearInterval(interval);
  }, []); // eslint-disable-line

  const handleSelectConversation = (conv) => {
    setActiveConv(conv);
    setMobileView("chat");
  };

  const handleMessageSent = () => {
    // Refresh conversation list so last_message + ordering update immediately
    fetchConversations();
  };

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
        {/* Sidebar — hidden on mobile when chat is open */}
        <aside
          className={`msg-sidebar ${
            mobileView === "chat" ? "msg-sidebar--hidden-mobile" : ""
          }`}
        >
          <ConversationList
            conversations={conversations}
            activeId={activeConv?.id}
            onSelect={handleSelectConversation}
            loading={loadingConvs}
            currentUserId={currentUser.id}
          />
        </aside>

        {/* Chat area */}
        <main
          className={`msg-main ${
            mobileView === "list" ? "msg-main--hidden-mobile" : ""
          }`}
        >
          {/* Mobile back button */}
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
