import React, { useCallback, useEffect, useState } from 'react';
import PasswordInput from '../../../components/PasswordInput';
import { fetchAccountSettings, saveAccountSettings } from './accountSettingsApi';import './account-hub.css';

export default function AccountSettings({ userData, onSave }) {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [verifyPassword, setVerifyPassword] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [lockInfo, setLockInfo] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const data = await fetchAccountSettings(userData);
      setLockInfo(data);
      setFullName(data?.fullName || userData?.name || userData?.full_name || '');
      setEmail(data?.email || userData?.email || localStorage.getItem('userEmail') || '');
    } catch (err) {
      setError(err?.response?.data?.detail || err?.message || 'Could not load account settings.');
      setFullName(userData?.name || userData?.full_name || '');
      setEmail(userData?.email || localStorage.getItem('userEmail') || '');
    } finally {
      setLoading(false);
    }
  }, [userData]);

  useEffect(() => {
    load();
  }, [load]);

  const credentialsLocked = Boolean(lockInfo?.credentialsLocked);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setMessage('');
    setError('');

    if (password && password !== verifyPassword) {
      setError('Passwords do not match.');
      return;
    }
    if (password && password.length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }

    setSaving(true);
    try {
      const result = await saveAccountSettings(userData, {
        fullName,
        email,
        password: password || undefined,
        verifyPassword: verifyPassword || undefined,
      });

      if (result?.email) {
        localStorage.setItem('userEmail', result.email);
      }
      if (result?.fullName) {
        localStorage.setItem('userName', result.fullName);
      }

      setLockInfo((prev) => ({ ...prev, ...result }));
      setPassword('');
      setVerifyPassword('');

      if (result?.passwordUpdated && !result?.credentialsChanged) {
        setMessage('Password updated successfully.');
      } else if (result?.credentialsChanged) {
        setMessage('Name and email updated successfully.');
      } else {
        setMessage('Changes saved successfully.');
      }

      if (onSave) await onSave(result);
    } catch (err) {
      setError(err?.response?.data?.detail || err?.message || 'Could not save changes. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="account-hub">
      <h1 className="account-hub__title">Account Settings</h1>
      <p className="account-hub__sub">Update your credentials and profile contact details.</p>

      {loading ? <p className="account-hub__msg">Loading account settings…</p> : null}
      {error ? <p className="account-hub__msg account-hub__msg--error">{error}</p> : null}
      {credentialsLocked && lockInfo?.lockReason ? (
        <p className="account-hub__msg account-hub__msg--lock">{lockInfo.lockReason}</p>
      ) : null}

      <form className="account-hub__card" onSubmit={handleSubmit}>
        <div className="account-hub__field">
          <label htmlFor="settings-name">Full Name</label>
          <input
            id="settings-name"
            type="text"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            placeholder="Your full name"
            required
            disabled={credentialsLocked || saving}
          />
          {credentialsLocked ? (
            <p className="account-hub__hint">Locked for 2 months after admin approval. Password can still be changed.</p>
          ) : null}
        </div>
        <div className="account-hub__field">
          <label htmlFor="settings-email">Professional Email</label>
          <input
            id="settings-email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="name@company.com"
            required
            disabled={credentialsLocked || saving}
          />
        </div>
        <div className="account-hub__field">
          <label htmlFor="settings-password">New Password</label>
          <PasswordInput
            id="settings-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Leave blank to keep current"
            autoComplete="new-password"
            disabled={saving}
          />
          <p className="account-hub__hint">You can change your password anytime.</p>
        </div>
        <div className="account-hub__field">
          <label htmlFor="settings-verify">Verify Password</label>
          <PasswordInput
            id="settings-verify"
            value={verifyPassword}
            onChange={(e) => setVerifyPassword(e.target.value)}
            placeholder="Re-enter new password"
            autoComplete="new-password"
            disabled={saving}
          />
        </div>        <button type="submit" className="account-hub__save" disabled={saving || loading}>
          {saving ? 'Saving…' : 'Save Changes'}
        </button>
        {message ? <p className="account-hub__msg account-hub__msg--ok">{message}</p> : null}
      </form>
    </div>
  );
}
