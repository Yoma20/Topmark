import React, { useState, useEffect, useCallback, useContext, useRef } from "react";
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { Eye, EyeOff } from "lucide-react";
import './login.scss';
import newRequest from "../../utils/newRequest";

// ─── If you have a global UserContext, import it here ─────────────────────────
// import { UserContext } from "../../context/UserContext";
// Then inside Login: const { setCurrentUser } = useContext(UserContext);
// And in saveAndRedirect, call setCurrentUser(userData) BEFORE navigate("/")

// ─── Reusable OTP screen ──────────────────────────────────────────────────────
function VerifyEmail({ userId, email, onVerified }) {
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [resent, setResent] = useState(false);

  const handleChange = (val, idx) => {
    if (!/^\d?$/.test(val)) return;
    const next = [...otp];
    next[idx] = val;
    setOtp(next);
    if (val && idx < 5) document.getElementById(`otp-${idx + 1}`)?.focus();
  };

  const handleKeyDown = (e, idx) => {
    if (e.key === "Backspace" && !otp[idx] && idx > 0)
      document.getElementById(`otp-${idx - 1}`)?.focus();
  };

  const handlePaste = (e) => {
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (pasted.length === 6) {
      setOtp(pasted.split(""));
      document.getElementById("otp-5")?.focus();
    }
  };

  const handleVerify = async () => {
    const code = otp.join("");
    if (code.length < 6) { setError("Enter all 6 digits."); return; }
    setLoading(true);
    setError("");
    try {
      const res = await newRequest.post("/api/users/verify-email/", { user_id: userId, otp: code });
      onVerified(res.data);
    } catch (err) {
      setError(err?.response?.data?.error || "Invalid or expired code.");
      setOtp(["", "", "", "", "", ""]);
      document.getElementById("otp-0")?.focus();
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setResent(false);
    try {
      await newRequest.post("/api/users/resend-otp/", { user_id: userId });
      setResent(true);
      setOtp(["", "", "", "", "", ""]);
      document.getElementById("otp-0")?.focus();
    } catch { /* silently fail */ }
  };

  return (
    <div className="auth-page">
      <div className="auth-form-side otp-only">
        <div className="auth-form-inner">
          <div className="verify-icon">📧</div>
          <h1>Verify your email</h1>
          <p className="verify-sub">
            We sent a 6-digit code to <strong>{email}</strong>
          </p>
          <div className="otp-row" onPaste={handlePaste}>
            {otp.map((digit, i) => (
              <input
                key={i}
                id={`otp-${i}`}
                className="otp-box"
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={digit}
                onChange={(e) => handleChange(e.target.value, i)}
                onKeyDown={(e) => handleKeyDown(e, i)}
                autoFocus={i === 0}
              />
            ))}
          </div>
          {error && <div className="status-message error">{error}</div>}
          {resent && <div className="status-message success">New code sent!</div>}
          <button className="btn-submit" onClick={handleVerify} disabled={loading}>
            {loading ? "Verifying…" : "Verify Email"}
          </button>
          <p className="footer">
            Didn't get it?{" "}
            <button type="button" className="link-btn" onClick={handleResend}>
              Resend code
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}

// ─── Main Login ───────────────────────────────────────────────────────────────
const Login = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [pendingUser, setPendingUser] = useState(null);
  // Cloudflare Turnstile token
  const [cfToken, setCfToken] = useState(null);
  const turnstileRef = useRef(null);

  const navigate = useNavigate();
  const location = useLocation();
  const successMessage = location.state?.message || null;

  // ── FIX: saveAndRedirect dispatches a storage event so the rest of the app
  //    (Navbar, context, etc.) picks up the new user without a page refresh ──
  const saveAndRedirect = useCallback((data) => {
    const userData = {
      id: data.user_id ?? data.id,
      username: data.username,
      email: data.email,
      token: data.token,
      isSeller: data.isSeller ?? false,
    };
    localStorage.setItem("currentUser", JSON.stringify(userData));

    // Notify every component listening to storage changes (same-tab fix)
    window.dispatchEvent(new StorageEvent("storage", {
      key: "currentUser",
      newValue: JSON.stringify(userData),
    }));

    // Small delay so state propagates before navigation
    setTimeout(() => navigate("/"), 50);
  }, [navigate]);

  // ── Cloudflare Turnstile setup ─────────────────────────────────────────────
  useEffect(() => {
    // Load Turnstile script once
    if (!document.getElementById("cf-turnstile-script")) {
      const script = document.createElement("script");
      script.id = "cf-turnstile-script";
      script.src = "https://challenges.cloudflare.com/turnstile/v0/api.js";
      script.async = true;
      script.defer = true;
      document.head.appendChild(script);
    }

    // Render widget after script loads
    const renderWidget = () => {
      if (window.turnstile && turnstileRef.current && !turnstileRef.current.dataset.rendered) {
        turnstileRef.current.dataset.rendered = "true";
        window.turnstile.render(turnstileRef.current, {
          // ⚠️  Replace with your actual Cloudflare Turnstile Site Key
          sitekey: import.meta.env.VITE_CF_TURNSTILE_SITE_KEY || "1x00000000000000000000AA",
          callback: (token) => setCfToken(token),
          "expired-callback": () => setCfToken(null),
          "error-callback": () => setCfToken(null),
          theme: "light",
          size: "normal",
        });
      }
    };

    // If script already loaded
    if (window.turnstile) {
      renderWidget();
    } else {
      const script = document.getElementById("cf-turnstile-script");
      script?.addEventListener("load", renderWidget);
      return () => script?.removeEventListener("load", renderWidget);
    }
  }, []);

  // ── Google Sign-In ─────────────────────────────────────────────────────────
  // FIX: Google One Tap requires the client ID to be initialized.
  // In your public/index.html (or index.jsx), add:
  //   <script src="https://accounts.google.com/gsi/client" async defer></script>
  // Then initialize in your root component or here:
  useEffect(() => {
    const initGoogle = () => {
      if (!window.google?.accounts?.id) return;
      window.google.accounts.id.initialize({
        // ⚠️  Replace with your Google OAuth Client ID
        client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID || "YOUR_GOOGLE_CLIENT_ID.apps.googleusercontent.com",
        callback: (response) => {
          window.dispatchEvent(new CustomEvent("google-signin", { detail: response }));
        },
      });
    };

    if (window.google?.accounts?.id) {
      initGoogle();
    } else {
      // Script loads asynchronously — wait for it
      const interval = setInterval(() => {
        if (window.google?.accounts?.id) {
          initGoogle();
          clearInterval(interval);
        }
      }, 200);
      return () => clearInterval(interval);
    }
  }, []);

  const handleGoogleSignIn = useCallback(async (response) => {
    setError(null);
    setLoading(true);
    try {
      const res = await newRequest.post("/api/users/google-auth/", {
        credential: response.credential,
      });
      saveAndRedirect(res.data);
    } catch (err) {
      setError(err?.response?.data?.error || "Google sign-in failed. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [saveAndRedirect]);

  useEffect(() => {
    const handler = (e) => handleGoogleSignIn(e.detail);
    window.addEventListener("google-signin", handler);
    return () => window.removeEventListener("google-signin", handler);
  }, [handleGoogleSignIn]);

  // ── Password login ─────────────────────────────────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    // Cloudflare check — skip in development if no token yet
    if (!cfToken && import.meta.env.PROD) {
      setError("Please complete the security check.");
      return;
    }

    setLoading(true);
    try {
      const res = await newRequest.post('/api/users/login/', {
        username,
        password,
        // Send Turnstile token to backend for server-side verification
        cf_token: cfToken,
      });
      saveAndRedirect(res.data);
    } catch (err) {
      const data = err?.response?.data;

      if (data?.error === 'email_not_verified') {
        setPendingUser({ userId: data.user_id, email: data.email });
        return;
      }

      const msg = data?.error
        || data?.message
        || data?.non_field_errors?.join(" ")
        || (typeof data === 'string' ? data : null)
        || "Login failed. Please try again.";
      setError(msg);

      // Reset Turnstile on error
      if (window.turnstile && turnstileRef.current) {
        window.turnstile.reset(turnstileRef.current);
        setCfToken(null);
      }
    } finally {
      setLoading(false);
    }
  };

  // ── Show OTP screen for unverified users ───────────────────────────────────
  if (pendingUser) {
    return (
      <VerifyEmail
        userId={pendingUser.userId}
        email={pendingUser.email}
        onVerified={saveAndRedirect}
      />
    );
  }

  // ── Login form (split layout) ──────────────────────────────────────────────
  return (
    <div className="auth-page">
      {/* Left panel — marketing */}
      <div className="auth-hero-side">
        <div className="auth-hero-overlay" />
        <div className="auth-hero-content">
          <div className="auth-hero-brand">TopMark</div>
          <h2>Academic help<br />you can trust</h2>
          <ul className="auth-hero-points">
            <li>Verified subject-specialist experts</li>
            <li>Secure escrow — pay only when satisfied</li>
            <li>24-hour express turnaround available</li>
          </ul>
        </div>
      </div>

      {/* Right panel — form */}
      <div className="auth-form-side">
        <div className="auth-form-inner">
          <p className="auth-top-link">
            Don't have an account? <Link to="/register">Join here</Link>
          </p>

          <h1>Sign in to your account</h1>

          {successMessage && (
            <div role="status" aria-live="polite" className="status-message success">
              {successMessage}
            </div>
          )}

          {/* Google */}
          <button
            type="button"
            className="social-btn"
            disabled={loading}
            onClick={() => window.google?.accounts.id.prompt()}
          >
            <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden="true">
              <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
              <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
              <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
              <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
            </svg>
            Continue with Google
          </button>

          <div className="divider"><span>or</span></div>

          <form onSubmit={handleSubmit} noValidate>
            <div className="field">
              <label htmlFor="username">Username</label>
              <input
                id="username"
                type="text"
                name="username"
                placeholder="johndoe"
                value={username}
                onChange={e => setUsername(e.target.value)}
                required
                autoComplete="username"
              />
            </div>

            <div className="field">
              <label htmlFor="password">Password</label>
              <div className="password-wrapper">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  className="eye-btn"
                  onClick={() => setShowPassword(v => !v)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* Cloudflare Turnstile widget */}
            <div className="turnstile-wrap">
              <div ref={turnstileRef} />
            </div>

            {error && (
              <div role="alert" className="status-message error">{error}</div>
            )}

            <button
              type="submit"
              className="btn-submit"
              disabled={loading || (import.meta.env.PROD && !cfToken)}
            >
              {loading ? "Signing in…" : "Sign in"}
            </button>
          </form>

          <p className="auth-legal">
            By signing in, you agree to TopMark's{" "}
            <Link to="/terms">Terms of Service</Link> and{" "}
            <Link to="/privacy">Privacy Policy</Link>.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;