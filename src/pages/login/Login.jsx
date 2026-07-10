import React, { useState, useEffect, useCallback, useContext, useRef } from "react";
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { Eye, EyeOff } from "lucide-react";
import './login.scss';
import newRequest from "../../utils/newRequest";
import AuthContext from "../../AuthContext";


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
      const res = await newRequest.post("/users/verify-email/", { user_id: userId, otp: code });
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
      await newRequest.post("/users/resend-otp/", { user_id: userId });
      setResent(true);
      setOtp(["", "", "", "", "", ""]);
      document.getElementById("otp-0")?.focus();
    } catch { /* silently fail */ }
  };

  return (
    // A11Y: <main> landmark so screen readers can jump straight to content
    <main className="auth-page">
      <div className="auth-form-side otp-only">
        <div className="auth-form-inner">
        <div className="verify-icon">
          <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <rect x="2" y="4" width="20" height="16" rx="2" />
            <path d="M2 7l10 7 10-7" />
          </svg>
        </div>
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
    </main>
  );
}

// ─── Lazy-load the Google GSI script ─────────────────────────────────────────
// Called once, on first user interaction with the Google button area.
// Saves ~95-100 KiB of JS parse/execute on every page load.
function loadGsiScript(onLoad) {
  if (document.getElementById("gsi-script")) {
    // Already injected (e.g. navigated back) — fire callback immediately if
    // the API is already available, otherwise wait for the existing script.
    if (window.google?.accounts?.id) { onLoad(); return; }
    document.getElementById("gsi-script").addEventListener("load", onLoad, { once: true });
    return;
  }
  const s = document.createElement("script");
  s.id = "gsi-script";
  s.src = "https://accounts.google.com/gsi/client";
  s.async = true;
  s.defer = true;
  s.addEventListener("load", onLoad, { once: true });
  document.head.appendChild(s);
}

