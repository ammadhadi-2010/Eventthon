import React, { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import { AUTOMATION_PLATFORMS } from './automationData';

export default function AutomationSettingsModal({ open, busy, platforms, onClose, onSave }) {
  const [local, setLocal] = useState(platforms);

  useEffect(() => {
    if (open) setLocal(platforms);
  }, [open, platforms]);

  if (!open) return null;

  const toggle = (id) => {
    setLocal((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <div className="auto-modal-root" role="dialog" aria-modal="true" aria-label="Automation settings">
      <button type="button" className="auto-modal-backdrop" aria-label="Close" onClick={onClose} />
      <div className="auto-modal-panel">
        <header className="auto-modal-head">
          <h2>Automation Settings</h2>
          <button type="button" className="um-row-menu" aria-label="Close" onClick={onClose}>
            <X size={16} />
          </button>
        </header>
        <p className="auto-modal-sub">Toggle connected social platforms for automated publishing.</p>
        <ul className="auto-settings-list">
          {AUTOMATION_PLATFORMS.map((platform) => (
            <li key={platform.id}>
              <label className="auto-settings-item">
                <input
                  type="checkbox"
                  checked={local[platform.id] !== false}
                  onChange={() => toggle(platform.id)}
                />
                <span>{platform.label}</span>
              </label>
            </li>
          ))}
        </ul>
        <footer className="auto-modal-actions">
          <button type="button" className="um-btn um-btn--ghost" onClick={onClose}>
            Cancel
          </button>
          <button type="button" className="um-btn um-btn--primary" disabled={busy} onClick={() => onSave(local)}>
            Save Settings
          </button>
        </footer>
      </div>
    </div>
  );
}
