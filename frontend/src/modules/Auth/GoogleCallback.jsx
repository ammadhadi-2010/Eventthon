import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../../api/axiosConfig';
import AuthShell from './AuthShell';
import EventThonLogo from '../../components/brand/EventThonLogo';
import { persistAuthSession, resolvePostLoginPath } from './authSession';
import { prefetchCompanyPortalDashboard } from '../../components/views/company/services/prefetchCompanyPortalDashboard';

export default function GoogleCallback() {
  const navigate = useNavigate();
  const [message, setMessage] = useState('Completing Google sign-in...');

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const error = params.get('error');
    const token = params.get('token');

    if (error) {
      setMessage(decodeURIComponent(error));
      return;
    }

    if (!token) {
      navigate('/auth/login', { replace: true });
      return;
    }

    let cancelled = false;

    const completeSignIn = async () => {
      try {
        const response = await API.post('/api/auth/google/session', { token });
        if (cancelled) return;

        if (response.data?.status !== 'success' || !response.data?.user) {
          setMessage('Google sign-in could not be completed.');
          return;
        }

        const { user, access_token: accessToken } = response.data;
        persistAuthSession(user, accessToken || token);
        window.dispatchEvent(new CustomEvent('et:profile-updated', { detail: user }));

        if (user.role === 'employer') {
          prefetchCompanyPortalDashboard();
        }

        navigate(resolvePostLoginPath(user), { replace: true });
      } catch (err) {
        if (cancelled) return;
        const detail = err?.response?.data?.detail;
        setMessage(typeof detail === 'string' ? detail : 'Google sign-in failed. Please try again.');
      }
    };

    completeSignIn();
    return () => {
      cancelled = true;
    };
  }, [navigate]);

  return (
    <AuthShell brandTagline="Secure Google sign-in for EventThon.">
      <div className="login-header">
        <EventThonLogo variant="auth" />
        <p className="tagline">GOOGLE SIGN-IN</p>
      </div>
      <h2 className="title-text">Connecting your account</h2>
      <p className="status-msg">{message}</p>
    </AuthShell>
  );
}
