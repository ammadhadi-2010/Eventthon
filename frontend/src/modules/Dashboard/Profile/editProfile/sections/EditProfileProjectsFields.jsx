import React, { useRef, useState } from 'react';
import {
  FiArrowLeft,
  FiArrowRight,
  FiCheck,
  FiEdit2,
  FiExternalLink,
  FiPlus,
  FiTrash2,
} from 'react-icons/fi';
import { API_BASE_URL } from '../../../../../api/axiosConfig';
import { updateProfileData, uploadProjectImage } from '../../services/profileService';
import '../editProfileLayout.css';

function resolveMediaUrl(val) {
  if (!val || typeof val !== 'string') return '';
  const v = val.trim();
  if (!v) return '';
  if (v.startsWith('http://') || v.startsWith('https://') || v.startsWith('blob:')) return v;
  const path = v.startsWith('/') ? v : `/${v}`;
  return `${API_BASE_URL}${path}`;
}

function newProjectId() {
  return `proj-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

function blankProject() {
  return {
    id: newProjectId(),
    title: '',
    desc: '',
    imageUrl: '',
    tech: [],
    featured: false,
    linkUrl: '',
    completedDate: '',
    keyResults: [],
  };
}

/** @param {(patch: object) => void} patchProj */
function ProjectCard({ proj, patchProj, onRemove, uploading, onPickFile }) {
  const fileRef = useRef(null);
  const titleRef = useRef(null);
  const [techInput, setTechInput] = useState('');
  const [resultInput, setResultInput] = useState('');

  const imgSrc = resolveMediaUrl(proj.imageUrl);

  const addTech = () => {
    const t = techInput.trim();
    if (!t) return;
    if (proj.tech.some((x) => x.toLowerCase() === t.toLowerCase())) return;
    patchProj({ tech: [...proj.tech, t] });
    setTechInput('');
  };

  const addResult = () => {
    const t = resultInput.trim();
    if (!t) return;
    patchProj({ keyResults: [...proj.keyResults, t] });
    setResultInput('');
  };

  return (
    <div className="ep-proj-card ep-root">
      <div className="ep-proj-card-grid">
        <div className="ep-proj-thumb-col">
          <button
            type="button"
            className="ep-proj-thumb"
            onClick={() => fileRef.current?.click()}
            aria-label="Change project image"
          >
            {imgSrc ? <img src={imgSrc} alt="" className="ep-proj-thumb-img" /> : <span className="ep-proj-thumb-ph">Image</span>}
          </button>
          <input ref={fileRef} type="file" accept="image/*" className="ep-proj-file" onChange={onPickFile} />
          {uploading ? <p className="ep-proj-uploading">Uploading…</p> : null}
        </div>

        <div className="ep-proj-main">
          <div className="ep-proj-title-row">
            <input
              ref={titleRef}
              className="ep-input ep-input--solid ep-proj-title-input"
              placeholder="Project title"
              value={proj.title}
              onChange={(e) => patchProj({ title: e.target.value })}
            />
            {proj.featured ? <span className="ep-proj-featured-badge">Featured</span> : null}
          </div>
          <label className="ep-proj-featured-toggle">
            <input
              type="checkbox"
              checked={Boolean(proj.featured)}
              onChange={(e) => patchProj({ featured: e.target.checked })}
            />
            <span>Mark as featured</span>
          </label>
          <textarea
            className="ep-input ep-proj-desc resize-y mt-2 min-h-[4rem]"
            placeholder="Short description of the project…"
            value={proj.desc}
            onChange={(e) => patchProj({ desc: e.target.value })}
          />
          <p className="ep-field-label mt-2">Tech stack</p>
          <div className="ep-proj-tech-row">
            {(proj.tech || []).map((t) => (
              <span key={t} className="ep-chip ep-chip--interactive">
                {t}
                <button
                  type="button"
                  className="ep-chip-remove"
                  onClick={() => patchProj({ tech: proj.tech.filter((x) => x !== t) })}
                  aria-label={`Remove ${t}`}
                >
                  ×
                </button>
              </span>
            ))}
            <input
              className="ep-proj-tech-add"
              placeholder="+ Add (Enter)"
              value={techInput}
              onChange={(e) => setTechInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  addTech();
                }
              }}
            />
          </div>
          <label className="ep-field-label mt-2">Live link</label>
          <div className="ep-proj-link-wrap">
            <input
              type="url"
              className="ep-input ep-input--solid ep-proj-link-input"
              placeholder="https://…"
              value={proj.linkUrl}
              onChange={(e) => patchProj({ linkUrl: e.target.value })}
            />
            <a
              href={proj.linkUrl?.match(/^https?:\/\//i) ? proj.linkUrl : proj.linkUrl ? `https://${proj.linkUrl}` : '#'}
              target="_blank"
              rel="noopener noreferrer"
              className="ep-proj-link-ext"
              aria-label="Open link"
              onClick={(e) => {
                if (!proj.linkUrl?.trim()) e.preventDefault();
              }}
            >
              <FiExternalLink />
            </a>
          </div>
        </div>

        <div className="ep-proj-side">
          <input
            className="ep-input ep-input--solid ep-proj-date-input"
            placeholder="e.g. Dec 2024"
            value={proj.completedDate}
            onChange={(e) => patchProj({ completedDate: e.target.value })}
          />
          <p className="ep-proj-side-title">Key results</p>
          <ul className="ep-proj-results-list">
            {(proj.keyResults || []).map((line, idx) => (
              <li key={`${proj.id}-${idx}-${line.slice(0, 20)}`} className="ep-proj-result-line">
                <FiCheck className="ep-proj-result-check" aria-hidden />
                <span className="ep-proj-result-text">{line}</span>
                <button
                  type="button"
                  className="ep-proj-result-remove"
                  onClick={() =>
                    patchProj({
                      keyResults: proj.keyResults.filter((_, j) => j !== idx),
                    })
                  }
                  aria-label="Remove line"
                >
                  ×
                </button>
              </li>
            ))}
          </ul>
          <input
            type="text"
            className="ep-input ep-input--solid ep-proj-result-add"
            placeholder="+ Add achievement, Enter"
            value={resultInput}
            onChange={(e) => setResultInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                addResult();
              }
            }}
          />
          <div className="ep-proj-actions">
            <button
              type="button"
              className="ep-proj-act-btn ep-proj-act-btn--purple"
              title="Focus title"
              onClick={() => titleRef.current?.focus()}
            >
              <FiEdit2 />
            </button>
            <button type="button" className="ep-proj-act-btn ep-proj-act-btn--danger" title="Remove project" onClick={onRemove}>
              <FiTrash2 />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

