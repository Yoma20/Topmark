import { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff } from 'lucide-react';
import newRequest from '../../utils/newRequest';
import './becomeseller.scss';

// ─── Subjects available ────────────────────────────────────────────────────────
const SUBJECTS = [
  'Law & Legal', 'Nursing', 'Cybersecurity', 'Biology', 'History',
  'Data Science', 'Computer Science', 'Business', 'Essay Writing',
  'Mathematics', 'Psychology', 'Chemistry', 'Physics', 'Engineering',
  'Economics', 'Sociology', 'Philosophy', 'Literature', 'Other',
];

// ─── OTP Verification ─────────────────────────────────────────────────────────
function VerifyEmail({ userId, email, onVerified }) {
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [error, setError] = useState('');
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
    if (e.key === 'Backspace' && !otp[idx] && idx > 0) {
      document.getElementById(`otp-${idx - 1}`)?.focus();
    }
  };

  const handlePaste = (e) => {
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (pasted.length === 6) {
      setOtp(pasted.split(''));
      document.getElementById('otp-5')?.focus();
    }
  };

  const handleVerify = async () => {
    const code = otp.join('');
    if (code.length < 6) { setError('Enter all 6 digits.'); return; }
    setLoading(true);
    setError('');
    try {
      const res = await newRequest.post('/users/verify-email/', {
        user_id: userId,
        otp: code,
      });
      onVerified(res.data);
    } catch (err) {
      setError(err?.response?.data?.error || 'Invalid or expired code.');
      setOtp(['', '', '', '', '', '']);
      document.getElementById('otp-0')?.focus();
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setResent(false);
    try {
      await newRequest.post('/users/resend-otp/', { user_id: userId });
      setResent(true);
      setOtp(['', '', '', '', '', '']);
      document.getElementById('otp-0')?.focus();
    } catch {
      // silently fail
    }
  };

  return (
    <div className="bs2-page">
      <div className="bs2-otp-card">
        <div className="bs2-otp-icon">📧</div>
        <h1>Verify your email</h1>
        <p className="bs2-otp-sub">
          We sent a 6-digit code to <strong>{email}</strong>
        </p>

        <div className="bs2-otp-row" onPaste={handlePaste}>
          {otp.map((digit, i) => (
            <input
              key={i}
              id={`otp-${i}`}
              className="bs2-otp-box"
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

        {error && <div className="bs2-status bs2-status--error">{error}</div>}
        {resent && <div className="bs2-status bs2-status--success">New code sent!</div>}

        <button className="bs2-btn bs2-btn--primary" onClick={handleVerify} disabled={loading}>
          {loading ? 'Verifying…' : 'Verify & Activate Account'}
        </button>

        <p className="bs2-footer">
          Didn't receive it?{' '}
          <button className="bs2-link-btn" onClick={handleResend}>Resend code</button>
        </p>
      </div>
    </div>
  );
}

// ─── Main Expert Registration ─────────────────────────────────────────────────
export default function BecomeSeller2() {
  const navigate = useNavigate();

  const [step, setStep] = useState(1);
  const [form, setForm] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    field_of_study: '',
    bio: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [pendingUser, setPendingUser] = useState(null);

  // ── Google Sign-In ──────────────────────────────────────────────────────────
  const handleGoogleSignIn = useCallback(async (response) => {
    setError(null);
    setLoading(true);
    try {
      const res = await newRequest.post('/users/google-auth/', {
        credential: response.credential,
        user_type: 'expert',
      });
      handleVerified(res.data);
    } catch (err) {
      setError(err?.response?.data?.error || 'Google sign-in failed. Please try again.');
    } finally {
      setLoading(false);
    }
  }, []); // eslint-disable-line

  useEffect(() => {
    const handler = (e) => handleGoogleSignIn(e.detail);
    window.addEventListener('google-signin', handler);
    return () => window.removeEventListener('google-signin', handler);
  }, [handleGoogleSignIn]);

  // ── Form helpers ────────────────────────────────────────────────────────────
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setError(null);
  };

  const validateStep1 = () => {
    if (!form.username || !form.email || !form.password || !form.confirmPassword) {
      setError('All fields are required.'); return false;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      setError('Please enter a valid email address.'); return false;
    }
    if (form.password.length < 8) {
      setError('Password must be at least 8 characters.'); return false;
    }
    if (form.password !== form.confirmPassword) {
      setError('Passwords do not match.'); return false;
    }
    if (!termsAccepted) {
      setError('You must accept the Terms of Service.'); return false;
    }
    return true;
  };

  const validateStep2 = () => {
    if (!form.field_of_study) {
      setError('Please select your primary subject area.'); return false;
    }
    if (form.bio.length < 30) {
      setError('Please write a bio of at least 30 characters.'); return false;
    }
    return true;
  };

  const handleNextStep = () => {
    setError(null);
    if (validateStep1()) setStep(2);
  };

  // ── Submit ──────────────────────────────────────────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    if (!validateStep2()) return;

    setLoading(true);
    try {
      const res = await newRequest.post('/users/register/', {
        username: form.username,
        email: form.email,
        password: form.password,
        user_type: 'expert',
      });

      sessionStorage.setItem('expert_profile_pending', JSON.stringify({
        field_of_study: form.field_of_study,
        bio: form.bio,
      }));

      setPendingUser({ userId: res.data.user_id, email: res.data.email });
    } catch (err) {
      const data = err?.response?.data;
      const msg = data
        ? Object.values(data).flat().join(' ')
        : err.message || 'An unexpected error occurred.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  // ── After OTP verified ──────────────────────────────────────────────────────
  const handleVerified = async (data) => {
    const userData = {
      id: data.user_id,
      username: data.username,
      email: data.email,
      token: data.token,
      user_type: 'expert',
    };
    localStorage.setItem('currentUser', JSON.stringify(userData));

    const pending = sessionStorage.getItem('expert_profile_pending');
    if (pending && data.token) {
      try {
        const profileData = JSON.parse(pending);
        await newRequest.patch('/expert-profiles/me/', profileData, {
          headers: { Authorization: `Token ${data.token}` },
        });
      } catch {
        // Non-critical
      } finally {
        sessionStorage.removeItem('expert_profile_pending');
      }
    }

    navigate('/profile');
  };

  // ── OTP Screen ─────────────────────────────────────────────────────────────
  if (pendingUser) {
    return (
      <VerifyEmail
        userId={pendingUser.userId}
        email={pendingUser.email}
        onVerified={handleVerified}
      />
    );
  }

  // ── Registration UI ─────────────────────────────────────────────────────────
  return (
    <div className="bs2-page">
      <div className="bs2-card">
        <div className="bs2-form-panel">

          {/* Progress stepper */}
          <div className="bs2-progress">
            <div className={`bs2-progress__step ${step >= 1 ? 'active' : ''} ${step > 1 ? 'done' : ''}`}>
              <div className="bs2-progress__dot">
                {step > 1 ? (
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12"/>
                  </svg>
                ) : '1'}
              </div>
              <span>Account</span>
            </div>
            <div className="bs2-progress__line" />
            <div className={`bs2-progress__step ${step >= 2 ? 'active' : ''}`}>
              <div className="bs2-progress__dot">2</div>
              <span>Expertise</span>
            </div>
          </div>

          {step === 1 ? (
            <>
              <h1>Create Your Account</h1>

              {/* Google */}
              <button
                type="button"
                className="bs2-google-btn"
                disabled={loading}
                onClick={() => window.google?.accounts.id.prompt()}
              >
                <svg width="20" height="20" viewBox="0 0 48 48" aria-hidden="true">
                  <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
                  <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
                  <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
                  <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
                </svg>
                Continue with Google as Expert
              </button>

              <div className="bs2-divider"><span>or fill in your details</span></div>

              <div className="bs2-field">
                <label htmlFor="username">Username</label>
                <input
                  id="username"
                  name="username"
                  type="text"
                  value={form.username}
                  onChange={handleChange}
                  placeholder="e.g. prof_johnson"
                  required
                />
              </div>

              <div className="bs2-field">
                <label htmlFor="email">Email Address</label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  value={form.email}
                  onChange={handleChange}
                  placeholder="you@university.edu"
                  required
                />
              </div>

              <div className="bs2-field">
                <label htmlFor="password">Password</label>
                <div className="bs2-pw-wrap">
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    value={form.password}
                    onChange={handleChange}
                    placeholder="Min. 8 characters"
                    required
                  />
                  <button type="button" className="bs2-eye" onClick={() => setShowPassword(v => !v)} aria-label="Toggle password">
                    {showPassword ? <EyeOff size={18}/> : <Eye size={18}/>}
                  </button>
                </div>
              </div>

              <div className="bs2-field">
                <label htmlFor="confirmPassword">Confirm Password</label>
                <div className="bs2-pw-wrap">
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showConfirm ? 'text' : 'password'}
                    value={form.confirmPassword}
                    onChange={handleChange}
                    placeholder="Repeat your password"
                    required
                  />
                  <button type="button" className="bs2-eye" onClick={() => setShowConfirm(v => !v)} aria-label="Toggle confirm password">
                    {showConfirm ? <EyeOff size={18}/> : <Eye size={18}/>}
                  </button>
                </div>
              </div>

              <div className="bs2-checkbox">
                <input
                  id="terms"
                  type="checkbox"
                  checked={termsAccepted}
                  onChange={(e) => setTermsAccepted(e.target.checked)}
                />
                <label htmlFor="terms">
                  I accept the <Link to="/terms">Terms of Service</Link> and <Link to="/privacy">Privacy Policy</Link>
                </label>
              </div>

              {error && <div className="bs2-status bs2-status--error">{error}</div>}

              <button
                type="button"
                className="bs2-btn bs2-btn--primary"
                disabled={!termsAccepted}
                onClick={handleNextStep}
              >
                Continue to Expertise
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="5" y1="12" x2="19" y2="12"/>
                  <polyline points="12 5 19 12 12 19"/>
                </svg>
              </button>

              <p className="bs2-footer">
                Already have an account? <Link to="/login">Log in</Link>
              </p>
            </>
          ) : (
            <form onSubmit={handleSubmit} noValidate>
              <h1>Your Expertise</h1>
              <p className="bs2-step2-sub">Tell students what you specialise in so we can match you with the right assignments.</p>

              <div className="bs2-field">
                <label htmlFor="field_of_study">Primary Subject Area *</label>
                <div className="bs2-select-wrap">
                  <select
                    id="field_of_study"
                    name="field_of_study"
                    value={form.field_of_study}
                    onChange={handleChange}
                    required
                  >
                    <option value="">Select your subject…</option>
                    {SUBJECTS.map(s => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                  <svg className="bs2-select-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="6 9 12 15 18 9"/>
                  </svg>
                </div>
              </div>

              {form.field_of_study && (
                <div className="bs2-tag-preview">
                  <span className="bs2-tag">{form.field_of_study}</span>
                </div>
              )}

              <div className="bs2-field">
                <label htmlFor="bio">Professional Bio *</label>
                <textarea
                  id="bio"
                  name="bio"
                  value={form.bio}
                  onChange={handleChange}
                  placeholder="Describe your academic background, qualifications, and what makes you an exceptional expert in your field…"
                  rows={5}
                  required
                />
                <span className="bs2-char-count">{form.bio.length} / 500 characters</span>
              </div>

              <div className="bs2-tips">
                <div className="bs2-tips__title">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#1dbf73" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
                  </svg>
                  Tips for a strong bio
                </div>
                <ul>
                  <li>Mention your degrees and institutions</li>
                  <li>Highlight years of experience</li>
                  <li>Note specific skills or certifications</li>
                </ul>
              </div>

              {error && <div className="bs2-status bs2-status--error">{error}</div>}

              <div className="bs2-btn-row">
                <button type="button" className="bs2-btn bs2-btn--outline" onClick={() => { setStep(1); setError(null); }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="19" y1="12" x2="5" y2="12"/>
                    <polyline points="12 19 5 12 12 5"/>
                  </svg>
                  Back
                </button>
                <button type="submit" className="bs2-btn bs2-btn--primary" disabled={loading}>
                  {loading ? 'Creating Account…' : 'Create Expert Account'}
                </button>
              </div>

              <p className="bs2-footer">
                Registering as an expert. Not an expert?{' '}
                <Link to="/register">Join as a student</Link>
              </p>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}