import React, { useState } from 'react';
import { transferCompanyOwnership } from '../services/companyTeamApi';

export default function TeamTransferModal({ target, onClose, onDone }) {
  const [email, setEmail] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    setError('');
    try {
      await transferCompanyOwnership(target.id, email);
      onDone?.();
      onClose?.();
    } catch (err) {
      setError(err?.response?.data?.detail || 'Transfer failed.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="cp-team-modal" role="dialog" aria-modal="true" aria-label="Transfer ownership">
      <form className="cp-team-modal__panel" onSubmit={submit}>
        <header>
          <h3>Transfer ownership</h3>
          <p>
            Transfer to <strong>{target?.name || target?.email}</strong>. Type your current owner email to confirm.
          </p>
        </header>
        <label>
          Confirm your owner email
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </label>
        {error ? <p className="cp-team-modal__error">{error}</p> : null}
        <div className="cp-team-modal__actions">
          <button type="button" onClick={onClose}>Cancel</button>
          <button type="submit" className="is-danger" disabled={busy}>
            {busy ? 'Transferring…' : 'Transfer ownership'}
          </button>
        </div>
      </form>
    </div>
  );
}
