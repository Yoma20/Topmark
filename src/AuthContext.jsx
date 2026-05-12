import { createContext, useState, useCallback, useContext, useRef, useEffect } from "react";
import newRequest from "./utils/newRequest";

const AuthContext = createContext(null);

// ─── Shape reference ───────────────────────────────────────────────────────────
// user: {
//   id, username, email, token, user_type, isSeller,
//   profile_picture,          ← from /api/users/me/
//   profile: {                ← only for experts, from /api/expert-profiles/me/
//     id, title, bio, avatar_url, country, languages, skills,
//     rating, total_reviews, recommendation_rate,
//     avg_rubric_adherence, avg_timeliness, avg_communication,
//     stripe_account_verified, available,
//     work_experience, education, certifications,
//   }
// }

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
      // Ensure profile row exists (idempotent)
      await newRequest.post("/expert-profiles/ensure/");
      const res = await newRequest.get("/expert-profiles/me/");
      return { ...baseUser, profile: res.data };
    } catch {
      return baseUser;
    }
  }, []);

  // ── login — called after successful auth (login / OTP verify / Google) ─────
  const login = useCallback(async (data) => {
    const baseUser = {
      id:              data.user_id ?? data.id,
      username:        data.username,
      email:           data.email,
      token:           data.token,
      user_type:       data.user_type,
      isSeller:        data.user_type === "expert",
      profile_picture: data.profile_picture ?? null,
      profile:         data.profile ?? null,   // carry over if already merged
    };

    // Immediately set base user so the app can render
    persist(baseUser);

    // Then fetch extra profile data in the background
    const enriched = await fetchAndMergeProfile(baseUser);
    persist(enriched);

    return enriched;
  }, [fetchAndMergeProfile]);

  // ── logout ─────────────────────────────────────────────────────────────────
  const logout = useCallback(() => {
    localStorage.removeItem("currentUser");
    setUser(null);
  }, []);

  // ── userRef — always points to latest user without being a dep ───────────
  const userRef = useRef(user);
  useEffect(() => { userRef.current = user; }, [user]);

  // ── refreshProfile — call this after saving profile edits ─────────────────
  // e.g. after PATCH /expert-profiles/me/ or POST /expert-profiles/me/avatar/
  // Uses userRef so this callback is never recreated after login, preventing
  // consumers from re-rendering just because user state updated.
  const refreshProfile = useCallback(async () => {
    if (!userRef.current) return;
    const enriched = await fetchAndMergeProfile(userRef.current);
    persist(enriched);
  }, [fetchAndMergeProfile]); // ← no longer depends on `user`

  // ── updateUser — lightweight patch for non-profile fields ─────────────────
  // e.g. after PATCH /users/me/ to change username
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