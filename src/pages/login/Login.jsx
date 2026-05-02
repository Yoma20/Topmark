import React, { useState, useEffect, useCallback } from "react";
import { useNavigate, useLocation } from 'react-router-dom';
import { Eye, EyeOff } from "lucide-react";
import './login.scss';
import newRequest from "../../utils/newRequest";

// ─── Reusable OTP screen (same as in Register.jsx) ───────────────────────────
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
    <div className="login">
      <form onSubmit={(e) => { e.preventDefault(); handleVerify(); }}>
        <div className="verify-icon">📧</div>
        <h1>Verify your email</h1>
        <p className="verify-sub">
          We sent a new 6-digit code to <strong>{email}</strong>
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

        <button type="submit" className="btn-submit" disabled={loading}>
          {loading ? "Verifying…" : "Verify Email"}
        </button>

        <p className="footer">
          Didn't get it?{" "}
          <button type="button" className="link-btn" onClick={handleResend}>
            Resend code
          </button>
        </p>
      </form>
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

  // FIX 2: state for unverified users who need OTP
  const [pendingUser, setPendingUser] = useState(null);

  const navigate = useNavigate();
  const location = useLocation();
  const successMessage = location.state?.message || null;

  // ── FIX 1: normalise the saved user object so .id is always present ────────
  const saveAndRedirect = (data) => {
    localStorage.setItem("currentUser", JSON.stringify({
      id: data.user_id,       // normalise user_id → id
      username: data.username,
      email: data.email,
      token: data.token,
    }));
    navigate("/");
  };

  // ── Google sign-in (FIX 3: added to Login page too) ───────────────────────
  const handleGoogleSignIn = useCallback(async (response) => {
    setError(null);
    setLoading(true);
    try {
      const res = await newRequest.post("/users/google-auth/", {
        credential: response.credential,
      });
      saveAndRedirect(res.data);
    } catch (err) {
      setError(err?.response?.data?.error || "Google sign-in failed. Please try again.");
    } finally {
      setLoading(false);
    }
  }, []); // eslint-disable-line

  useEffect(() => {
    const handler = (e) => handleGoogleSignIn(e.detail);
    window.addEventListener("google-signin", handler);
    return () => window.removeEventListener("google-signin", handler);
  }, [handleGoogleSignIn]);

  // ── Password login ─────────────────────────────────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await newRequest.post('/users/login/', { username, password });
      saveAndRedirect(res.data);
    } catch (err) {
      const data = err?.response?.data;

      // FIX 2: backend returns 403 { error:'email_not_verified', user_id, email }
      // instead of showing a confusing error, redirect to OTP screen
      if (data?.error === 'email_not_verified') {
        setPendingUser({ userId: data.user_id, email: data.email });
        return;
      }

      // FIX 2: backend uses 'error' field, not 'message'
      const msg = data?.error
        || data?.message
        || data?.non_field_errors?.join(" ")
        || (typeof data === 'string' ? data : null)
        || "Login failed. Please try again.";
      setError(msg);
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

  // ── Login form ─────────────────────────────────────────────────────────────
  return (
    <div className="login">
      <form onSubmit={handleSubmit}>
        <h1>Sign in</h1>

        {successMessage && (
          <div role="status" aria-live="polite" className="status-message success">
            {successMessage}
          </div>
        )}

        {/* FIX 3: Google sign-in button */}
        <button
          type="button"
          className="google-btn"
          disabled={loading}
          onClick={() => window.google?.accounts.id.prompt()}
        >
          <svg width="20" height="20" viewBox="0 0 48 48" aria-hidden="true">
            <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
            <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
            <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
            <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
          </svg>
          Continue with Google
        </button>

        <div className="divider"><span>or</span></div>

        <label htmlFor="username">Username</label>
        <input
          id="username"
          type="text"
          name="username"
          placeholder="johndoe"
          value={username}
          onChange={e => setUsername(e.target.value)}
          required
        />

        <label htmlFor="password">Password</label>
        <div className="password-wrapper">
          <input
            id="password"
            type={showPassword ? "text" : "password"}
            name="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
          />
          <button
            type="button"
            className="eye-btn"
            onClick={() => setShowPassword(v => !v)}
            aria-label={showPassword ? "Hide password" : "Show password"}
          >
            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>

        {error && (
          <div role="alert" className="status-message error">{error}</div>
        )}

        <button type="submit" className="btn-submit" disabled={loading}>
          {loading ? "Signing in…" : "Sign in"}
        </button>
      </form>
    </div>
  );
};

export default Login;