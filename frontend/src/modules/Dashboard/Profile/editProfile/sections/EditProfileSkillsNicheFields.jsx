import React, { useState } from 'react';
import { FiArrowLeft, FiArrowRight } from 'react-icons/fi';
import { updateProfileData } from '../../services/profileService';
import { clampPct } from './editProfileSkillsNicheUtils';
import EditProfileSkillsNicheTopSkills from './EditProfileSkillsNicheTopSkills';
import EditProfileSkillsNicheSelectors from './EditProfileSkillsNicheSelectors';
import '../editProfileLayout.css';

const EditProfileSkillsNicheFields = ({
  draft,
  setDraft,
  userIdentifier,
  refreshData,
  onBack,
  onContinue,
}) => {
  const entries = Array.isArray(draft.skillEntries) ? draft.skillEntries : [];
  const primary = String(draft.primaryNiche ?? draft.niche ?? '').trim();
  const sub = String(draft.subNiche ?? '').trim();
  const interests = draft.careerInterests || {};
  const [saving, setSaving] = useState(false);

  /** Prefer functional updates `fn(prev) => next` so add/remove stays in sync. */
  const patchEntries = (nextOrFn) => {
    setDraft((d) => {
      const prev = Array.isArray(d.skillEntries) ? d.skillEntries : [];
      const list =
        typeof nextOrFn === 'function'
          ? nextOrFn(prev)
          : Array.isArray(nextOrFn)
            ? nextOrFn
            : prev;
      const nextList = Array.isArray(list) ? list : prev;
      return {
        ...d,
        skillEntries: nextList,
        skills: nextList.map((s) => s.name).filter(Boolean),
      };
    });
  };

  const saveAndContinue = async () => {
    if (!userIdentifier) {
      window.alert('You must be logged in to save your profile.');
      return;
    }
    setSaving(true);
    try {
      const topSkills = entries.map((e) => ({
        id: String(e.id),
        name: String(e.name || '').trim(),
        proficiency: clampPct(e.proficiency),
      }));
      const skillNames = topSkills.map((s) => s.name).filter(Boolean);
      await updateProfileData(userIdentifier, {
        top_skills: topSkills.filter((s) => s.name),
        skills: skillNames,
        niche: primary || '',
        skill_subcategories: sub ? [sub] : [],
        career_interests: {
          remote_opportunities: Boolean(interests.remoteOpportunities),
          full_time_jobs: Boolean(interests.fullTimeJobs),
          freelance_projects: Boolean(interests.freelanceProjects),
          internships: Boolean(interests.internships),
        },
      });
      if (typeof refreshData === 'function') await refreshData();
      if (onContinue) onContinue();
    } catch (err) {
      console.error(err);
      const msg =
        err?.response?.data?.detail ||
        (typeof err?.response?.data === 'string' ? err.response.data : null) ||
        err?.message ||
        'Save failed';
      window.alert(Array.isArray(msg) ? msg.map((m) => m.msg || m).join(', ') : String(msg));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="ep-sn-root ep-root space-y-5">
      <div className="ep-sn-grid">
        <EditProfileSkillsNicheTopSkills entries={entries} patchEntries={patchEntries} />
        <div className="ep-sn-divider" aria-hidden />
        <EditProfileSkillsNicheSelectors
          primary={primary}
          sub={sub}
          interests={interests}
          setDraft={setDraft}
        />
      </div>

      <div className="ep-about-footer ep-basic-footer">
        <button type="button" className="ep-btn-back-about" onClick={onBack} disabled={saving}>
          <FiArrowLeft className="h-4 w-4" aria-hidden />
          Previous
        </button>
        <button type="button" className="ep-btn-save-continue" onClick={saveAndContinue} disabled={saving}>
          {saving ? 'Saving…' : 'Save & Continue'}
          <FiArrowRight className="h-4 w-4" aria-hidden />
        </button>
      </div>
    </div>
  );
};

export default EditProfileSkillsNicheFields;
