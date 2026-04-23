import React, { useState } from "react";
import { useNavigate, useLocation } from 'react-router-dom';
import './login.scss';
import newRequest from "../../utils/newRequest";

const Login = () => {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState(null);

    const navigate = useNavigate();
    const location = useLocation();

    
    const successMessage = location.state?.message || null;

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        try {
            const res = await newRequest.post('/users/login/', { username, password });
            localStorage.setItem("currentUser", JSON.stringify(res.data));
            navigate('/');
        } catch (err) {
            setError(err?.response?.data?.message || err?.response?.data || "Login failed. Please try again.");
        }
    };

    return (
        <div className="login">
            <form onSubmit={handleSubmit}>
                <h1>Sign in</h1>

                {/* ✅ Show success message from registration */}
                {successMessage && (
                    <div role="status" aria-live="polite" className="status-message success">
                        {successMessage}
                    </div>
                )}

                <label htmlFor="username">Username</label>
                <input
                    id="username"
                    type="text"
                    name="username"
                    placeholder="johndoe"
                    onChange={e => setUsername(e.target.value)}
                />
                <label htmlFor="password">Password</label>
                <input
                    id="password"
                    type="password"
                    name="password"
                    onChange={e => setPassword(e.target.value)}
                />
                <button type="submit">Login</button>

                {error && (
                    <div role="alert" className="status-message error">
                        {error}
                    </div>
                )}
            </form>
        </div>
    );
};

export default Login;
