import React, { useEffect, useState } from 'react';
import { createOutreachLead, updateOutreachLead } from '../../services/emailOutreachApi';

const STATUS_OPTIONS = [
  { value: 'not_contacted', label: 'Not Contacted' },
  { value: 'emailed', label: 'Emailed' },
  { value: 'opened', label: 'Opened' },
  { value: 'replied', label: 'Replied' },
  { value: 'interested', label: 'Interested' },
];

export default function LeadEditModal({ lead, onClose, onSaved }) {
  const isNew = !lead?.id;
  const [form, setForm] = useState({
    company: '',
    website: '',
    contact_email: '',
    contact_name: '',
    status: 'not_contacted',
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setForm({
      company: lead?.company || '',
      website: lead?.website || '',
      contact_email: lead?.contactEmail || '',
      contact_name: lead?.contactName || '',
      status: lead?.status || 'not_contacted',
    });
  }, [lead]);

  const setField = (key, value) => setForm((prev) => ({ ...prev, [key]: value }));

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSaving(true);
    try {
      const saved = isNew
        ? await createOutreachLead(form)
        : await updateOutreachLead(lead.id, form);
      onSaved?.(saved);
      onClose?.();
      window.alert(isNew ? 'Lead added.' : 'Lead updated.');
    } catch (err) {
      window.alert(err?.response?.data?.detail || err?.message || 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  if (lead === null) return null;

  return (
    <div className="eo-modal" role="dialog" aria-modal="true" aria-labelledby="eo-edit-title">
      <button type="button" className="eo-modal__backdrop" aria-label="Close" onClick={onClose} />
      <form className="eo-modal__card" onSubmit={handleSubmit}>
        <h3 id="eo-edit-title" className="eo-modal__title">{isNew ? 'Add Lead' : 'Edit Lead'}</h3>
        <label className="eo-field">
          <span className="eo-field__label">Company</span>
          <input className="eo-field__input" value={form.company} onChange={(e) => setField('company', e.target.value)} required />
        </label>
        <label className="eo-field">
          <span className="eo-field__label">Website</span>
          <input className="eo-field__input" value={form.website} onChange={(e) => setField('website', e.target.value)} required />
        </label>
        <label className="eo-field">
          <span className="eo-field__label">Contact Email</span>
          <input type="email" className="eo-field__input" value={form.contact_email} onChange={(e) => setField('contact_email', e.target.value)} required />
        </label>
        <label className="eo-field">
          <span className="eo-field__label">Contact Name</span>
          <input className="eo-field__input" value={form.contact_name} onChange={(e) => setField('contact_name', e.target.value)} />
        </label>
        <label className="eo-field">
          <span className="eo-field__label">Status</span>
          <select className="eo-field__input" value={form.status} onChange={(e) => setField('status', e.target.value)}>
            {STATUS_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </label>
        <footer className="eo-modal__actions">
          <button type="submit" className="eo-btn eo-btn--primary" disabled={saving}>{saving ? 'Saving…' : 'Save Lead'}</button>
          <button type="button" className="eo-btn eo-btn--ghost" onClick={onClose}>Cancel</button>
        </footer>
      </form>
    </div>
  );
}
