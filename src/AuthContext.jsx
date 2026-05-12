import { createContext, useState, useCallback, useContext, useRef, useEffect } from "react";
import newRequest from "./utils/newRequest";

const AuthContext = createContext(null);

/**
 * User shape stored in state (and localStorage for page-refresh hydration):
 * {
 *   id, username, email, user_type, isSeller,
 *   profile_picture,          ← from /api/users/me/
 *   profile: { ... }          ← only for experts, from /api/expert-profiles/me/
 * }
 *
 * NOTE: No token field. Authentication is now handled entirely by the
 * HttpOnly session cookie that Django sets on login. localStorage is only
 * used so the UI can immediately show the user's name/avatar on page load
 * without waiting for a /me/ round-trip. The session cookie is the real
 * source of truth for whether the user is authenticated on the server.
 */

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      const stored = localStorage.getItem("currentUser");
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });

  // ── Persist helper ─────────────────────────────────────────────────────────
  const persist = (userData) => {
    localStorage.setItem("currentUser", JSON.stringify(userData));
    setUser(userData);
  };

  // ── Fetch expert profile and merge into user ───────────────────────────────
  const fetchAndMergeProfile = useCallback(async (baseUser) => {
    if (baseUser.user_type !== "expert") return baseUser;
    try {
      await newRequest.post("/expert-profiles/ensure/");
      const res = await newRequest.get("/expert-profiles/me/");
      return { ...baseUser, profile: res.data };
    } catch {
      return baseUser;
    }
  }, []);

  /**
   * login — called after a successful auth response from the server.
   * The server has already set the session cookie; we just store the
   * user metadata in localStorage for fast hydration on next load.
   */
  const login = useCallback(async (data) => {
    const baseUser = {
      id:              data.user_id ?? data.id,
      username:        data.username,
      email:           data.email,
      user_type:       data.user_type,
      isSeller:        data.user_type === "expert",
      profile_picture: data.profile_picture ?? null,
      profile:         data.profile ?? null,
    };

    persist(baseUser);
    const enriched = await fetchAndMergeProfile(baseUser);
    persist(enriched);
    return enriched;
  }, [fetchAndMergeProfile]);

  /**
   * logout — clears local state and tells the server to destroy the session.
   */
  const logout = useCallback(async () => {
    try {
      await newRequest.post("/users/logout/");
    } catch {
      // Ignore errors — clear local state regardless
    }
    localStorage.removeItem("currentUser");
    setUser(null);
  }, []);

  // ── userRef — always points to latest user without being a dep ─────────────
  const userRef = useRef(user);
  useEffect(() => { userRef.current = user; }, [user]);

  // ── refreshProfile — re-fetch expert profile after edits ───────────────────
  const refreshProfile = useCallback(async () => {
    if (!userRef.current) return;
    const enriched = await fetchAndMergeProfile(userRef.current);
    persist(enriched);
  }, [fetchAndMergeProfile]);

  // ── updateUser — lightweight patch for non-profile fields ─────────────────
  const updateUser = useCallback((patch) => {
    setUser(prev => {
      const next = { ...prev, ...patch };
      localStorage.setItem("currentUser", JSON.stringify(next));
      return next;
    });
  }, []);

  return (
    <AuthContext.Provider value={{ user, login, logout, refreshProfile, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
export default AuthContext;