const EditProfileProjectsFields = ({ draft, setDraft, userIdentifier, refreshData, onBack, onContinue }) => {
  const list = Array.isArray(draft.projects) ? draft.projects : [];
  const [saving, setSaving] = useState(false);
  const [uploadingById, setUploadingById] = useState({});

  const patches = {
    upsert: (id, patch) =>
      setDraft((d) => ({
        ...d,
        projects: (Array.isArray(d.projects) ? d.projects : []).map((p) =>
          p.id === id ? { ...p, ...patch } : p
        ),
      })),
    remove: (id) =>
      setDraft((d) => ({
        ...d,
        projects: (Array.isArray(d.projects) ? d.projects : []).filter((p) => p.id !== id),
      })),
    add: () =>
      setDraft((d) => ({
        ...d,
        projects: [...(Array.isArray(d.projects) ? d.projects : []), blankProject()],
      })),
  };

  const serializeProjects = (arr) =>
    arr.map((p) => ({
      id: String(p.id),
      title: p.title ?? '',
      desc: p.desc ?? '',
      image: String(p.imageUrl || '').trim(),
      tech: Array.isArray(p.tech) ? p.tech : [],
      featured: Boolean(p.featured),
      link: String(p.linkUrl || '').trim(),
      completed_date: String(p.completedDate || '').trim(),
      key_results: Array.isArray(p.keyResults) ? p.keyResults : [],
    }));

  const onPickImage = async (projectId, e) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file || !file.type.startsWith('image/') || !userIdentifier) return;
    setUploadingById((x) => ({ ...x, [projectId]: true }));
    try {
      const data = await uploadProjectImage(file, userIdentifier);
      const url = data?.url ?? data?.path;
      if (url) patches.upsert(projectId, { imageUrl: typeof url === 'string' ? url : '' });
    } catch (err) {
      console.error(err);
      window.alert(err?.response?.data?.detail || err?.message || 'Image upload failed');
    } finally {
      setUploadingById((x) => {
        const n = { ...x };
        delete n[projectId];
        return n;
      });
    }
  };

  const saveAndContinue = async () => {
    if (!userIdentifier) {
      window.alert('You must be logged in to save your profile.');
      return;
    }
    setSaving(true);
    try {
      await updateProfileData(userIdentifier, {
        projects: serializeProjects(list),
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
    <div className="ep-proj-form ep-root space-y-4">
      <div className="flex flex-wrap justify-end gap-2">
        <button type="button" className="ep-exp-add-inline" onClick={patches.add}>
          <FiPlus className="h-4 w-4" aria-hidden />
          Add Project
        </button>
      </div>

      {list.length === 0 ? (
        <p className="text-[13px] text-slate-500">
          No projects yet. Use <span className="text-violet-300">Add Project</span> or the dashed area below.
        </p>
      ) : null}

      <div className="space-y-4">
        {list.map((proj) => (
          <ProjectCard
            key={proj.id}
            proj={proj}
            patchProj={(patch) => patches.upsert(proj.id, patch)}
            onRemove={() => patches.remove(proj.id)}
            uploading={!!uploadingById[proj.id]}
            onPickFile={(e) => onPickImage(proj.id, e)}
          />
        ))}
      </div>

      <button type="button" className="ep-exp-add-wide" onClick={patches.add}>
        + Add Another Project
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

export default EditProfileProjectsFields;
