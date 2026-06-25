import React, { useState } from 'react';
import { PROJECT_STATUS_OPTIONS } from './projectData';

export default function ProjectStatusModal({ project, onClose, onSave }) {
  const [status, setStatus] = useState(project?.status || 'In Progress');
  const [saving, setSaving] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await onSave?.(status);
      onClose?.();
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="pm-modal-root">
      <button type="button" className="pm-modal-backdrop" aria-label="Close" onClick={onClose} />
      <form className="pm-modal" onSubmit={submit}>
        <h3>Change Status</h3>
        <p className="pm-modal-sub">{project?.name}</p>
        <label>
          Status
          <select value={status} onChange={(e) => setStatus(e.target.value)}>
            {PROJECT_STATUS_OPTIONS.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </label>
        <div className="pm-modal-actions">
          <button type="button" className="admin-chip px-3 py-2 text-xs" onClick={onClose}>
            Cancel
          </button>
          <button type="submit" className="rounded-lg bg-violet-600 px-4 py-2 text-xs font-bold text-white" disabled={saving}>
            {saving ? 'Updating…' : 'Update Status'}
          </button>
        </div>
      </form>
    </div>
  );
}
