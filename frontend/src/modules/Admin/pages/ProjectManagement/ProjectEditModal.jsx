import React, { useState } from 'react';

export default function ProjectEditModal({ project, onClose, onSave }) {
  const [name, setName] = useState(project?.name || '');
  const [category, setCategory] = useState(project?.category || '');
  const [description, setDescription] = useState(project?.description || '');
  const [saving, setSaving] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await onSave?.({ name, category, description });
      onClose?.();
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="pm-modal-root">
      <button type="button" className="pm-modal-backdrop" aria-label="Close" onClick={onClose} />
      <form className="pm-modal" onSubmit={submit}>
        <h3>Edit Project Details</h3>
        <label>
          Project name
          <input value={name} onChange={(e) => setName(e.target.value)} required />
        </label>
        <label>
          Category
          <input value={category} onChange={(e) => setCategory(e.target.value)} required />
        </label>
        <label>
          Description
          <textarea rows={4} value={description} onChange={(e) => setDescription(e.target.value)} />
        </label>
        <div className="pm-modal-actions">
          <button type="button" className="admin-chip px-3 py-2 text-xs" onClick={onClose}>
            Cancel
          </button>
          <button type="submit" className="rounded-lg bg-violet-600 px-4 py-2 text-xs font-bold text-white" disabled={saving}>
            {saving ? 'Saving…' : 'Save Changes'}
          </button>
        </div>
      </form>
    </div>
  );
}
