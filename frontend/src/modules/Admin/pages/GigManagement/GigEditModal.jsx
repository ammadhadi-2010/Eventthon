import React, { useEffect, useState } from 'react';

export default function GigEditModal({ open, gig, onClose, onSave }) {
  const [form, setForm] = useState({ title: '', description: '', category: '', starting_price: 0 });

  useEffect(() => {
    if (!open || !gig) return;
    const match = String(gig.budget || '').match(/\$?([\d.]+)/);
    setForm({
      title: gig.title || '',
      description: gig.description || '',
      category: gig.category || '',
      starting_price: match ? Number(match[1]) : 0,
    });
  }, [open, gig]);

  if (!open) return null;

  const update = (key, value) => setForm((prev) => ({ ...prev, [key]: value }));

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave?.({
      title: form.title.trim(),
      description: form.description.trim(),
      category: form.category.trim(),
      starting_price: Number(form.starting_price) || 0,
    });
  };

  return (
    <div className="gd-modal-root" role="dialog" aria-modal="true" aria-label="Edit gig">
      <button type="button" className="gd-modal-backdrop" onClick={onClose} aria-label="Close" />
      <form className="gd-modal" onSubmit={handleSubmit}>
        <h3>Edit Gig</h3>
        <label>
          Title
          <input value={form.title} onChange={(e) => update('title', e.target.value)} required />
        </label>
        <label>
          Category
          <input value={form.category} onChange={(e) => update('category', e.target.value)} required />
        </label>
        <label>
          Starting Price (USD)
          <input type="number" min="0" value={form.starting_price} onChange={(e) => update('starting_price', e.target.value)} />
        </label>
        <label>
          Description
          <textarea rows={4} value={form.description} onChange={(e) => update('description', e.target.value)} />
        </label>
        <div className="gd-modal-actions">
          <button type="button" className="um-btn um-btn--ghost" onClick={onClose}>Cancel</button>
          <button type="submit" className="um-btn um-btn--primary">Save Changes</button>
        </div>
      </form>
    </div>
  );
}
