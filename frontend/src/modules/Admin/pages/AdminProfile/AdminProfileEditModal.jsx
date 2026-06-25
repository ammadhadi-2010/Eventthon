import React, { useEffect, useState } from 'react';
import PasswordInput from '../../../../components/PasswordInput';
import { buildAdminProfileForm } from './adminProfileForm';
import './admin-profile-edit.css';

export default function AdminProfileEditModal({
  open,
  profile,
  saving,
  errorText,
  onClose,
  onSubmit,
}) {
  const [form, setForm] = useState(buildAdminProfileForm(profile));
  const [avatarFile, setAvatarFile] = useState(null);

  useEffect(() => {
    if (open) {
      setForm(buildAdminProfileForm(profile));
      setAvatarFile(null);
    }
  }, [open, profile]);

  if (!open) return null;

  const setField = (key) => (event) => {
    const value = key === 'avatar' ? event.target.files?.[0] || null : event.target.value;
    if (key === 'avatar') {
      setAvatarFile(value);
      return;
    }
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    onSubmit(form, avatarFile);
  };

  return (
    <div className="ap-edit-overlay" role="presentation" onClick={onClose}>
      <form
        className="ap-edit-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="ap-edit-title"
        onClick={(event) => event.stopPropagation()}
        onSubmit={handleSubmit}
      >
        <header className="ap-edit-modal__head">
          <h2 id="ap-edit-title">Edit Admin Profile</h2>
          <button type="button" onClick={onClose} aria-label="Close edit profile modal">
            ×
          </button>
        </header>

        <label className="ap-edit-field">
          <span>Full Name</span>
          <input type="text" value={form.full_name} onChange={setField('full_name')} required />
        </label>

        <label className="ap-edit-field">
          <span>Email Address</span>
          <input type="email" value={form.email} onChange={setField('email')} required />
        </label>

        <label className="ap-edit-field">
          <span>Avatar Upload</span>
          <input type="file" accept="image/png,image/jpeg,image/jpg,image/webp,image/gif" onChange={setField('avatar')} />
        </label>

        <label className="ap-edit-field">
          <span>Avatar Link (imageurl)</span>
          <input
            type="text"
            value={form.imageurl_link}
            onChange={setField('imageurl_link')}
            placeholder="/static/uploads/admin-profiles/avatar.png"
          />
        </label>

        <label className="ap-edit-field">
          <span>New Password (optional)</span>
          <PasswordInput value={form.password} onChange={setField('password')} autoComplete="new-password" />
        </label>

        <label className="ap-edit-field">
          <span>Confirm Password</span>
          <PasswordInput
            value={form.confirm_password}
            onChange={setField('confirm_password')}
            autoComplete="new-password"
          />
        </label>

        {errorText ? <p className="ap-edit-error">{errorText}</p> : null}

        <button type="submit" className="ap-edit-submit" disabled={saving}>
          {saving ? 'Saving Changes…' : 'Save Changes'}
        </button>
      </form>
    </div>
  );
}
