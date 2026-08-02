import React, { useState, useEffect } from 'react';
import API from '../../api/axiosConfig';
import { useNavigate } from 'react-router-dom';
import PasswordInput from '../../components/PasswordInput';
// Google login abhi import rehne den magar use nahi hoga
import './Login.css';
import AuthShell from './AuthShell';
import EventThonLogo from '../../components/brand/EventThonLogo';
import { API_BASE_URL } from '../../api/axiosConfig';
import { prefetchCompanyPortalDashboard } from '../../components/views/company/services/prefetchCompanyPortalDashboard';
import { persistAuthSession, resolvePostLoginPath } from './authSession';
import {
  captureCompanyInviteFromUrl,
  getStoredCompanyInviteEmail,
} from '../../utils/companyInviteStorage';

const Login = () => {
  const navigate = useNavigate();
  
  // States
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [mobile, setMobile] = useState(''); 
  const [isAdminMode, setIsAdminMode] = useState(false);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [hasCompanyInvite, setHasCompanyInvite] = useState(false);

  // --- HIDDEN ADMIN TRIGGER (Alt + A) ---
  useEffect(() => {
    const invite = captureCompanyInviteFromUrl();
    if (invite.token) setHasCompanyInvite(true);
    const invitedEmail = invite.email || getStoredCompanyInviteEmail();
    if (invitedEmail) setEmail(invitedEmail);

    const handleKeyDown = (e) => {
      if (e.altKey && e.key === 'a') {
        e.preventDefault();
        setIsAdminMode(prev => !prev); 
        setMessage(isAdminMode ? "" : "Admin Access Activated");
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isAdminMode]);

  // --- Manual Login (Theek kiya gaya) ---
  const handleManualLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    
    try {
        const response = await API.post('/api/auth/login', {
    // Agar admin mode hai toh mobile bhejenge, warna email
    identifier: isAdminMode ? mobile.trim() : email.trim().toLowerCase(),
    password: password
});

        // Backend se 'status': 'success' aa raha hy
        if (response.data.status === "success") {
    console.log("Login successful, synchronizing session...");

    const { user, access_token: accessToken } = response.data;
    persistAuthSession(user, accessToken || '');

    console.log(`Access Granted: ${user.role} mode.`);

    if (user.role === 'employer') {
        prefetchCompanyPortalDashboard();
    }
    navigate(resolvePostLoginPath(user));
}

    } catch (error) {
        console.error("Login Error:", error);
        const isNetwork =
          error?.code === "ERR_NETWORK" ||
          error?.message === "Network Error" ||
          !error?.response;
        if (isNetwork) {
          setMessage(
            `Cannot reach API (${API_BASE_URL}). Start the FastAPI backend on port 8000, or set REACT_APP_API_BASE_URL in frontend/.env and restart npm.`
          );
        } else {
          const detail = error.response?.data?.detail;
          setMessage(
            typeof detail === "string"
              ? detail
              : Array.isArray(detail)
                ? detail.map((d) => d.msg || d).join(" ")
                : "Invalid email or password."
          );
        }
    } finally {
        setLoading(false);
    }
};

  const handleGoogleLogin = () => {
    window.location.href = `${API_BASE_URL}/api/auth/google`;
  };

  return (
    <AuthShell brandTagline="Join the elite: collaborate, learn & earn on the verified network.">
      <div className="bg-glow-top" />

        <div className="login-header">
          <EventThonLogo variant="auth" />
          <p className="tagline">JOIN THE ELITE: COLLABORATE, LEARN & EARN</p>
        </div>

        <h2 className="title-text">
          {isAdminMode ? 'ADMIN VERIFICATION' : 'PROFESSIONAL LOGIN'}
        </h2>
        {hasCompanyInvite && !isAdminMode ? (
          <p className="auth-referral-note">
            Sign in with the invited email to accept your company team invitation.
          </p>
        ) : null}

        <form onSubmit={handleManualLogin} className="login-form">
          <input 
            className="glass-input" 
            type="text"
            placeholder={isAdminMode ? "Admin ID" : "Email Address"} 
            value={isAdminMode ? mobile : email}
            onChange={(e) => isAdminMode ? setMobile(e.target.value) : setEmail(e.target.value)}
            required 
          />
          
          <PasswordInput
            wrapperClassName="password-wrapper"
            className="glass-input"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          {/* --- Forgot Password Link (New) --- */}
          {!isAdminMode && (
            <div style={{ textAlign: 'right', marginTop: '-10px', marginBottom: '15px' }}>
              <button 
                type="button" 
                className="forgot-link" 
                onClick={() => navigate('/auth/forgot-password')}
                style={{ 
                  background: 'none', border: 'none', color: '#00e5ff', 
                  fontSize: '0.85rem', cursor: 'pointer', opacity: 0.8 
                }}
              >
                Forgot Password?
              </button>
            </div>
          )}

          <button type="submit" className="login-btn" disabled={loading}>
            {loading ? 'SYNCING...' : (isAdminMode ? 'VERIFY ADMIN' : 'LOG IN')}
          </button>
        </form>

        {!isAdminMode && (
          <>
            <div className="divider"><span>OR CONTINUE WITH</span></div>
            <div className="social-login">
              <button type="button" className="glass-input" onClick={handleGoogleLogin}>
                Continue with Google
              </button>
            </div>
            <p className="footer-link">
  New to the network? 
  <button 
    type="button" 
    className="create-account-btn" 
    onClick={() => navigate('/auth/signin')}
  >
    Create Account
  </button>
</p>
          </>
        )}

        {message && (
          <p
            className={`status-msg ${isAdminMode ? 'admin-alert' : ''} ${
              message.includes('Cannot reach API') ? 'status-msg--info' : ''
            }`}
          >
            {message}
          </p>
        )}
    </AuthShell>
  );
};

export default Login;