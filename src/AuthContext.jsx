import { createContext, useState, useCallback, useContext, useRef, useEffect } from "react";
import newRequest from "./utils/newRequest";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      const stored = localStorage.getItem("currentUser");
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });

  const persist = (userData) => {
    localStorage.setItem("currentUser", JSON.stringify(userData));
    setUser(userData);
  };

  const fetchAndMergeProfile = useCallback(async (baseUser) => {
    if (baseUser.user_type !== "expert") return baseUser;
    try {
      await newRequest.post("/expert-profiles/ensure/");
      const res = await newRequest.get("/expert-profiles/me/");
      return {
        ...baseUser,
        profile: res.data,
        profile_picture: res.data.avatar_url || baseUser.profile_picture,
      };
    } catch {
      return baseUser;
    }
  }, []);

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

  const logout = useCallback(async () => {
    try {
      await newRequest.post("/users/logout/");
    } catch {
      // Ignore errors — clear local state regardless
    }
    localStorage.removeItem("currentUser");
    setUser(null);
  }, []);

  const userRef = useRef(user);
  useEffect(() => { userRef.current = user; }, [user]);

  const refreshProfile = useCallback(async () => {
    if (!userRef.current) return;
    const enriched = await fetchAndMergeProfile(userRef.current);
    persist(enriched);
  }, [fetchAndMergeProfile]);

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