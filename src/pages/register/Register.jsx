import { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";
import newRequest from "../../utils/newRequest";
import "./register.scss";
import { useAuth } from "../../AuthContext";

// ─── Lazy-load the Google GSI script ─────────────────────────────────────────
// Identical helper to Login.jsx — loads GSI only on first interaction with the
// Google button, saving ~95-100 KiB of JS parse/execute on page load.
function loadGsiScript(onLoad) {
  if (document.getElementById("gsi-script")) {
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

// ─── OTP Verification Screen ─────────────────────────────────────────────────
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

  // A11Y: <main> landmark on OTP screen too
  return (
    <main className="auth-page">
      <div className="auth-form-side otp-only">
        <div className="auth-form-inner">
        <div className="verify-icon">
          <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <rect x="2" y="4" width="20" height="16" rx="2" />
            <path d="M2 7l10 7 10-7" />
          </svg>
        </div>
          <h1>Check your email</h1>
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
            <button className="link-btn" onClick={handleResend}>Resend code</button>
          </p>
        </div>
      </div>
    </main>
  );
}

// ─── Main Register Form ───────────────────────────────────────────────────────
export default function Register() {
  const navigate = useNavigate();
  const turnstileRef = useRef(null);
  const googleBtnRef = useRef(null);
  const gsiLoadedRef = useRef(false);

  const { login } = useAuth();

  const [form, setForm] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [pendingUser, setPendingUser] = useState(null);
  const [cfToken, setCfToken] = useState(null);

  const handleVerified = useCallback(async (data, method = "email") => {
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push({
      event: "sign_up",
      method,
    });
    await login(data);
    navigate("/");
  }, [login, navigate]);

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
        text: "continue_with",
      });
    }
  }, []);

  // Load GSI immediately on mount so the button is always visible
  useEffect(() => {
    loadGsiScript(initGoogle);
  }, [initGoogle]);

  const handleGoogleSignIn = useCallback(async (response) => {
    setError(null);
    setLoading(true);
    try {
      const res = await newRequest.post("/users/google-auth/", {
        credential: response.credential,
      });
      if (res.data.created) {
        handleVerified(res.data, "google"); // new account → track sign_up
      } else {
        await login(res.data);              // returning user → just log in
        navigate("/");
      }
    } catch (err) {
      setError(err?.response?.data?.error || "Google sign-in failed. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [handleVerified, login, navigate]);

  useEffect(() => {
    const handler = (e) => handleGoogleSignIn(e.detail);
    window.addEventListener("google-signin", handler);
    return () => window.removeEventListener("google-signin", handler);
  }, [handleGoogleSignIn]);

  // ── Form helpers ───────────────────────────────────────────────────────────
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setError(null);
  };

  const validate = () => {
    if (!form.username || !form.email || !form.password || !form.confirmPassword) {
      setError("All fields are required."); return false;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      setError("Please enter a valid email address."); return false;
    }
    if (form.password.length < 8) {
      setError("Password must be at least 8 characters."); return false;
    }
    if (form.password !== form.confirmPassword) {
      setError("Passwords do not match."); return false;
    }
    if (!termsAccepted) {
      setError("You must accept the Terms of Service."); return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    if (!validate()) return;

    if (!cfToken && import.meta.env.PROD) {
      setError("Please complete the security check.");
      return;
    }

    setLoading(true);
    try {
      const res = await newRequest.post("/users/register/", {
        username: form.username,
        email: form.email,
        password: form.password,
        cf_token: cfToken,
      });
      setPendingUser({ userId: res.data.user_id, email: res.data.email });
    } catch (err) {
      const data = err?.response?.data;
      const msg = data
        ? Object.values(data).flat().join(" ")
        : err.message || "An unexpected error occurred.";
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
        onVerified={handleVerified}
      />
    );
  }

  return (
    // A11Y: <main> landmark so screen readers can skip straight to content
    <main className="auth-page">
      <div className="auth-hero-side">
        <div className="auth-hero-overlay" />
        <div className="auth-hero-content">
          <div className="auth-hero-brand">TopMark</div>
          <h2>Join thousands of<br />students getting better grades</h2>
          <ul className="auth-hero-points">
            <li>Expert help across 50+ academic subjects</li>
            <li>Rubric-adherence scored on every order</li>
            <li>Start for free — no subscription</li>
          </ul>
        </div>
      </div>

      <div className="auth-form-side">
        <div className="auth-form-inner">
          <p className="auth-top-link">
            Already have an account? <Link to="/login">Log in</Link>
          </p>

          <h1>Create an account</h1>

          {/*
            PERF: Google button container — GSI loads lazily on first
            hover/focus, same pattern as Login.jsx.
          */}
          <div
            ref={googleBtnRef}
            style={{ width: "100%", minHeight: "44px", marginBottom: "16px" }}
            aria-label="Continue with Google"
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") loadGsiScript(initGoogle);
            }}
          />

          <div className="divider"><span>or</span></div>

          <form onSubmit={handleSubmit} noValidate>
            <div className="field">
              <label htmlFor="username">Username</label>
              <input
                id="username"
                name="username"
                type="text"
                value={form.username}
                onChange={handleChange}
                required
                autoComplete="username"
              />
            </div>

            <div className="field">
              <label htmlFor="email">Email</label>
              <input
                id="email"
                name="email"
                type="email"
                value={form.email}
                onChange={handleChange}
                required
                autoComplete="email"
              />
            </div>

            <div className="field">
              <label htmlFor="password">Password</label>
              <div className="password-wrapper">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  value={form.password}
                  onChange={handleChange}
                  required
                  autoComplete="new-password"
                />
                {/* A11Y: min 44×44 px touch target */}
                <button
                  type="button"
                  className="eye-btn"
                  onClick={() => setShowPassword((v) => !v)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  style={{ minWidth: 44, minHeight: 44 }}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <div className="field">
              <label htmlFor="confirmPassword">Confirm Password</label>
              <div className="password-wrapper">
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showConfirm ? "text" : "password"}
                  value={form.confirmPassword}
                  onChange={handleChange}
                  required
                  autoComplete="new-password"
                />
                {/* A11Y: min 44×44 px touch target */}
                <button
                  type="button"
                  className="eye-btn"
                  onClick={() => setShowConfirm((v) => !v)}
                  aria-label={showConfirm ? "Hide password" : "Show password"}
                  style={{ minWidth: 44, minHeight: 44 }}
                >
                  {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <div className="checkbox-group">
              <input
                id="terms"
                type="checkbox"
                checked={termsAccepted}
                onChange={(e) => setTermsAccepted(e.target.checked)}
              />
              <label htmlFor="terms">
                I accept the <Link to="/terms-of-service">Terms of Service</Link>
              </label>
            </div>

            <div className="turnstile-wrap">
              <div ref={turnstileRef} />
            </div>

            {error && (
              <div role="alert" className="status-message error">{error}</div>
            )}

            <button
              type="submit"
              className="btn-submit"
              disabled={loading || !termsAccepted || (import.meta.env.PROD && !cfToken)}
            >
              {loading ? "Creating account…" : "Create account"}
            </button>
          </form>

          <p className="auth-legal">
            By registering, you agree to TopMark's{" "}
            <Link to="/terms-of-service">Terms of Service</Link> and{" "}
            <Link to="/privacy-policy">Privacy Policy</Link>.
          </p>
        </div>
      </div>
    </main>
  );
}