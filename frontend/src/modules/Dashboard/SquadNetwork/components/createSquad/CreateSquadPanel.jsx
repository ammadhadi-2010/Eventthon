import React, { useCallback, useEffect, useState } from 'react';
import { ArrowLeft, X } from 'lucide-react';
import CreateSquadInfoSection from './CreateSquadInfoSection';
import CreateSquadPrivacySection from './CreateSquadPrivacySection';
import CreateSquadPermissionsSection from './CreateSquadPermissionsSection';
import CreateSquadInviteSection from './CreateSquadInviteSection';
import { fetchInviteTargets, submitCreateSquad, submitUpdateSquadInfo } from './createSquadApi';
import { INITIAL_CREATE_SQUAD_FORM, validateCreateSquadForm } from './createSquadUtils';
import '../../styles/create-squad.css';
import '../../styles/create-squad-mobile.css';

export default function CreateSquadPanel({ userData, onClose, onCreated, editingSquad = null }) {
  const isEdit = Boolean(editingSquad?._id);
  const [form, setForm] = useState(INITIAL_CREATE_SQUAD_FORM);
  const [errors, setErrors] = useState({});
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [status, setStatus] = useState('');

  useEffect(() => {
    fetchInviteTargets()
      .then(setUsers)
      .catch(() => setUsers([]));
  }, []);

  useEffect(() => {
    if (!editingSquad) return;
    setForm({
      ...INITIAL_CREATE_SQUAD_FORM,
      name: editingSquad.squad_name || '',
      category: editingSquad.niche || '',
      description: editingSquad.description || '',
      privacy: editingSquad.settings?.publicListing === false ? 'private' : 'public',
      bannerPreview: editingSquad.banner || '',
    });
  }, [editingSquad?._id]);

  const setField = useCallback((key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => ({ ...prev, [key]: undefined }));
  }, []);

  const toggleField = useCallback((key) => {
    setForm((prev) => ({ ...prev, [key]: !prev[key] }));
  }, []);

  const toggleUser = useCallback((id) => {
    setForm((prev) => ({
      ...prev,
      invitedUserIds: prev.invitedUserIds.includes(id)
        ? prev.invitedUserIds.filter((x) => x !== id)
        : [...prev.invitedUserIds, id],
    }));
  }, []);

  const handleSubmit = async (draft = false) => {
    const nextErrors = validateCreateSquadForm(form, { draft });
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) return;

    setSubmitting(true);
    setStatus('');
    try {
      const result = isEdit
        ? await submitUpdateSquadInfo(editingSquad._id, form)
        : await submitCreateSquad(form, { userData, users, draft });
      if (result?.status === 'error') {
        setStatus(result.message || (isEdit ? 'Could not update squad.' : 'Could not create squad.'));
        return;
      }
      const squad = result?.data;
      onCreated?.(squad, draft, isEdit);
      if (!draft) onClose?.();
    } catch (err) {
      setStatus('Failed to create squad. Please try again.');
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="squad-hub__create-wrap">
      <div className="cs-panel">
        <header className="cs-panel__header">
          <div className="cs-panel__header-main">
            <button type="button" className="cs-panel__back" onClick={onClose} aria-label="Go back">
              <ArrowLeft size={18} strokeWidth={2} />
            </button>
            <div>
              <h2>{isEdit ? 'Edit Squad' : 'Create New Squad'}</h2>
              <p>{isEdit ? 'Update squad details shown on your public showroom.' : 'Build your squad and invite members to collaborate.'}</p>
            </div>
          </div>
          <button type="button" className="cs-panel__close" onClick={onClose} aria-label="Close">
            <X size={20} />
          </button>
        </header>

        <div className="cs-panel__grid">
          <CreateSquadInfoSection form={form} errors={errors} onChange={setField} />
          <CreateSquadPrivacySection form={form} onChange={setField} />
          <CreateSquadPermissionsSection form={form} onChange={setField} onToggle={toggleField} />
          <CreateSquadInviteSection
            users={users}
            form={form}
            search={search}
            onSearch={setSearch}
            onToggleUser={toggleUser}
          />
        </div>

        {status ? <p className="cs-panel__status">{status}</p> : null}

        <footer className="cs-panel__footer">
          <button type="button" className="cs-btn cs-btn--ghost" onClick={onClose}>
            Cancel
          </button>
          <div className="cs-panel__footer-actions">
            {!isEdit ? (
              <button
                type="button"
                className="cs-btn cs-btn--outline"
                disabled={submitting}
                onClick={() => handleSubmit(true)}
              >
                Save as Draft
              </button>
            ) : null}
            <button
              type="button"
              className="cs-btn cs-btn--primary"
              disabled={submitting}
              onClick={() => handleSubmit(false)}
            >
              {submitting ? 'Saving...' : isEdit ? 'Save Changes' : 'Create Squad'}
            </button>
          </div>
        </footer>
      </div>
    </div>
  );
}
