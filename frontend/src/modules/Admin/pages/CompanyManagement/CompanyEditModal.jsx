import React, { useEffect, useState } from 'react';
import { X } from 'lucide-react';

export default function CompanyEditModal({ company, open, saving, onClose, onSave }) {
  const [form, setForm] = useState(null);
  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  useEffect(() => {
    if (company) {
      setForm({
        name: company.name || '',
        industry: company.industry || '',
        website: company.website || '',
        size: company.size || '',
        location: company.location || '',
        imageurl: company.imageurl || '',
        status: company.status || 'active',
      });
    }
  }, [company]);

  if (!open || !form) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(company.id, form);
  };

  return (
    <div className="jm-modal-overlay" role="dialog" aria-modal="true" aria-label="Edit company">
      <button type="button" className="jm-modal-overlay__backdrop" onClick={onClose} aria-label="Close" />
      <div className="jm-modal gigs-card">
        <header className="jm-modal__head">
          <h2>Edit Company</h2>
          <button type="button" className="jm-modal__close" onClick={onClose} aria-label="Close">
            <X size={18} />
          </button>
        </header>
        <form className="jm-edit-form" onSubmit={handleSubmit}>
          <label className="jm-field"><span>Name</span><input className="jm-input" value={form.name} onChange={set('name')} required /></label>
          <label className="jm-field"><span>Industry</span><input className="jm-input" value={form.industry} onChange={set('industry')} /></label>
          <label className="jm-field"><span>Website</span><input className="jm-input" value={form.website} onChange={set('website')} /></label>
          <label className="jm-field"><span>Size</span><input className="jm-input" value={form.size} onChange={set('size')} /></label>
          <label className="jm-field"><span>Location</span><input className="jm-input" value={form.location} onChange={set('location')} /></label>
          <label className="jm-field"><span>imageurl</span><input className="jm-input" value={form.imageurl} onChange={set('imageurl')} /></label>
          <label className="jm-field">
            <span>Status</span>
            <select className="jm-select jm-select--full" value={form.status} onChange={set('status')}>
              <option value="active">Active</option>
              <option value="pending">Pending</option>
              <option value="inactive">Inactive</option>
            </select>
          </label>
          <footer className="jm-modal__foot">
            <button type="button" className="um-btn um-btn--ghost" onClick={onClose}>Cancel</button>
            <button type="submit" className="um-btn um-btn--primary" disabled={saving}>{saving ? 'Saving…' : 'Save'}</button>
          </footer>
        </form>
      </div>
    </div>
  );
}
