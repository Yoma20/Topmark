import axios from "axios";

/**
 * Reads the value of a cookie by name.
 * Used to pluck the CSRF token Django sets as `csrftoken`.
 */
function getCookie(name) {
  const match = document.cookie.match(new RegExp("(?:^|; )" + name + "=([^;]*)"));
  return match ? decodeURIComponent(match[1]) : null;
}

const newRequest = axios.create({
  baseURL: import.meta.env.VITE_API_URL + "/api",
  withCredentials: true, // sends the session cookie on every request
});


const csrfReady = getCookie("csrftoken")
  ? Promise.resolve()
  : newRequest
      .get("/users/csrf/")
      .catch(() => console.warn("CSRF prefetch failed — login may not work."));


newRequest.interceptors.request.use(async (config) => {
  const method = config.method?.toLowerCase();
  if (["post", "put", "patch", "delete"].includes(method)) {
    await csrfReady;
    const csrfToken = getCookie("csrftoken");
    if (csrfToken) {
      config.headers["X-CSRFToken"] = csrfToken;
    }
  }
  return config;
});

export default newRequest;