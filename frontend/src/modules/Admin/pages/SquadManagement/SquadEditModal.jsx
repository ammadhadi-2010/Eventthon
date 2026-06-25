import React, { useState } from 'react';
import { updateAdminSquadInfo } from '../../../../services/adminSquadService';

export default function SquadEditModal({ draft, squadId, onClose, onSave }) {
  const [localDraft, setLocalDraft] = useState(draft);
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      await updateAdminSquadInfo(squadId, {
        squad_name: localDraft.name,
        niche: localDraft.category,
        description: localDraft.description,
      });
    } catch (err) {
      // keep optimistic draft
    } finally {
      setSaving(false);
      onSave(localDraft);
      onClose();
    }
  };

  return (
    <div className="sd-modal-root" role="presentation" onClick={onClose}>
      <div className="sd-modal" onClick={(e) => e.stopPropagation()}>
        <h3>Edit Squad</h3>
        <label>
          Squad Name
          <input
            value={localDraft.name}
            onChange={(e) => setLocalDraft((d) => ({ ...d, name: e.target.value }))}
          />
        </label>
        <label>
          Category
          <input
            value={localDraft.category}
            onChange={(e) => setLocalDraft((d) => ({ ...d, category: e.target.value }))}
          />
        </label>
        <label>
          Description
          <textarea
            rows={4}
            value={localDraft.description}
            onChange={(e) => setLocalDraft((d) => ({ ...d, description: e.target.value }))}
          />
        </label>
        <div className="sd-modal-actions">
          <button type="button" className="um-btn um-btn--ghost" onClick={onClose}>
            Cancel
          </button>
          <button type="button" className="um-btn um-btn--primary" disabled={saving} onClick={handleSave}>
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
}
