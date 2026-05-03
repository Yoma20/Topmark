import axios from "axios";

const newRequest = axios.create({
  baseURL: import.meta.env.VITE_API_URL
    ? `${import.meta.env.VITE_API_URL}/api`
    : "http://127.0.0.1:8000/api",
  withCredentials: false,
});

newRequest.interceptors.request.use((config) => {
  const user = localStorage.getItem("currentUser");
  if (user) {
    const parsed = JSON.parse(user);
    if (parsed?.token) {
      config.headers.Authorization = `Token ${parsed.token}`;
    }
  }
  return config;
});

newRequest.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem("currentUser");
      window.location.href = "/login";
    }
    return Promise.reject(err);
  }
);

export default newRequest;