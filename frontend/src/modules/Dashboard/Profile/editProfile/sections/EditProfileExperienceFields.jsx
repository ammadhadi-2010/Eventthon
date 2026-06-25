import React, { useMemo, useState } from 'react';
import {
  FiArrowLeft,
  FiArrowRight,
  FiCalendar,
  FiChevronDown,
  FiChevronUp,
  FiMoreVertical,
  FiPlus,
} from 'react-icons/fi';
import { API_BASE_URL } from '../../../../../api/axiosConfig';
import { updateProfileData } from '../../services/profileService';
import '../editProfileLayout.css';

function resolveMediaUrl(val) {
  if (!val || typeof val !== 'string') return '';
  const v = val.trim();
  if (!v) return '';
  if (v.startsWith('http://') || v.startsWith('https://') || v.startsWith('blob:')) return v;
  const path = v.startsWith('/') ? v : `/${v}`;
  return `${API_BASE_URL}${path}`;
}

function newExperienceId() {
  return `exp-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

function blankExperience() {
  return {
    id: newExperienceId(),
    role: '',
    company: '',
    period: '',
    desc: '',
    tags: [],
    logoUrl: '',
    durationLabel: '',
    current: false,
  };
}

/** @param {(patch: Partial<typeof exp>) => void} patchExp */
function ExperienceCard({
  exp,
  index,
  total,
  patchExp,
  onRemove,
  onMoveUp,
  onMoveDown,
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [achInput, setAchInput] = useState('');

  const logoResolved = resolveMediaUrl(exp.logoUrl);
  const initial = (exp.company?.trim()?.[0] || exp.role?.trim()?.[0] || '?').toUpperCase();

  const toggleCurrent = () => {
    let period = exp.period || '';
    const next = !exp.current;
    if (next && !/\bpresent\b/i.test(period)) {
      period = period.trim() ? `${period.trim()} — Present` : '';
    }
    patchExp({ current: next, period });
  };

  const removeTag = (tag) => {
    patchExp({ tags: exp.tags.filter((t) => t !== tag) });
  };

  const addAchievement = () => {
    const t = achInput.trim();
    if (!t) return;
    if (exp.tags.some((x) => x.toLowerCase() === t.toLowerCase())) return;
    patchExp({ tags: [...exp.tags, t] });
    setAchInput('');
  };

  return (
    <div className="ep-exp-card ep-root">
      <div className="ep-exp-card-top">
        <div className="ep-exp-logo">
          {logoResolved ? <img src={logoResolved} alt="" className="ep-exp-logo-img" /> : <span>{initial}</span>}
        </div>
        <div className="ep-exp-head-fields">
          <input
            className="ep-input ep-input--solid ep-exp-title"
            placeholder="Job title · e.g. Senior Frontend Developer"
            value={exp.role}
            onChange={(e) => patchExp({ role: e.target.value })}
          />
          <input
            className="ep-input ep-input--solid ep-exp-sub"
            placeholder="Company · e.g. Google"
            value={exp.company}
            onChange={(e) => patchExp({ company: e.target.value })}
          />
          <label className="ep-exp-logo-url-label">
            <span>Logo URL (optional)</span>
            <input
              className="ep-input ep-input--solid mt-1"
              placeholder="https://… or /static/…"
              value={exp.logoUrl}
              onChange={(e) => patchExp({ logoUrl: e.target.value })}
            />
          </label>
        </div>
        <div className="ep-exp-card-controls">
          <div className="ep-exp-menu-wrap">
            <button type="button" className="ep-exp-icon-btn" aria-label="More" onClick={() => setMenuOpen((x) => !x)}>
              <FiMoreVertical />
            </button>
            {menuOpen ? (
              <div className="ep-exp-menu-dropdown" role="menu">
                <button
                  type="button"
                  className="ep-exp-menu-item ep-exp-menu-item--danger"
                  onClick={() => {
                    setMenuOpen(false);
                    onRemove();
                  }}
                >
                  Delete
                </button>
              </div>
            ) : null}
          </div>
          <div className="ep-exp-reorder">
            <button
              type="button"
              className="ep-exp-icon-btn"
              disabled={index === 0}
              aria-label="Move up"
              onClick={onMoveUp}
            >
              <FiChevronUp />
            </button>
            <button
              type="button"
              className="ep-exp-icon-btn"
              disabled={index >= total - 1}
              aria-label="Move down"
              onClick={onMoveDown}
            >
              <FiChevronDown />
            </button>
          </div>
        </div>
      </div>

      <div className="ep-exp-meta-row">
        <span className="ep-exp-date-badge">
          <FiCalendar className="ep-exp-cal" aria-hidden />
          <input
            className="ep-exp-period-input"
            placeholder="Jan 2022 — Present"
            value={exp.period}
            onChange={(e) => patchExp({ period: e.target.value })}
          />
        </span>
        <label className="ep-exp-check">
          <input type="checkbox" checked={Boolean(exp.current)} onChange={toggleCurrent} />
          <span>Currently working here</span>
        </label>
        {!exp.current ? (
          <input
            className="ep-input ep-input--solid ep-exp-duration-input"
            placeholder="Duration · e.g. 2 yrs 6 mos"
            value={exp.durationLabel}
            onChange={(e) => patchExp({ durationLabel: e.target.value })}
          />
        ) : null}
      </div>

      <label className="ep-field-label ep-exp-desc-label">Description</label>
      <textarea
        className="ep-input ep-exp-textarea resize-y min-h-[5rem]"
        placeholder="Briefly describe your role and responsibilities…"
        value={exp.desc}
        onChange={(e) => patchExp({ desc: e.target.value })}
      />

      <p className="ep-field-label">Achievements</p>
      <div className="ep-exp-ach-tags">
        {exp.tags.map((t) => (
          <span key={t} className="ep-chip ep-chip--interactive">
            {t}
            <button type="button" className="ep-chip-remove" onClick={() => removeTag(t)} aria-label={`Remove ${t}`}>
              ×
            </button>
          </span>
        ))}
        <input
          type="text"
          className="ep-exp-ach-input"
          placeholder="+ Add achievement, Enter"
          value={achInput}
          onChange={(e) => setAchInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              addAchievement();
            }
          }}
        />
      </div>
    </div>
  );
}

const EditProfileExperienceFields = ({ draft, setDraft, userIdentifier, refreshData, onBack, onContinue }) => {
  const list = Array.isArray(draft.experiences) ? draft.experiences : [];
  const [saving, setSaving] = useState(false);

  const patches = useMemo(
    () => ({
      upsertPatch: (id, patch) =>
        setDraft((d) => ({
          ...d,
          experiences: (Array.isArray(d.experiences) ? d.experiences : []).map((e) =>
            e.id === id ? { ...e, ...patch } : e
          ),
        })),
      removeAt: (id) =>
        setDraft((d) => ({
          ...d,
          experiences: (Array.isArray(d.experiences) ? d.experiences : []).filter((e) => e.id !== id),
        })),
      move: (idx, dir) =>
        setDraft((d) => {
          const arr = [...(Array.isArray(d.experiences) ? d.experiences : [])];
          const j = idx + dir;
          if (j < 0 || j >= arr.length) return d;
          [arr[idx], arr[j]] = [arr[j], arr[idx]];
          return { ...d, experiences: arr };
        }),
      add: () =>
        setDraft((d) => ({
          ...d,
          experiences: [...(Array.isArray(d.experiences) ? d.experiences : []), blankExperience()],
        })),
    }),
    [setDraft]
  );

  const payloadExperiences = (arr) =>
    arr.map((e) => {
      const row = {
        id: String(e.id),
        role: e.role ?? '',
        company: e.company ?? '',
        period: e.period ?? '',
        desc: e.desc ?? '',
        tags: Array.isArray(e.tags) ? e.tags : [],
        current: Boolean(e.current),
      };
      const lu = String(e.logoUrl || '').trim();
      if (lu) row.logo_url = lu;
      const dl = String(e.durationLabel || '').trim();
      if (dl) row.duration_label = dl;
      return row;
    });

  const saveAndContinue = async () => {
    if (!userIdentifier) {
      window.alert('You must be logged in to save your profile.');
      return;
    }
    setSaving(true);
    try {
      await updateProfileData(userIdentifier, {
        experiences: payloadExperiences(list),
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
    <div className="ep-exp-form ep-root space-y-4">
      <div className="flex flex-wrap justify-end gap-2">
        <button type="button" className="ep-exp-add-inline" onClick={patches.add}>
          <FiPlus className="h-4 w-4" aria-hidden />
          Add Experience
        </button>
      </div>

      {list.length === 0 ? (
        <p className="text-[13px] text-slate-500">
          No experience yet. Tap <span className="text-violet-300">Add Experience</span> or the dashed button below.
        </p>
      ) : null}

      <div className="space-y-4">
        {list.map((exp, index) => (
          <ExperienceCard
            key={exp.id}
            exp={exp}
            index={index}
            total={list.length}
            patchExp={(patch) => patches.upsertPatch(exp.id, patch)}
            onRemove={() => patches.removeAt(exp.id)}
            onMoveUp={() => patches.move(index, -1)}
            onMoveDown={() => patches.move(index, 1)}
          />
        ))}
      </div>

      <button type="button" className="ep-exp-add-wide" onClick={patches.add}>
        + Add Another Experience
      </button>

      <div className="ep-about-footer ep-basic-footer">
        <button type="button" className="ep-btn-back-about" onClick={onBack} disabled={saving}>
          <FiArrowLeft className="h-4 w-4" aria-hidden />
          Back
        </button>
        <button type="button" className="ep-btn-save-continue" onClick={saveAndContinue} disabled={saving}>
          {saving ? 'Saving…' : 'Save & Continue'}
          <FiArrowRight className="h-4 w-4" aria-hidden />
        </button>
      </div>
    </div>
  );
};

export default EditProfileExperienceFields;
