import React, { useState } from 'react';
import { FiCheck } from 'react-icons/fi';
import { AlertTriangle } from 'lucide-react';
import { patchAdminCompanyStatus } from '../../../../services/adminCompanyService';

export default function CompanyDetailRightPanel({ company, onAfterAction }) {
  const [note, setNote] = useState('');
  const [busy, setBusy] = useState(false);
  const companyId = company?.id;

  const run = async (action) => {
    if (!companyId) return;
    setBusy(true);
    try {
      await patchAdminCompanyStatus(companyId, action);
      setNote('');
      if (typeof onAfterAction === 'function') await onAfterAction();
    } catch (e) {
      window.alert(e?.response?.data?.detail || e?.message || 'Action failed');
    } finally {
      setBusy(false);
    }
  };

  const requestMoreInfo = () => {
    window.alert('Request sent: company owner would be notified to upload additional verification documents.');
  };

  return (
    <aside className="ud-right">
      <div className="ud-card ud-mini-preview">
        <div className="ud-mini-banner cm-detail-banner" />
        <div className="ud-mini-body">
          <p className="ud-mini-name">
            {company?.name || 'Company'}{' '}
            {company?.isVerified ? (
              <span className="ud-mini-verified">
                <FiCheck strokeWidth={3} />
              </span>
            ) : null}
          </p>
          <p className="ud-mini-sub">{company?.tagline || company?.industry || 'Employer organization'}</p>
        </div>
      </div>

      <div className="ud-card ud-admin-card">
        <div className="ud-admin-hint">
          <AlertTriangle size={18} className="ud-admin-hint-icon" aria-hidden />
          <p>
            Actions apply immediately to this company profile. Add an internal note below for your team (stored in
            this session only).
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
            onClick={() => run('approve')}
          >
            Approve company
          </button>
          <button
            type="button"
            className="ud-admin-btn ud-admin-btn--reject"
            disabled={busy}
            onClick={() => run('reject')}
          >
            Reject company
          </button>
          <button type="button" className="ud-admin-btn ud-admin-btn--neutral" disabled={busy} onClick={requestMoreInfo}>
            Request more info
          </button>
        </div>
      </div>
    </aside>
  );
}
