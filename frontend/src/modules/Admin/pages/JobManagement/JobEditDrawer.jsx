import React, { useEffect, useState } from 'react';
import { FiX } from 'react-icons/fi';

const EMPTY = {
  title: '',
  company_name: '',
  category: '',
  location: '',
  salary_range: '',
  description: '',
  employment_type: '',
  experience_level: '',
  work_mode: '',
  status: 'pending',
};

export default function JobEditDrawer({ job, open, onClose, onSave, saving }) {
  const [form, setForm] = useState(EMPTY);

  useEffect(() => {
    if (!open || !job) return;
    setForm({
      title: job.title || '',
      company_name: job.company || '',
      category: job.category || '',
      location: job.location || '',
      salary_range: job.salary || '',
      description: job.description || '',
      employment_type: job.employmentType || '',
      experience_level: job.experienceLevel || '',
      work_mode: job.workMode || '',
      status: job.status || 'pending',
    });
  }, [open, job]);

  if (!open || !job) return null;

  const set = (key) => (e) => setForm((prev) => ({ ...prev, [key]: e.target.value }));

  return (
    <div className="jm-drawer-overlay" role="dialog" aria-modal="true" aria-label="Edit job">
      <button type="button" className="jm-modal-overlay__backdrop" onClick={onClose} aria-label="Close" />
      <aside className="jm-drawer gigs-card">
        <header className="jm-modal__head">
          <div>
            <h2>Edit job</h2>
            <p>{job.title}</p>
          </div>
          <button type="button" className="jm-modal__close" onClick={onClose} aria-label="Close">
            <FiX size={18} />
          </button>
        </header>
        <form
          className="jm-edit-form"
          onSubmit={(e) => {
            e.preventDefault();
            onSave?.(job.id, form);
          }}
        >
          <label className="jm-field">
            <span>Job title</span>
            <input className="jm-input" value={form.title} onChange={set('title')} required />
          </label>
          <label className="jm-field">
            <span>Company</span>
            <input className="jm-input" value={form.company_name} onChange={set('company_name')} />
          </label>
          <label className="jm-field">
            <span>Category</span>
            <input className="jm-input" value={form.category} onChange={set('category')} />
          </label>
          <label className="jm-field">
            <span>Location</span>
            <input className="jm-input" value={form.location} onChange={set('location')} />
          </label>
          <label className="jm-field">
            <span>Salary range</span>
            <input className="jm-input" value={form.salary_range} onChange={set('salary_range')} />
          </label>
          <label className="jm-field">
            <span>Employment type</span>
            <input className="jm-input" value={form.employment_type} onChange={set('employment_type')} />
          </label>
          <label className="jm-field">
            <span>Experience level</span>
            <input className="jm-input" value={form.experience_level} onChange={set('experience_level')} />
          </label>
          <label className="jm-field">
            <span>Work mode</span>
            <input className="jm-input" value={form.work_mode} onChange={set('work_mode')} />
          </label>
          <label className="jm-field">
            <span>Status</span>
            <select className="jm-select jm-select--full" value={form.status} onChange={set('status')}>
              <option value="active">Active</option>
              <option value="pending">Pending</option>
              <option value="expired">Expired</option>
            </select>
          </label>
          <label className="jm-field">
            <span>Description</span>
            <textarea className="jm-input jm-textarea" rows={5} value={form.description} onChange={set('description')} />
          </label>
          <footer className="jm-modal__foot">
            <button type="button" className="um-btn um-btn--ghost" onClick={onClose} disabled={saving}>
              Cancel
            </button>
            <button type="submit" className="um-btn um-btn--primary" disabled={saving}>
              {saving ? 'Saving…' : 'Save changes'}
            </button>
          </footer>
        </form>
      </aside>
    </div>
  );
}
