import { useState, useEffect, useCallback } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";
import newRequest from "../../utils/newRequest";
import "./register.scss";

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
    if (val && idx < 5) {
      document.getElementById(`otp-${idx + 1}`)?.focus();
    }
  };

  const handleKeyDown = (e, idx) => {
    if (e.key === "Backspace" && !otp[idx] && idx > 0) {
      document.getElementById(`otp-${idx - 1}`)?.focus();
    }
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
      const res = await newRequest.post("/users/verify-email/", {
        user_id: userId,
        otp: code,
      });
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
    } catch {
      // silently fail — user can try again
    }
  };

  return (
    <div className="register-container">
      <div className="register-card">
        <div className="verify-icon">📧</div>
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
          <button className="link-btn" onClick={handleResend}>
            Resend code
          </button>
        </p>
      </div>
    </div>
  );
}

// ─── Main Register Form ───────────────────────────────────────────────────────
export default function Register() {
  const navigate = useNavigate();

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
  const [success, setSuccess] = useState(null);
  const [pendingUser, setPendingUser] = useState(null); // { userId, email }

  // ── Google Sign-In handler (called via window event) ──────────────────────
  const handleGoogleSignIn = useCallback(async (response) => {
    setError(null);
    setLoading(true);
    try {
      const res = await newRequest.post("/users/google-auth/", {
        credential: response.credential,
      });
      handleVerified(res.data);
    } catch (err) {
      setError(err?.response?.data?.error || "Google sign-in failed. Please try again.");
    } finally {
      setLoading(false);
    }
  }, []); // eslint-disable-line

  // Listen for Google callback dispatched from window.handleGoogleSignIn (set in index.jsx)
  useEffect(() => {
    const handler = (e) => handleGoogleSignIn(e.detail);
    window.addEventListener("google-signin", handler);
    return () => window.removeEventListener("google-signin", handler);
  }, [handleGoogleSignIn]);

  // ── Form helpers ──────────────────────────────────────────────────────────
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setError(null);
    setSuccess(null);
  };

  const validate = () => {
    if (!form.username || !form.email || !form.password || !form.confirmPassword) {
      setError("All fields are required.");
      return false;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(form.email)) {
      setError("Please enter a valid email address.");
      return false;
    }
    if (form.password.length < 8) {
      setError("Password must be at least 8 characters.");
      return false;
    }
    if (form.password !== form.confirmPassword) {
      setError("Passwords do not match.");
      return false;
    }
    if (!termsAccepted) {
      setError("You must accept the Terms and Service.");
      return false;
    }
    return true;
  };

  // ── Submit registration ───────────────────────────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    if (!validate()) return;

    setLoading(true);
    try {
      const res = await newRequest.post("/users/register/", {
        username: form.username,
        email: form.email,
        password: form.password,
      });
      // Backend returns { user_id, email } — show OTP screen
      setPendingUser({ userId: res.data.user_id, email: res.data.email });
    } catch (err) {
      const data = err?.response?.data;
      const msg = data
        ? Object.values(data).flat().join(" ")
        : err.message || "An unexpected error occurred.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  // ── After OTP verified — store token and redirect ─────────────────────────
  const handleVerified = (data) => {
    localStorage.setItem("currentUser", JSON.stringify({
      id: data.user_id,
      username: data.username,
      email: data.email,
      token: data.token,
    }));
    navigate("/");
  };

  // ── Show OTP screen after successful registration ─────────────────────────
  if (pendingUser) {
    return (
      <VerifyEmail
        userId={pendingUser.userId}
        email={pendingUser.email}
        onVerified={handleVerified}
      />
    );
  }

  // ── Register form ─────────────────────────────────────────────────────────
  return (
    <div className="register-container">
      <div className="register-card">
        <h1>Create an Account</h1>

        {/* ── Google Sign-In ── */}
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

        {/* ── Form ── */}
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
              aria-required="true"
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
              aria-required="true"
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
                aria-required="true"
              />
              <button
                type="button"
                className="eye-btn"
                onClick={() => setShowPassword((v) => !v)}
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
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
                aria-required="true"
              />
              <button
                type="button"
                className="eye-btn"
                onClick={() => setShowConfirm((v) => !v)}
                aria-label={showConfirm ? "Hide password" : "Show password"}
              >
                {showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <div className="checkbox-group">
            <input
              id="terms"
              type="checkbox"
              checked={termsAccepted}
              onChange={(e) => setTermsAccepted(e.target.checked)}
              aria-checked={termsAccepted}
            />
            <label htmlFor="terms">
              I accept the <Link to="/terms">Terms and Service</Link>
            </label>
          </div>

          {(error || success) && (
            <div
              role="status"
              aria-live="polite"
              className={`status-message ${error ? "error" : "success"}`}
            >
              {error || success}
            </div>
          )}

          <button type="submit" className="btn-submit" disabled={loading || !termsAccepted}>
            {loading ? "Registering..." : "Register"}
          </button>
        </form>

        <p className="footer">
          Already have an account? <Link to="/login">Log in</Link>
        </p>
      </div>
    </div>
  );
}