import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import AuthShell from '../../../../modules/Auth/AuthShell';
import EventThonLogo from '../../../brand/EventThonLogo';
import { hasStoredSession } from '../../../../utils/storedUser';
import {
  clearStoredCompanyInvite,
  storeCompanyInvite,
} from '../../../../utils/companyInviteStorage';
import {
  acceptCompanyInvite,
  declineCompanyInvite,
  fetchCompanyInvitePreview,
} from '../services/companyTeamApi';
import '../styles/company-team.css';

export default function CompanyInviteAcceptPage() {
  const { token } = useParams();
  const navigate = useNavigate();
  const [invite, setInvite] = useState(null);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState('');
  const signedIn = hasStoredSession();

  useEffect(() => {
    if (!token) return undefined;
    storeCompanyInvite(token);
    let cancelled = false;
    (async () => {
      try {
        const data = await fetchCompanyInvitePreview(token);
        if (!cancelled) setInvite(data);
      } catch (err) {
        if (!cancelled) {
          setError(err?.response?.data?.detail || 'Invitation not found or expired.');
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [token]);

  const onAccept = async () => {
    setBusy(true);
    setError('');
    try {
      const member = await acceptCompanyInvite(token);
      clearStoredCompanyInvite();
      if (member?.companyId) localStorage.setItem('companyId', member.companyId);
      localStorage.setItem('userRole', 'employer');
      setDone('accepted');
      navigate('/company/dashboard/team', { replace: true });
    } catch (err) {
      setError(err?.response?.data?.detail || 'Could not accept invitation.');
    } finally {
      setBusy(false);
    }
  };

  const onDecline = async () => {
    setBusy(true);
    setError('');
    try {
      await declineCompanyInvite(token);
      clearStoredCompanyInvite();
      setDone('declined');
    } catch (err) {
      setError(err?.response?.data?.detail || 'Could not decline invitation.');
    } finally {
      setBusy(false);
    }
  };

  const signupHref = `/auth/signin?invite=${encodeURIComponent(token || '')}&email=${encodeURIComponent(invite?.email || '')}`;
  const loginHref = `/auth/login?invite=${encodeURIComponent(token || '')}&email=${encodeURIComponent(invite?.email || '')}`;

  return (
    <AuthShell brandTagline="Secure company invitations — join only through an invite.">
      <div className="login-header">
        <EventThonLogo variant="auth" />
        <p className="tagline">COMPANY TEAM INVITATION</p>
      </div>

      <div className="cp-invite-card">
        {error ? <p className="status-msg">{error}</p> : null}
        {done === 'declined' ? (
          <p className="status-msg">Invitation declined.</p>
        ) : null}
        {!invite && !error ? <p className="status-msg">Loading invitation…</p> : null}
        {invite ? (
          <>
            <h2 className="title-text">{invite.companyName || 'Company'}</h2>
            <p className="cp-invite-card__meta">
              {invite.invitedBy || 'Someone'} invited <strong>{invite.email}</strong> as{' '}
              <strong>{invite.roleLabel || invite.role}</strong>.
            </p>
            {invite.inviteStatus && invite.inviteStatus !== 'pending' ? (
              <p className="status-msg">This invitation is {invite.inviteStatus}.</p>
            ) : null}

            {!signedIn && invite.inviteStatus === 'pending' ? (
              <div className="cp-invite-card__actions">
                {invite.userExists ? (
                  <Link className="login-btn" to={loginHref}>Sign in to accept</Link>
                ) : (
                  <>
                    <Link className="login-btn" to={signupHref}>Create account to join</Link>
                    <Link className="cp-invite-card__ghost" to={loginHref}>Already have an account? Log in</Link>
                  </>
                )}
              </div>
            ) : null}

            {signedIn && invite.inviteStatus === 'pending' ? (
              <div className="cp-invite-card__actions">
                <button type="button" className="login-btn" disabled={busy} onClick={onAccept}>
                  {busy ? 'Working…' : 'Accept invitation'}
                </button>
                <button type="button" className="cp-invite-card__ghost" disabled={busy} onClick={onDecline}>
                  Decline
                </button>
              </div>
            ) : null}
          </>
        ) : null}
      </div>
    </AuthShell>
  );
}
