import React, { useState } from 'react';

function defaultDateTime() {
  const d = new Date(Date.now() + 60 * 60 * 1000);
  d.setMinutes(0, 0, 0);
  return d.toISOString().slice(0, 16);
}

export default function ComposerScheduleModal({ open, onClose, onSchedule, saving = false }) {
  const [sendAt, setSendAt] = useState(defaultDateTime());

  if (!open) return null;

  const handleSave = (event) => {
    event.preventDefault();
    const picked = new Date(sendAt);
    if (Number.isNaN(picked.getTime())) {
      window.alert('Please choose a valid date and time.');
      return;
    }
    if (picked.getTime() <= Date.now()) {
      window.alert('Scheduled time must be in the future.');
      return;
    }
    onSchedule?.(picked.toISOString());
  };

  return (
    <div className="eo-modal" role="dialog" aria-modal="true" aria-labelledby="eo-schedule-title">
      <button type="button" className="eo-modal__backdrop" aria-label="Close" onClick={onClose} />
      <form className="eo-modal__card" onSubmit={handleSave}>
        <h3 id="eo-schedule-title" className="eo-modal__title">Schedule Email</h3>
        <p className="eo-ai-modal__hint">Choose when this outreach email should be sent automatically.</p>
        <label className="eo-field">
          <span className="eo-field__label">Send Date & Time</span>
          <input
            type="datetime-local"
            className="eo-field__input"
            value={sendAt}
            onChange={(e) => setSendAt(e.target.value)}
            required
          />
        </label>
        <footer className="eo-modal__actions">
          <button type="submit" className="eo-btn eo-btn--primary" disabled={saving}>
            {saving ? 'Saving…' : 'Schedule Send'}
          </button>
          <button type="button" className="eo-btn eo-btn--ghost" onClick={onClose}>Cancel</button>
        </footer>
      </form>
    </div>
  );
}
