import React, { useState } from 'react';
import { FiCheck } from 'react-icons/fi';
import { AlertTriangle } from 'lucide-react';
import { updateUserStatus } from '../../../../services/adminUserManagementService';

export default function UserDetailRightPanel({ user, row, actionKey, onAfterAction }) {
  const [note, setNote] = useState('');
  const [busy, setBusy] = useState(false);

  const displayName =
    [user?.first_name, user?.last_name].filter(Boolean).join(' ').trim() || row?.displayName || 'User';

  const run = async (action) => {
    if (!actionKey) return;
    setBusy(true);
    try {
      await updateUserStatus(actionKey, action);
      setNote('');
      if (typeof onAfterAction === 'function') await onAfterAction();
    } catch (e) {
      window.alert(e?.response?.data?.detail || e?.message || 'Action failed');
    } finally {
      setBusy(false);
    }
  };

  const requestMoreInfo = () => {
    window.alert('Request sent (demo): user would receive an email to upload more documents.');
  };

  return (
    <aside className="ud-right">
      <div className="ud-card ud-mini-preview">
        <div className="ud-mini-banner" />
        <div className="ud-mini-body">
          <p className="ud-mini-name">
            {displayName}{' '}
            <span className="ud-mini-verified">
              <FiCheck strokeWidth={3} />
            </span>
          </p>
          <p className="ud-mini-sub">{user?.headline || 'Professional headline'}</p>
        </div>
      </div>

      <div className="ud-card ud-admin-card">
        <div className="ud-admin-hint">
          <AlertTriangle size={18} className="ud-admin-hint-icon" aria-hidden />
          <p>
            Actions apply immediately to this account. Add an internal note below for your team (stored locally in this
            session only).
          </p>
        </div>
        <label className="ud-note-label">
          Add note (optional)
          <textarea
            className="ud-note-input"
            rows={3}
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Internal note…"
          />
        </label>
        <div className="ud-admin-btns">
          <button
            type="button"
            className="ud-admin-btn ud-admin-btn--approve"
            disabled={busy}
            onClick={() => run('approve_verification')}
          >
            Approve user
          </button>
          <button
            type="button"
            className="ud-admin-btn ud-admin-btn--reject"
            disabled={busy}
            onClick={() => run('reject_verification')}
          >
            Reject user
          </button>
          <button type="button" className="ud-admin-btn ud-admin-btn--neutral" disabled={busy} onClick={requestMoreInfo}>
            Request more info
          </button>
        </div>
      </div>
    </aside>
  );
}
