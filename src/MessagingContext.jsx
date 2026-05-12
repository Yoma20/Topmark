import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import AuthContext from "./AuthContext";

const MessagingContext = createContext(null);

/**
 * MessagingProvider
 *
 * Owns the unread-message badge count for the entire app.
 *
 * Uses a WebSocket to ws/unread/ instead of polling — the server pushes
 * updates the moment a new message arrives, so the badge is always current
 * without any polling overhead.
 *
 * Falls back gracefully if the WebSocket drops (Railway has ~5 min idle
 * timeouts) by reconnecting with exponential back-off.
 */

const WS_BASE = import.meta.env.VITE_WS_BASE; // e.g. wss://your-app.railway.app

export function MessagingProvider({ children }) {
  const { user } = useContext(AuthContext);
  const [unreadCount, setUnreadCount] = useState(0);

  const wsRef         = useRef(null);
  const reconnectRef  = useRef(null);
  const mountedRef    = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    return () => { mountedRef.current = false; };
  }, []);

  const connect = useCallback(() => {
    if (!user?.id || !WS_BASE) return;

    // Clean up any existing socket before opening a new one
    if (wsRef.current) {
      wsRef.current.onclose = null;  // prevent reconnect loop on manual close
      wsRef.current.close();
    }

    const ws = new WebSocket(`${WS_BASE}/ws/unread/`);
    wsRef.current = ws;

    ws.onmessage = (e) => {
      try {
        const { unread_count } = JSON.parse(e.data);
        if (mountedRef.current) {
          setUnreadCount((prev) => (prev === unread_count ? prev : unread_count));
        }
      } catch { /* ignore malformed frames */ }
    };

    ws.onclose = (e) => {
      if (!mountedRef.current) return;
      // Reconnect with back-off (2s, 4s, 8s… capped at 30s)
      const delay = Math.min(30000, 2000 * (2 ** (reconnectRef.current?.attempt ?? 0)));
      const attempt = (reconnectRef.current?.attempt ?? 0) + 1;
      reconnectRef.current = { attempt };
      setTimeout(() => {
        if (mountedRef.current && user?.id) connect();
      }, delay);
    };

    ws.onerror = () => ws.close(); // triggers onclose → reconnect

    // Reset back-off counter on successful open
    ws.onopen = () => { reconnectRef.current = { attempt: 0 }; };
  }, [user?.id]);  // reconnect when user changes

  useEffect(() => {
    if (!user?.id) {
      setUnreadCount(0);
      if (wsRef.current) {
        wsRef.current.onclose = null;
        wsRef.current.close();
        wsRef.current = null;
      }
      return;
    }

    connect();

    return () => {
      if (wsRef.current) {
        wsRef.current.onclose = null;
        wsRef.current.close();
        wsRef.current = null;
      }
    };
  }, [user?.id, connect]);

  /**
   * refreshUnread — manually ask the server for the current count.
   * Used by MessagingPage after marking messages as read.
   * With WebSockets the server pushes updates automatically, but this
   * is kept for explicit refreshes (e.g. after opening a conversation).
   */
  const refreshUnread = useCallback(() => {
    import("./api/messaging").then(({ getUnreadCount }) => {
      getUnreadCount()
        .then((count) => {
          if (mountedRef.current) setUnreadCount(count);
        })
        .catch(() => { /* non-critical */ });
    });
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