import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import AuthContext from "./AuthContext";
import { getUnreadCount } from "./api/messaging";

// ─── Context ──────────────────────────────────────────────────────────────────
const MessagingContext = createContext(null);

/**
 * MessagingProvider
 *
 * Owns the unread-message count for the entire app.
 * - Polls every 10 s while the user is logged in.
 * - Exposes `unreadCount` and `refreshUnread` to any consumer.
 * - Lives above the router so Navbar, MessagingPage, and any future
 *   component can all read the same value without duplicate requests.
 */
export function MessagingProvider({ children }) {
  const { user } = useContext(AuthContext);
  const [unreadCount, setUnreadCount] = useState(0);

  // Stable fetch function — never recreated
  const fetchUnread = useCallback(async () => {
    try {
      const count = await getUnreadCount();
      setUnreadCount((prev) => (prev === count ? prev : count));
    } catch {
      // non-critical — ignore silently
    }
  }, []);

  const fetchUnreadRef = useRef(fetchUnread);
  useEffect(() => { fetchUnreadRef.current = fetchUnread; }, [fetchUnread]);

  // Start polling when user logs in, stop when they log out
  useEffect(() => {
    if (!user?.id) {
      setUnreadCount(0);
      return;
    }

    fetchUnreadRef.current();

    const interval = setInterval(() => {
      fetchUnreadRef.current();
    }, 10000); // every 10 s is plenty for a badge

    return () => clearInterval(interval);
  }, [user?.id]);

  // Exposed so MessagingPage can trigger an immediate refresh after
  // marking messages as read, sending a message, etc.
  const refreshUnread = useCallback(() => {
    fetchUnreadRef.current();
  }, []);

  return (
    <MessagingContext.Provider value={{ unreadCount, refreshUnread }}>
      {children}
    </MessagingContext.Provider>
  );
}

export function useMessaging() {
  const ctx = useContext(MessagingContext);
  if (!ctx) throw new Error("useMessaging must be used inside MessagingProvider");
  return ctx;
}

export default MessagingContext;