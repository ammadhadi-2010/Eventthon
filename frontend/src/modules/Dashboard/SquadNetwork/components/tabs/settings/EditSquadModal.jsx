import React from 'react';
import { styles } from './styles';

const EditSquadModal = ({ isOpen, form, setForm, onCancel, onSave }) => {
  if (!isOpen) return null;

  return (
    <div style={styles.modalOverlay}>
      <div style={styles.modalCard}>
        <h4 style={styles.modalTitle}>Edit Squad Information</h4>
        <label style={styles.fieldLabel}>
          Squad Name
          <input
            style={styles.fieldInput}
            value={form.squad_name}
            onChange={(e) => setForm((prev) => ({ ...prev, squad_name: e.target.value }))}
          />
        </label>
        <label style={styles.fieldLabel}>
          Squad Niche
          <input
            style={styles.fieldInput}
            value={form.niche}
            onChange={(e) => setForm((prev) => ({ ...prev, niche: e.target.value }))}
          />
        </label>
        <label style={styles.fieldLabel}>
          Description
          <textarea
            style={styles.fieldTextArea}
            value={form.description}
            onChange={(e) => setForm((prev) => ({ ...prev, description: e.target.value }))}
          />
        </label>
        <div style={styles.modalActions}>
          <button type="button" style={styles.ghostBtn} onClick={onCancel}>
            Cancel
          </button>
          <button type="button" style={styles.primaryBtn} onClick={onSave}>
            Save
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditSquadModal;