// ─── Main Login ───────────────────────────────────────────────────────────────
const Login = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [pendingUser, setPendingUser] = useState(null);
  const [cfToken, setCfToken] = useState(null);
  const turnstileRef = useRef(null);
  const googleBtnRef = useRef(null);
  // Tracks whether the GSI script has been loaded + button rendered
  const gsiLoadedRef = useRef(false);

  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useContext(AuthContext);
  const successMessage = location.state?.message || null;

  const saveAndRedirect = useCallback((data, method) => {
    // NEW — tags a successful login. `method` distinguishes password vs
    // Google so you can see which path people are actually using and
    // whether one fails more than the other.
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push({
      event: "login",
      success: true,
      method,
    });
    login(data);
    const params = new URLSearchParams(location.search);
    const next = params.get('next') || (data.user_type === 'expert' ? '/mygigs' : '/');
    navigate(next);
  }, [login, navigate, location.search]);

  // ── Cloudflare Turnstile ───────────────────────────────────────────────────
  useEffect(() => {
    if (!document.getElementById("cf-turnstile-script")) {
      const script = document.createElement("script");
      script.id = "cf-turnstile-script";
      script.src = "https://challenges.cloudflare.com/turnstile/v0/api.js";
      script.async = true;
      script.defer = true;
      document.head.appendChild(script);
    }

    const renderWidget = () => {
      if (window.turnstile && turnstileRef.current && !turnstileRef.current.dataset.rendered) {
        turnstileRef.current.dataset.rendered = "true";
        window.turnstile.render(turnstileRef.current, {
          sitekey: import.meta.env.VITE_CF_TURNSTILE_SITE_KEY || "1x00000000000000000000AA",
          callback: (token) => setCfToken(token),
          "expired-callback": () => setCfToken(null),
          "error-callback": () => setCfToken(null),
          theme: "light",
          size: "normal",
        });
      }
    };

    if (window.turnstile) {
      renderWidget();
    } else {
      const script = document.getElementById("cf-turnstile-script");
      script?.addEventListener("load", renderWidget);
      return () => script?.removeEventListener("load", renderWidget);
    }
  }, []);

  // ── Google Sign-In — lazy init ─────────────────────────────────────────────
  // Renders the Google button once the GSI script is available.
  const initGoogle = useCallback(() => {
    if (gsiLoadedRef.current) return;
    if (!window.google?.accounts?.id) return;
    gsiLoadedRef.current = true;

    window.google.accounts.id.initialize({
      client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID || "653861972364-8tnvpshf36t66p0jmvbcpsg0lg5plhb3.apps.googleusercontent.com",
      callback: (response) => {
        window.dispatchEvent(new CustomEvent("google-signin", { detail: response }));
      },
    });

    if (googleBtnRef.current) {
      window.google.accounts.id.renderButton(googleBtnRef.current, {
        theme: "outline",
        size: "large",
        width: googleBtnRef.current.offsetWidth || 400,
        text: "signin_with",
      });
    }
  }, []);

  // PERF: Load the GSI script only when the user moves toward the Google button.
  // We listen for pointer/focus events on the button container so the script
  // is in-flight before the click, keeping UX instant while saving the eager load.
  useEffect(() => {
    const el = googleBtnRef.current;
    if (!el) return;

    const handleInteraction = () => loadGsiScript(initGoogle);

    el.addEventListener("pointerenter", handleInteraction, { once: true });
    el.addEventListener("focusin",      handleInteraction, { once: true });

    return () => {
      el.removeEventListener("pointerenter", handleInteraction);
      el.removeEventListener("focusin",      handleInteraction);
    };
  }, [initGoogle]);

  const handleGoogleSignIn = useCallback(async (response) => {
    setError(null);
    setLoading(true);
    try {
      const res = await newRequest.post("/users/google-auth/", { credential: response.credential });
      saveAndRedirect(res.data, "google");
    } catch (err) {
      // NEW — failed Google sign-in attempt
      window.dataLayer = window.dataLayer || [];
      window.dataLayer.push({ event: "login", success: false, method: "google" });
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

    if (!cfToken && import.meta.env.PROD) {
      setError("Please complete the security check.");
      return;
    }

    setLoading(true);
    try {
      const res = await newRequest.post('/users/login/', { username, password, cf_token: cfToken });
      saveAndRedirect(res.data, "password");
    } catch (err) {
      const data = err?.response?.data;

      if (data?.error === 'email_not_verified') {
        setPendingUser({ userId: data.user_id, email: data.email });
        return;
      }

      // NEW — failed password login attempt (excludes the unverified-email
      // case above, since that's a pending state, not a true failure)
      window.dataLayer = window.dataLayer || [];
      window.dataLayer.push({ event: "login", success: false, method: "password" });

      const msg = data?.error
        || data?.message
        || data?.non_field_errors?.join(" ")
        || (typeof data === 'string' ? data : null)
        || "Login failed. Please try again.";
      setError(msg);

      if (window.turnstile && turnstileRef.current) {
        window.turnstile.reset(turnstileRef.current);
        setCfToken(null);
      }
    } finally {
      setLoading(false);
    }
  };

  if (pendingUser) {
    return (
      <VerifyEmail
        userId={pendingUser.userId}
        email={pendingUser.email}
        onVerified={saveAndRedirect}
      />
    );
  }

  return (
    // A11Y: <main> landmark wraps the page content so screen readers can
    // skip navigation and jump straight here.
    <main className="auth-page">
      {/* Left panel */}
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

      {/* Right panel */}
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

          {/*
            PERF: The Google button container is always rendered so the ref
            is available for the lazy-load interaction listeners above.
            The GSI script will inject the real button on first hover/focus.
          */}
          <div
            ref={googleBtnRef}
            style={{ width: "100%", minHeight: "44px", marginBottom: "16px" }}
            aria-label="Sign in with Google"
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              // Allow keyboard users to trigger the lazy load too
              if (e.key === "Enter" || e.key === " ") loadGsiScript(initGoogle);
            }}
          />

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
                {/*
                  A11Y + PERF: min 44×44 px tap target on the eye button.
                  Add `min-width: 44px; min-height: 44px;` to .eye-btn in
                  login.scss if not already set.
                */}
                <button
                  type="button"
                  className="eye-btn"
                  onClick={() => setShowPassword(v => !v)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  style={{ minWidth: 44, minHeight: 44 }}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <div className="turnstile-wrap">
              <div ref={turnstileRef} />
            </div>

            {error && <div role="alert" className="status-message error">{error}</div>}

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
            <Link to="/terms-of-service">Terms of Service</Link> and{" "}
            <Link to="/privacy-policy">Privacy Policy</Link>.
          </p>
        </div>
      </div>
    </main>
  );
};

export default Login;