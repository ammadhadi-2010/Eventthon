import React, { useState } from 'react';
import { inviteCompanyMember } from '../services/companyTeamApi';

export default function TeamInviteModal({ roles = [], onClose, onInvited }) {
  const invitable = roles.filter((r) => r.invitable);
  const [email, setEmail] = useState('');
  const [role, setRole] = useState(invitable[0]?.id || 'viewer');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    setError('');
    try {
      await inviteCompanyMember({ email, role });
      onInvited?.();
      onClose?.();
    } catch (err) {
      setError(err?.response?.data?.detail || 'Invite failed.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="cp-team-modal" role="dialog" aria-modal="true" aria-label="Invite team member">
      <form className="cp-team-modal__panel" onSubmit={submit}>
        <header>
          <h3>Invite by email</h3>
          <p>Only the Owner can send invitations. Members must join via this secure invite.</p>
        </header>
        <label>
          Email
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="colleague@company.com"
            required
          />
        </label>
        <label>
          Role
          <select value={role} onChange={(e) => setRole(e.target.value)}>
            {invitable.map((r) => (
              <option key={r.id} value={r.id}>{r.label}</option>
            ))}
          </select>
        </label>
        {error ? <p className="cp-team-modal__error">{error}</p> : null}
        <div className="cp-team-modal__actions">
          <button type="button" onClick={onClose}>Cancel</button>
          <button type="submit" disabled={busy}>{busy ? 'Sending…' : 'Send invite'}</button>
        </div>
      </form>
    </div>
  );
}
