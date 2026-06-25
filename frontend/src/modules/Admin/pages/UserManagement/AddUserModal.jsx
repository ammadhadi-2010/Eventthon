import React, { useState } from 'react';
import PasswordInput from '../../../../components/PasswordInput';

const emptyForm = {
  first_name: '',
  last_name: '',
  email: '',
  mobile: '',
  password: '',
  role: 'user',
  status: 'unverified',
};

const ROLE_OPTIONS = [
  { value: 'user', label: 'User' },
  { value: 'employer', label: 'Employer' },
  { value: 'admin', label: 'Admin' },
];

const STATUS_OPTIONS = [
  { value: 'unverified', label: 'Unverified' },
  { value: 'active', label: 'Active / Verified' },
  { value: 'suspended', label: 'Suspended' },
];

export default function AddUserModal({ open, onClose, onSubmit }) {
  const [form, setForm] = useState(emptyForm);
  const [submitting, setSubmitting] = useState(false);
  const [localError, setLocalError] = useState(null);

  if (!open) return null;

  const patch = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLocalError(null);
    if (!form.email?.trim() || !form.mobile?.trim() || !form.first_name?.trim() || !form.password) {
      setLocalError('Please fill required fields.');
      return;
    }
    setSubmitting(true);
    try {
      await onSubmit({
        email: form.email.trim(),
        mobile: form.mobile.trim(),
        first_name: form.first_name.trim(),
        last_name: form.last_name?.trim() || undefined,
        password: form.password,
        role: form.role,
        status: form.status,
      });
      setForm(emptyForm);
      onClose();
    } catch (err) {
      const msg =
        err?.response?.data?.detail ||
        (Array.isArray(err?.response?.data?.detail)
          ? err.response.data.detail.map((x) => x.msg || x).join(', ')
          : err?.message) ||
        'Could not create user';
      setLocalError(typeof msg === 'string' ? msg : JSON.stringify(msg));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="um-modal-root" role="dialog" aria-modal="true" aria-labelledby="um-modal-title">
      <button type="button" className="um-modal-backdrop" aria-label="Close" onClick={onClose} />
      <div className="um-modal">
        <h2 id="um-modal-title" className="um-modal-title">Add New User</h2>
        <p className="um-modal-desc">Creates an account and adds it to the live user directory.</p>
        <form onSubmit={handleSubmit} className="um-modal-form">
          <label className="um-field">
            <span>First name *</span>
            <input value={form.first_name} onChange={(e) => patch('first_name', e.target.value)} required />
          </label>
          <label className="um-field">
            <span>Last name</span>
            <input value={form.last_name} onChange={(e) => patch('last_name', e.target.value)} />
          </label>
          <label className="um-field">
            <span>Email *</span>
            <input type="email" value={form.email} onChange={(e) => patch('email', e.target.value)} required />
          </label>
          <label className="um-field">
            <span>Mobile *</span>
            <input value={form.mobile} onChange={(e) => patch('mobile', e.target.value)} required />
          </label>
          <label className="um-field">
            <span>Role *</span>
            <select value={form.role} onChange={(e) => patch('role', e.target.value)}>
              {ROLE_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
          </label>
          <label className="um-field">
            <span>Status *</span>
            <select value={form.status} onChange={(e) => patch('status', e.target.value)}>
              {STATUS_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
          </label>
          <label className="um-field">
            <span>Password *</span>
            <PasswordInput value={form.password} onChange={(e) => patch('password', e.target.value)} required minLength={6} />
          </label>
          {localError ? <p className="um-modal-error">{localError}</p> : null}
          <div className="um-modal-actions">
            <button type="button" className="um-btn um-btn--ghost" onClick={onClose} disabled={submitting}>Cancel</button>
            <button type="submit" className="um-btn um-btn--primary" disabled={submitting}>
              {submitting ? 'Creating…' : 'Create user'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
