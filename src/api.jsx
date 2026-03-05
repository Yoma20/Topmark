import axios from "axios";

const api = axios.create({
  baseURL: `${import.meta.env.VITE_API_URL}/api` || "http://127.0.0.1:8000/api",
  withCredentials: true,
});

export default api;
```

The fallback was pointing to `5173` (Vite's dev port) instead of `8000` (Django). That's why it was hitting localhost.

---

### Then add to Vercel:

1. Go to **Vercel → Topmark project → Settings → Environment Variables**
2. Add:

| Key | Value |
|---|---|
| `VITE_API_URL` | `https://academic-3-2tvq.onrender.com` |

3. **Redeploy** — Vercel → Deployments → click the 3 dots on latest → Redeploy

---

### Also add to your local `.env` file (for dev):
```
VITE_API_URL=http://127.0.0.1:8000
