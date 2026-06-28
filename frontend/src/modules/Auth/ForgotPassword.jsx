import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import API, { API_BASE_URL } from '../../api/axiosConfig';
import PasswordInput from '../../components/PasswordInput';
import AuthShell from './AuthShell';
import EventThonLogo from '../../components/brand/EventThonLogo';
import './ForgotPassword.css';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [step, setStep] = useState(1);
  const [message, setMessage] = useState('');
  const [messageTone, setMessageTone] = useState('info');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const setStatus = (text, tone = 'info') => {
    setMessage(text);
    setMessageTone(tone);
  };

  const handleError = (err) => {
    const isNetwork =
      err?.code === 'ERR_NETWORK' ||
      err?.message === 'Network Error' ||
      !err?.response;
    if (isNetwork) {
      setStatus(`Cannot reach API (${API_BASE_URL}). Check REACT_APP_API_BASE_URL and the backend.`, 'error');
      return;
    }
    const d = err.response?.data?.detail;
    setStatus(
      typeof d === 'string'
        ? d
        : Array.isArray(d)
          ? d.map((x) => x.msg || x).join(' ')
          : 'Something went wrong. Please try again.',
      'error',
    );
  };

  const handleSendOtp = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    try {
      const res = await API.post('/api/auth/forgot-password', {
        email: email.trim().toLowerCase(),
      });
      setStatus(res.data?.message || 'Verification code sent to your email!', 'success');
      setStep(2);
    } catch (err) {
      handleError(err);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyAndReset = async (e) => {
    e.preventDefault();
    if (!/^\d{6}$/.test(otp.trim())) {
      setStatus('Enter the 6-digit code from your email.', 'error');
      return;
    }
    if (newPassword.trim().length < 8) {
      setStatus('Password must be at least 8 characters.', 'error');
      return;
    }

    setLoading(true);
    setMessage('');
    try {
      const res = await API.post('/api/auth/verify-email-otp', {
        email: email.trim().toLowerCase(),
        otp: otp.trim(),
        new_password: newPassword,
      });
      setStatus(res.data?.message || 'Password updated successfully!', 'success');
      setTimeout(() => navigate('/auth/login'), 2000);
    } catch (err) {
      handleError(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell brandTagline="Reset your password securely and get back to your mission.">
      <div className="bg-glow-top" />
      <EventThonLogo variant="auth" />
      <h2 className="title-text">RESET PASSWORD</h2>

      <div className="fp-steps" aria-label="Password reset progress">
        <span className={`fp-step${step === 1 ? ' fp-step--active' : ' fp-step--done'}`}>1. Email</span>
        <span className="fp-step-divider" aria-hidden />
        <span className={`fp-step${step === 2 ? ' fp-step--active' : ''}`}>2. Verify</span>
      </div>

      {step === 1 ? (
        <form onSubmit={handleSendOtp} className="login-form fp-form">
          <label className="fp-label" htmlFor="fp-email">
            Registered email
          </label>
          <input
            id="fp-email"
            className="glass-input"
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
            required
            disabled={loading}
          />
          <button type="submit" className="login-btn" disabled={loading}>
            {loading ? 'SENDING CODE…' : 'SEND VERIFICATION CODE'}
          </button>
        </form>
      ) : (
        <form onSubmit={handleVerifyAndReset} className="login-form fp-form">
          <p className="fp-hint">
            Enter the 6-digit code sent to <strong>{email}</strong>
          </p>
          <label className="fp-label" htmlFor="fp-otp">
            Verification code
          </label>
          <input
            id="fp-otp"
            className="glass-input fp-otp-input"
            type="text"
            inputMode="numeric"
            pattern="\d{6}"
            placeholder="000000"
            value={otp}
            onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
            maxLength={6}
            autoComplete="one-time-code"
            required
            disabled={loading}
          />
          <label className="fp-label" htmlFor="fp-password">
            New password
          </label>
          <PasswordInput
            id="fp-password"
            className="glass-input"
            placeholder="At least 8 characters"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            autoComplete="new-password"
            minLength={8}
            required
            disabled={loading}
          />
          <button type="submit" className="login-btn" disabled={loading}>
            {loading ? 'VERIFYING…' : 'VERIFY & RESET PASSWORD'}
          </button>
          <button type="button" className="fp-back-link" onClick={() => setStep(1)} disabled={loading}>
            Change email
          </button>
        </form>
      )}

      {message ? (
        <p className={`status-msg fp-status fp-status--${messageTone}`}>{message}</p>
      ) : null}

      <button type="button" onClick={() => navigate('/auth/login')} className="forgot-link fp-login-link">
        Back to Login
      </button>
    </AuthShell>
  );
};

export default ForgotPassword;
