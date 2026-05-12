import { useEffect, useRef, useState, useCallback, useContext } from "react";
import { useParams } from "react-router-dom";
import AuthContext from "../AuthContext";
import { getConversations, getUnreadCount } from "../api/messaging";
import ConversationList from "../components/messaging/ConversationList";
import ChatWindow from "../components/messaging/ChatWindow";
import "./MessagingPage.scss";

export default function MessagingPage() {
  const { user: currentUser } = useContext(AuthContext);
  console.log("MP render, user id:", currentUser?.id, "ts:", Date.now());
  const { convId } = useParams();

  const [conversations, setConversations] = useState([]);
  const [activeConv, setActiveConv] = useState(null);
  const [loadingConvs, setLoadingConvs] = useState(true);
  const [unreadTotal, setUnreadTotal] = useState(0);
  const [mobileView, setMobileView] = useState("list");
  const [convError, setConvError] = useState(null);

  // ── Keep stable refs to the fetch functions so the polling interval
  //    never needs to be rebuilt when React re-renders the component. ──────────
  const fetchConversationsRef = useRef(null);
  const fetchUnreadRef = useRef(null);

  const fetchConversations = useCallback(async () => {
    try {
      const data = await getConversations();
      const list = Array.isArray(data) ? data : (data?.results ?? []);

      setConversations(list);
      setConvError(null);

      // Refresh the active conversation object from the new list so its
      // data stays current, but only swap the reference when the identity
      // actually changes — this prevents a cascade re-render.
      setActiveConv((prev) => {
        if (!prev) return prev;
        const fresh = list.find((c) => c.id === prev.id);
        // If nothing found, keep the stale object (don't null it out)
        if (!fresh) return prev;
        // Cheap referential-equality guard: same JSON → same object
        return JSON.stringify(fresh) === JSON.stringify(prev) ? prev : fresh;
      });
    } catch (err) {
      setConvError(
        err?.response?.data?.detail || err.message || "Failed to load conversations"
      );
    } finally {
      // Only flip loadingConvs off once — after the first successful fetch.
      setLoadingConvs(false);
    }
  }, []); // ← empty: this function never needs to be recreated

  const fetchUnread = useCallback(async () => {
    try {
      const count = await getUnreadCount();
      setUnreadTotal(count);
    } catch {
      // non-critical — ignore silently
    }
  }, []); // ← empty: same reasoning

  // Keep refs in sync with the latest callback versions
  useEffect(() => { fetchConversationsRef.current = fetchConversations; }, [fetchConversations]);
  useEffect(() => { fetchUnreadRef.current = fetchUnread; }, [fetchUnread]);

  // ── Single polling effect — depends only on currentUser ───────────────────
  // Using refs inside the interval means we never need to tear down and
  // recreate the interval when the functions update (they don't here, but
  // this pattern is future-proof).
  useEffect(() => {
    if (!currentUser?.id) return;

    // Immediate first fetch
    fetchConversationsRef.current?.();
    fetchUnreadRef.current?.();

    const interval = setInterval(() => {
      fetchConversationsRef.current?.();
      fetchUnreadRef.current?.();
    }, 5000);

    return () => clearInterval(interval);
  }, [currentUser?.id]); // ← depend on the id scalar, not the object reference

  // ── Auto-select conversation from URL param ───────────────────────────────
  // Guard with a ref so we only do this once per convId, not on every poll.
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
  }, []);

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
            onSelect={handleSelectConversation}
            loading={loadingConvs}
            currentUserId={currentUser.id}
          />
        </aside>

        <main
          className={`msg-main ${
            mobileView === "list" ? "msg-main--hidden-mobile" : ""
          }`}
        >
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