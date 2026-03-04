import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://127.0.0.1:5173/api",
  withCredentials: true, // only if your backend uses cookies/sessions
});

export default api;
