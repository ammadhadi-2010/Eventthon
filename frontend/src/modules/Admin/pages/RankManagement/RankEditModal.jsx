import React, { useEffect, useState } from 'react';

export default function RankEditModal({ open, rank, onClose, onSave }) {
  const [form, setForm] = useState({
    name: '',
    icon: '',
    minPoints: 0,
    benefits: '',
    status: 'active',
  });

  useEffect(() => {
    if (!rank || !open) return;
    setForm({
      name: rank.name || '',
      icon: rank.icon || '',
      minPoints: rank.minPoints || 0,
      benefits: rank.benefits || '',
      status: rank.status || 'active',
    });
  }, [open, rank]);

  if (!open) return null;

  const update = (key, value) => setForm((prev) => ({ ...prev, [key]: value }));

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave?.({
      ...rank,
      ...form,
      minPoints: Number(form.minPoints) || 0,
      updatedOn: new Date().toISOString().slice(0, 10),
    });
  };

  return (
    <div className="rd-modal-root" role="dialog" aria-modal="true" aria-label="Edit rank">
      <button type="button" className="rd-modal-backdrop" onClick={onClose} aria-label="Close edit rank modal" />
      <form className="rd-modal" onSubmit={handleSubmit}>
        <h3>Edit Rank</h3>
        <label>
          Rank Name
          <input value={form.name} onChange={(e) => update('name', e.target.value)} placeholder="Rank name" required />
        </label>
        <label>
          Rank Icon
          <input value={form.icon} onChange={(e) => update('icon', e.target.value)} placeholder="Emoji or icon" required />
        </label>
        <label>
          Minimum Points
          <input type="number" min="0" value={form.minPoints} onChange={(e) => update('minPoints', e.target.value)} />
        </label>
        <label>
          Benefit Summary
          <textarea value={form.benefits} onChange={(e) => update('benefits', e.target.value)} rows={3} placeholder="Main benefit summary" />
        </label>
        <label>
          Status
          <select value={form.status} onChange={(e) => update('status', e.target.value)}>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </label>
        <div className="rd-modal-actions">
          <button type="button" className="um-btn um-btn--ghost" onClick={onClose}>Cancel</button>
          <button type="submit" className="um-btn um-btn--primary">Save Changes</button>
        </div>
      </form>
    </div>
  );
}
