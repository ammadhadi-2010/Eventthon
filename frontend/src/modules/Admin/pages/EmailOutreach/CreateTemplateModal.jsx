import React, { useState } from 'react';

const EMPTY_FORM = {
  title: '',
  description: '',
  subject: '',
  body: '',
};

export default function CreateTemplateModal({ open, onClose, onSave, saving = false }) {
  const [form, setForm] = useState(EMPTY_FORM);

  if (!open) return null;

  const update = (key) => (event) => {
    setForm((prev) => ({ ...prev, [key]: event.target.value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const payload = {
      title: form.title.trim(),
      description: form.description.trim(),
      subject: form.subject.trim(),
      body: form.body.trim(),
    };
    if (!payload.title || !payload.subject || !payload.body) return;
    await onSave?.(payload);
    setForm(EMPTY_FORM);
  };

  return (
    <div className="eo-modal" role="dialog" aria-modal="true" aria-labelledby="eo-create-template-title">
      <button type="button" className="eo-modal__backdrop" aria-label="Close" onClick={onClose} />
      <form className="eo-modal__card eo-create-template__card" onSubmit={handleSubmit}>
        <h3 id="eo-create-template-title" className="eo-modal__title">Create New Template</h3>
        <p className="eo-create-template__hint">Save a reusable outreach template to your backend library.</p>
        <label className="eo-field">
          <span className="eo-field__label">Template Title</span>
          <input className="eo-field__input" value={form.title} onChange={update('title')} required />
        </label>
        <label className="eo-field">
          <span className="eo-field__label">Short Description</span>
          <input className="eo-field__input" value={form.description} onChange={update('description')} />
        </label>
        <label className="eo-field">
          <span className="eo-field__label">Default Subject</span>
          <input className="eo-field__input" value={form.subject} onChange={update('subject')} required />
        </label>
        <label className="eo-field">
          <span className="eo-field__label">Email Body Text</span>
          <textarea
            className="eo-field__input eo-create-template__textarea"
            value={form.body}
            onChange={update('body')}
            rows={8}
            required
          />
        </label>
        <footer className="eo-modal__actions">
          <button type="submit" className="eo-btn eo-btn--purple" disabled={saving}>
            {saving ? 'Saving…' : 'Save Template'}
          </button>
          <button type="button" className="eo-btn eo-btn--ghost" onClick={onClose}>Cancel</button>
        </footer>
      </form>
    </div>
  );
}
