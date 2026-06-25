import React, { useState } from 'react';

const EMPTY = { name: '', industry: '', website: '', size: '', location: '', imageurl: '' };

export default function CompanyAddForm({ onSubmit, saving, sectionRef, firstInputRef }) {
  const [form, setForm] = useState(EMPTY);
  const [error, setError] = useState('');
  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!form.name.trim()) {
      setError('Company name is required.');
      return;
    }
    try {
      await onSubmit({
        name: form.name.trim(),
        industry: form.industry.trim(),
        website: form.website.trim(),
        size: form.size.trim(),
        location: form.location.trim(),
        imageurl: form.imageurl.trim(),
        status: 'pending',
      });
      setForm(EMPTY);
    } catch (err) {
      setError(err?.response?.data?.detail || 'Could not add company.');
    }
  };

  return (
    <section ref={sectionRef} id="add-company" className="um-card cm-widget-card">
      <h2 className="cm-widget-title">Add New Company</h2>
      <form className="cm-add-form" onSubmit={handleSubmit}>
        {error ? <p className="cm-form-error">{error}</p> : null}
        <label className="cm-field">
          <span>Company Name</span>
          <input ref={firstInputRef} className="cm-input" value={form.name} onChange={set('name')} required />
        </label>
        <label className="cm-field">
          <span>Industry</span>
          <input className="cm-input" value={form.industry} onChange={set('industry')} placeholder="Technology" />
        </label>
        <label className="cm-field">
          <span>Website</span>
          <input className="cm-input" value={form.website} onChange={set('website')} placeholder="https://example.com" />
        </label>
        <label className="cm-field">
          <span>Company Size</span>
          <input className="cm-input" value={form.size} onChange={set('size')} placeholder="51-200" />
        </label>
        <label className="cm-field">
          <span>Location</span>
          <input className="cm-input" value={form.location} onChange={set('location')} placeholder="City, Country" />
        </label>
        <label className="cm-field">
          <span>Logo URL (imageurl)</span>
          <input className="cm-input" value={form.imageurl} onChange={set('imageurl')} placeholder="/static/..." />
        </label>
        <button type="submit" className="um-btn um-btn--primary cm-add-btn" disabled={saving}>
          {saving ? 'Adding…' : 'Add Company'}
        </button>
      </form>
    </section>
  );
}
