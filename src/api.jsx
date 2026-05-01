import axios from "axios";

const newRequest = axios.create({
  baseURL: import.meta.env.VITE_API_URL
    ? `${import.meta.env.VITE_API_URL}/api`
    : "http://127.0.0.1:8000/api",
  withCredentials: true,
});

export default newRequest;