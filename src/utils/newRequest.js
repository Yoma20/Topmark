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
  withCredentials: true,   // sends the session cookie on every request
});

/**
 * Attach the Django CSRF token to all state-mutating requests.
 * Django's CsrfViewMiddleware checks for X-CSRFToken on POST/PUT/PATCH/DELETE.
 * The csrftoken cookie is set by Django on the first GET request.
 */
newRequest.interceptors.request.use((config) => {
  const method = config.method?.toLowerCase();
  if (["post", "put", "patch", "delete"].includes(method)) {
    const csrfToken = getCookie("csrftoken");
    if (csrfToken) {
      config.headers["X-CSRFToken"] = csrfToken;
    }
  }
  return config;
});

export default newRequest;