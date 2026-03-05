import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import newRequest from "../../utils/newRequest";  // ✅ use this instead of axios
import "./register.scss";

export default function Register() {
  const [user, setUser] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [termsAccepted, setTermsAccepted] = useState(false);

  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setUser((prev) => ({ ...prev, [name]: value }));
    setError(null);
    setSuccess(null);
  };

  const validateForm = () => {
    if (!user.username || !user.email || !user.password || !user.confirmPassword) {
      setError("All fields are required.");
      return false;
    }
    if (user.password !== user.confirmPassword) {
      setError("Passwords do not match.");
      return false;
    }
    if (user.password.length < 6) {
      setError("Password must be at least 6 characters long.");
      return false;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(user.email)) {
      setError("Please enter a valid email address.");
      return false;
    }
    if (!termsAccepted) {
      setError("You must accept the Terms and Service.");
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!validateForm()) return;

    setLoading(true);
    try {
      const { confirmPassword, ...payload } = user;
      const res = await newRequest.post("/users/register/", payload); // ✅ backend call
      localStorage.setItem("currentUser", JSON.stringify(res.data)); // ✅ save user
      setSuccess("Registration successful! Redirecting...");
      setTimeout(() => navigate("/"), 1000);
    } catch (err) {
      console.error("Registration failed:", err);
      setError(
        err?.response?.data?.message || err.message || "An unexpected error occurred. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="register-container">
      <form onSubmit={handleSubmit}>
        <h1>Create an Account</h1>

        <div className="field">
          <label htmlFor="username">Username</label>
          <input
            id="username"
            name="username"
            type="text"
            value={user.username}
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
            value={user.email}
            onChange={handleChange}
            required
            aria-required="true"
          />
        </div>

        <div className="field">
          <label htmlFor="password">Password</label>
          <input
            id="password"
            name="password"
            type="password"
            value={user.password}
            onChange={handleChange}
            required
            aria-required="true"
          />
        </div>

        <div className="field">
          <label htmlFor="confirmPassword">Confirm Password</label>
          <input
            id="confirmPassword"
            name="confirmPassword"
            type="password"
            value={user.confirmPassword}
            onChange={handleChange}
            required
            aria-required="true"
          />
        </div>

        <div className="checkbox-group">
          <input
            id="terms"
            name="terms"
            type="checkbox"
            checked={termsAccepted}
            onChange={(e) => setTermsAccepted(e.target.checked)}
            aria-checked={termsAccepted}
          />
          <label htmlFor="terms">
            I accept the <a href="#">Terms and Service</a>
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

        <button type="submit" disabled={loading || !termsAccepted}>
          {loading ? "Registering..." : "Register"}
        </button>

        <p className="footer">
          Already have an account? <a href="/login">Log in</a>
        </p>
      </form>
    </div>
  );
}
