import axios from "axios";
 
const newRequest = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "https://web-production-d2ca9.up.railway.app/api",
  withCredentials: false, // Token auth — credentials not needed
});
 
// ── Request interceptor — attach token ────────────────────────────────────────
newRequest.interceptors.request.use((config) => {
  try {
    const user = JSON.parse(localStorage.getItem("currentUser"));
    if (user?.token) {
      config.headers.Authorization = `Token ${user.token}`;
    }
  } catch {
    // localStorage parse failed — proceed without token
  }
  return config;
});
 
// ── Response interceptor — clear stale session on 401 ────────────────────────
newRequest.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error?.response?.status === 401) {
      // Token is expired or invalid — wipe local state
      localStorage.removeItem("currentUser");
      window.dispatchEvent(
        new StorageEvent("storage", { key: "currentUser", newValue: null })
      );
    }
    return Promise.reject(error);
  }
);
 
export default newRequest;