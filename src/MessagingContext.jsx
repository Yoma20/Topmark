import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import AuthContext from "./AuthContext";
import { playNotificationSound, unlockAudio } from "./utils/soundNotification";
// ^ adjust this import path to wherever soundNotification.js actually lives in your tree

const MessagingContext = createContext(null);

const NOTIF_PREF_KEY = "topmark_msg_notifications_enabled";

/**
 * MessagingProvider
 *
 * Owns the unread-message badge count for the entire app, and the
 * "play a sound on new message" notification.
 *
 * PRIMARY PATH: WebSocket to ws/unread/ — server pushes updates the
 * moment a new message arrives, so the badge is current with no
 * polling overhead. Kept as-is, per your call.
 *
 * SAFETY NET: the websocket is known to drop / fail to connect
 * sometimes (Railway idle timeouts, the broader ws issue we've been
 * tracking). If it's down, the badge and the sound both silently stop
 * working with no fallback — that was the actual bug. So this now
 * ALSO polls getUnreadCount() on an interval, purely as a backup.
 * Whichever source (socket or poll) reports a number first "wins" —
 * they both just call the same setUnreadCount setter.
 *
 * SOUND: fires only when unreadCount goes UP from its previous value
 * (not on initial load, not on decreases from marking things read),
 * and only if the user has notifications enabled.
 */

const WS_BASE = import.meta.env.VITE_WS_BASE; // e.g. wss://your-app.railway.app
const POLL_INTERVAL_MS = 20000; // fallback poll, only matters when the socket is down

export function MessagingProvider({ children }) {
  const { user } = useContext(AuthContext);
  const [unreadCount, setUnreadCount] = useState(0);

  // NEW — user-controlled notification toggle, persisted across sessions.
  const [notificationsEnabled, setNotificationsEnabled] = useState(() => {
    const saved = localStorage.getItem(NOTIF_PREF_KEY);
    return saved === null ? true : saved === "true"; // default ON
  });

  const wsRef          = useRef(null);
  const reconnectRef    = useRef(null);
  const mountedRef      = useRef(true);
  const pollIntervalRef = useRef(null);
  const prevUnreadRef   = useRef(0);
  const hasLoadedOnceRef = useRef(false); // don't play a sound for the very first count we ever see
  const notificationsEnabledRef = useRef(notificationsEnabled);

  // Keep a ref in sync so the websocket/poll callbacks (created once) always
  // read the latest toggle state without needing to be recreated.
  useEffect(() => {
    notificationsEnabledRef.current = notificationsEnabled;
  }, [notificationsEnabled]);

  useEffect(() => {
    mountedRef.current = true;
    return () => { mountedRef.current = false; };
  }, []);

  // NEW — unlock audio playback on the first real user interaction anywhere
  // in the app. Browsers block audio until this happens, so this needs to
  // run once, early, globally — this provider wraps the whole app, so it's
  // the right place.
  useEffect(() => {
    const handler = () => {
      unlockAudio();
      window.removeEventListener("click", handler);
      window.removeEventListener("keydown", handler);
    };
    window.addEventListener("click", handler);
    window.addEventListener("keydown", handler);
    return () => {
      window.removeEventListener("click", handler);
      window.removeEventListener("keydown", handler);
    };
  }, []);

  // NEW — central place both the socket and the poll funnel through, so the
  // "did it go up? should we play a sound?" logic only lives in one spot.
  const applyUnreadCount = useCallback((next) => {
    if (!mountedRef.current) return;
    setUnreadCount((prev) => {
      if (prev === next) return prev;

      const wentUp = hasLoadedOnceRef.current && next > prevUnreadRef.current;
      if (wentUp && notificationsEnabledRef.current) {
        playNotificationSound();
      }

      prevUnreadRef.current = next;
      hasLoadedOnceRef.current = true;
      return next;
    });
  }, []);

  const connect = useCallback(() => {
    if (!user?.id || !WS_BASE) return;

    // Clean up any existing socket before opening a new one
    if (wsRef.current) {
      wsRef.current.onclose = null;  // prevent reconnect loop on manual close
      wsRef.current.close();
    }

    const wsProtocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    const WS_BASE = `${wsProtocol}//${window.location.host}`;
    wsRef.current = new WebSocket(`${WS_BASE}/ws/unread/`);

    ws.onmessage = (e) => {
      try {
        const { unread_count } = JSON.parse(e.data);
        applyUnreadCount(unread_count);
      } catch { /* ignore malformed frames */ }
    };

    ws.onclose = () => {
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
  }, [user?.id, applyUnreadCount]);

  // NEW — the polling safety net. Runs continuously alongside the socket
  // (not just when the socket is down) — that keeps this simple and self-
  // healing, and the socket path still "wins" on latency whenever it's
  // actually connected, since it'll update the count first.
  const pollOnce = useCallback(() => {
    import("./api/messaging").then(({ getUnreadCount }) => {
      getUnreadCount()
        .then((count) => applyUnreadCount(count))
        .catch(() => { /* non-critical, just try again next interval */ });
    });
  }, [applyUnreadCount]);

  useEffect(() => {
    if (!user?.id) {
      setUnreadCount(0);
      prevUnreadRef.current = 0;
      hasLoadedOnceRef.current = false;
      if (wsRef.current) {
        wsRef.current.onclose = null;
        wsRef.current.close();
        wsRef.current = null;
      }
      if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current);
        pollIntervalRef.current = null;
      }
      return;
    }

    connect();
    pollOnce(); // immediate first read, don't wait 20s
    pollIntervalRef.current = setInterval(pollOnce, POLL_INTERVAL_MS);

    return () => {
      if (wsRef.current) {
        wsRef.current.onclose = null;
        wsRef.current.close();
        wsRef.current = null;
      }
      if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current);
        pollIntervalRef.current = null;
      }
    };
  }, [user?.id, connect, pollOnce]);

  /**
   * refreshUnread — manually ask the server for the current count.
   * Used by MessagingPage after marking messages as read.
   */
  const refreshUnread = useCallback(() => {
    pollOnce();
  }, [pollOnce]);

  // NEW — lets any component (e.g. a bell icon in the header) flip the
  // notification sound on/off. Persists across reloads/sessions.
  const toggleNotifications = useCallback(() => {
    setNotificationsEnabled((prev) => {
      const next = !prev;
      localStorage.setItem(NOTIF_PREF_KEY, String(next));
      return next;
    });
  }, []);

  return (
    <MessagingContext.Provider
      value={{ unreadCount, refreshUnread, notificationsEnabled, toggleNotifications }}
    >
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