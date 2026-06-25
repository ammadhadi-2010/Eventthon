import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import API, { API_BASE_URL } from '../../api/axiosConfig';
import PasswordInput from '../../components/PasswordInput';
import AuthShell from './AuthShell';
import EventThonLogo from '../../components/brand/EventThonLogo';

const ForgotPassword = () => {
    const [email, setEmail] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleReset = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await API.post('/api/auth/reset-password', {
                email: email.trim().toLowerCase(),
                new_password: newPassword
            });
            setMessage("Password updated successfully!");
            setTimeout(() => navigate('/auth/login'), 2000);
        } catch (err) {
            const isNetwork =
                err?.code === "ERR_NETWORK" ||
                err?.message === "Network Error" ||
                !err?.response;
            if (isNetwork) {
                setMessage(
                    `Cannot reach API (${API_BASE_URL}). Start the backend or fix REACT_APP_API_BASE_URL.`
                );
            } else {
                const d = err.response?.data?.detail;
                setMessage(
                    typeof d === "string"
                        ? d
                        : Array.isArray(d)
                            ? d.map((x) => x.msg || x).join(" ")
                            : "Error updating password"
                );
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <AuthShell brandTagline="Reset your password and get back to your mission.">
            <div className="bg-glow-top" />
            <EventThonLogo variant="auth" />
            <h2 className="title-text">RESET PASSWORD</h2>
            <form onSubmit={handleReset} className="login-form">
                <input
                    className="glass-input"
                    type="email"
                    placeholder="Enter registered email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                />
                <PasswordInput
                    className="glass-input"
                    placeholder="Enter new password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    autoComplete="new-password"
                    required
                />
                <button type="submit" className="login-btn" disabled={loading}>
                    {loading ? "UPDATING..." : "UPDATE PASSWORD"}
                </button>
            </form>
            {message && (
                <p
                    className={`status-msg ${
                        message.includes("Cannot reach") ? "status-msg--info" : ""
                    }`}
                >
                    {message}
                </p>
            )}
            <button
                type="button"
                onClick={() => navigate("/auth/login")}
                className="forgot-link"
                style={{
                    background: "none",
                    border: "none",
                    color: "#00e5ff",
                    marginTop: "12px",
                    cursor: "pointer",
                    fontWeight: 700,
                }}
            >
                Back to Login
            </button>
        </AuthShell>
    );
};

export default ForgotPassword;