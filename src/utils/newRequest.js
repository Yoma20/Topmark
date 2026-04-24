import axios from "axios";

const newRequest = axios.create({
  baseURL: import.meta.env.VITE_API_URL
    ? `${import.meta.env.VITE_API_URL}/api`
    : "http://127.0.0.1:8000/api",
  withCredentials: false,
});

newRequest.interceptors.request.use((config) => {
  const token = localStorage.getItem("access_token");
  if (token) config.headers.Authorization = `Token ${token}`;
  return config;
});

newRequest.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem("access_token");
      localStorage.removeItem("currentUser");
      window.location.href = "/login";
    }
    return Promise.reject(err);
  }
);

export default newRequest;