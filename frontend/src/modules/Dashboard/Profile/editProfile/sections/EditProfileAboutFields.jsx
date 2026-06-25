import React, { useLayoutEffect, useMemo, useRef, useState } from 'react';
import {
  FiArrowLeft,
  FiArrowRight,
  FiBold,
  FiChevronDown,
  FiItalic,
  FiList,
  FiUnderline,
  FiBookOpen,
  FiChevronRight,
} from 'react-icons/fi';
import { GLOBAL_SERVICE_CATEGORY_OPTIONS } from '../../../../../data/globalCategories';
import {
  gigsCategoryIcons,
  GigsCategoryIconFallback,
} from '../../../Gigs/utils/gigsBrowseCategoryIcons';
import { updateProfileData } from '../../services/profileService';
import '../editProfileLayout.css';

const BIO_MAX_PLAIN = 1000;

const LANGUAGE_SUGGESTIONS = [
  'English',
  'Urdu',
  'Punjabi',
  'Arabic',
  'Hindi',
  'Spanish',
  'French',
  'German',
  'Chinese',
  'Portuguese',
];

/** Primary categories only — search / dropdown shows icon + name (no subcategories here). */
const MAIN_CATEGORY_ROWS = GLOBAL_SERVICE_CATEGORY_OPTIONS.map((c) => ({
  key: `m:${c.name}`,
  label: c.name,
  iconKey: c.iconKey,
  iconUi: c.iconUi,
}));

/** Plain-text length of HTML bio (used for quota). */
function plainTextFromHtml(html) {
  if (!html || typeof html !== 'string') return '';
  const d = document.createElement('div');
  d.innerHTML = html;
  return String(d.innerText || d.textContent || '')
    .replace(/\u00a0/g, ' ')
    .trim();
}

function prepareEditorForListCommand(root) {
  if (!root) return;
  root.focus();
  try {
    document.execCommand('defaultParagraphSeparator', false, 'p');
  } catch (_) {
    /* noop */
  }
  const sel = window.getSelection();
  let caretInside = false;
  if (sel.rangeCount > 0) {
    const r = sel.getRangeAt(0);
    caretInside = root.contains(r.commonAncestorContainer);
  }
  if (!caretInside) {
    root.innerHTML = '<p>\u200b</p>';
    const p = root.querySelector('p');
    const z = p?.firstChild;
    if (p && z && z.nodeType === Node.TEXT_NODE) {
      const rng = document.createRange();
      rng.setStart(z, 1);
      rng.collapse(true);
      sel.removeAllRanges();
      sel.addRange(rng);
    }
  }
}

function toolbarMouseDown(exec) {
  return (e) => {
    e.preventDefault();
    exec();
  };
}

function BioToolbar({ onBulletList, onNumberedList, onFmt }) {
  return (
    <div className="ep-about-toolbar">
      <button type="button" className="ep-about-toolbar-btn" title="Bold" onMouseDown={toolbarMouseDown(() => onFmt('bold'))}>
        <FiBold aria-hidden />
      </button>
      <button type="button" className="ep-about-toolbar-btn" title="Italic" onMouseDown={toolbarMouseDown(() => onFmt('italic'))}>
        <FiItalic aria-hidden />
      </button>
      <button
        type="button"
        className="ep-about-toolbar-btn"
        title="Underline"
        onMouseDown={toolbarMouseDown(() => onFmt('underline'))}
      >
        <FiUnderline aria-hidden />
      </button>
      <button type="button" className="ep-about-toolbar-btn" title="Bulleted list" onMouseDown={toolbarMouseDown(onBulletList)}>
        <FiList aria-hidden />
      </button>
      <button
        type="button"
        className="ep-about-toolbar-btn"
        title="Numbered list"
        onMouseDown={toolbarMouseDown(onNumberedList)}
      >
        <span className="ep-about-toolbar-num" aria-hidden>
          1.
        </span>
      </button>
    </div>
  );
}

/** Main categories: chips + search — dropdown is icon + category name only. */
function CategorySkillTagField({ values, onAdd, onRemove, maxTags = 48 }) {
  const inputRef = useRef(null);
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const taken = new Set(values.map((v) => v.toLowerCase()));
    const list = MAIN_CATEGORY_ROWS.filter((row) => !taken.has(row.label.toLowerCase()));
    if (!q) return list;
    return list.filter((row) => row.label.toLowerCase().includes(q));
  }, [query, values]);

  const commit = () => {
    const t = query.trim();
    if (!t || values.length >= maxTags) return;
    if (values.some((v) => v.toLowerCase() === t.toLowerCase())) return;
    onAdd(t);
    setQuery('');
    setOpen(false);
    inputRef.current?.focus();
  };

  const onKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      commit();
    } else if (e.key === 'Backspace' && !query && values.length) {
      onRemove(values[values.length - 1]);
    }
  };

  return (
    <div>
      <label className="ep-field-label">What I Do Best</label>
      <div className={`ep-tag-field ${open && filtered.length ? 'ep-tag-field--open' : ''}`}>
        <div className="ep-tag-field-inner">
          {values.map((s) => (
            <span key={s} className="ep-chip ep-chip--interactive">
              {s}
              <button type="button" className="ep-chip-remove" onClick={() => onRemove(s)} aria-label={`Remove ${s}`}>
                ×
              </button>
            </span>
          ))}
          <input
            ref={inputRef}
            type="text"
            className="ep-tag-field-input"
            value={query}
            placeholder={values.length === 0 ? 'Search categories (name + icon)' : '+ Add category'}
            onChange={(e) => {
              setQuery(e.target.value);
              setOpen(true);
            }}
            onKeyDown={onKeyDown}
            onFocus={() => setOpen(true)}
            onBlur={() => setTimeout(() => setOpen(false), 180)}
          />
        </div>
        <FiChevronDown className="ep-tag-field-chevron" aria-hidden />

        {open && filtered.length > 0 ? (
          <div className="ep-tag-dropdown ep-tag-dropdown--full-cat" role="listbox">
            {filtered.map((row) => {
              const Icon = gigsCategoryIcons[row.iconKey] || GigsCategoryIconFallback;
              return (
                <button
                  key={row.key}
                  type="button"
                  role="option"
                  className="ep-tag-dropdown-item ep-tag-dropdown-item--with-icon"
                  aria-selected={false}
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => {
                    if (values.length >= maxTags) return;
                    onAdd(row.label);
                    setQuery('');
                    setOpen(false);
                  }}
                >
                  <span
                    className="ep-tag-dd-icon"
                    style={{
                      '--icon-gradient': row.iconUi?.gradient,
                      '--icon-glow': row.iconUi?.glow,
                    }}
                  >
                    <Icon aria-hidden />
                  </span>
                  <span className="ep-tag-dd-label">{row.label}</span>
                </button>
              );
            })}
          </div>
        ) : null}
      </div>
    </div>
  );
}

/** Optional tabs for picking subs; chips row matches “What I Do Best” styling, always under header. Saves to draft.skillSubcategories. */
function OptionalSubcategoryTabs({ subValues, onAddSub, onRemoveSub, maxTags = 48 }) {
  const [panelOpen, setPanelOpen] = useState(false);
  const [activeIdx, setActiveIdx] = useState(0);
  const [subQuery, setSubQuery] = useState('');
  const [subOpen, setSubOpen] = useState(false);
  const subInputRef = useRef(null);

  const activeCat = GLOBAL_SERVICE_CATEGORY_OPTIONS[activeIdx];

  const filteredSubs = useMemo(() => {
    if (!activeCat) return [];
    const taken = new Set(subValues.map((v) => String(v).toLowerCase()));
    const subs = Array.isArray(activeCat.subcategories) ? activeCat.subcategories.filter(Boolean) : [];
    const q = subQuery.trim().toLowerCase();
    const avail = subs.filter((s) => !taken.has(String(s).toLowerCase()));
    if (!q) return avail;
    return avail.filter((s) => String(s).toLowerCase().includes(q));
  }, [activeCat, subQuery, subValues]);

  const commitSubTyped = () => {
    const t = subQuery.trim();
    if (!t || subValues.length >= maxTags) return;
    if (subValues.some((v) => String(v).toLowerCase() === t.toLowerCase())) return;
    const allowed = new Set(
      (activeCat?.subcategories || []).map((s) => String(s).toLowerCase())
    );
    if (!allowed.has(t.toLowerCase())) return;
    onAddSub(t);
    setSubQuery('');
    setSubOpen(false);
    subInputRef.current?.focus();
  };

  const subList = Array.isArray(subValues) ? subValues : [];

  return (
    <div className="ep-about-opt-sub">
      <button
        type="button"
        className="ep-about-opt-sub-toggle"
        onClick={() => setPanelOpen((o) => !o)}
        aria-expanded={panelOpen}
      >
        <FiChevronRight className={`ep-about-opt-sub-chevron ${panelOpen ? 'ep-about-opt-sub-chevron--open' : ''}`} aria-hidden />
        <span>Subcategories by category tab (optional)</span>
      </button>

      {/* Same row style as “What I Do Best” — chips inside ep-tag-field, always under this header */}
      <div className="ep-tag-field ep-about-sub-chip-row mt-2">
        <div className="ep-tag-field-inner">
          {subList.map((s, i) => (
            <span key={`${String(s)}:${i}`} className="ep-chip ep-chip--interactive">
              {s}
              <button type="button" className="ep-chip-remove" onClick={() => onRemoveSub(s)} aria-label={`Remove ${s}`}>
                ×
              </button>
            </span>
          ))}
          <input
            readOnly
            className="ep-tag-field-input min-w-[8rem] cursor-pointer text-slate-500"
            placeholder={subList.length ? '+ Add more' : '+ Add subcategory'}
            onFocus={() => setPanelOpen(true)}
            onClick={() => setPanelOpen(true)}
            aria-label="Open subcategory tabs to add"
          />
        </div>
        <FiChevronDown className="ep-tag-field-chevron shrink-0 text-slate-600" aria-hidden />
      </div>

      {panelOpen ? (
        <div className="ep-about-opt-sub-panel mt-3">
          <p className="ep-about-opt-sub-hint">Pick a category tab, then search — only that category’s subcategories appear.</p>

          <div className="ep-about-cat-tab-strip" role="tablist" aria-label="Service categories">
            {GLOBAL_SERVICE_CATEGORY_OPTIONS.map((cat, idx) => {
              const Icon = gigsCategoryIcons[cat.iconKey] || GigsCategoryIconFallback;
              const active = idx === activeIdx;
              return (
                <button
                  key={cat.name}
                  type="button"
                  role="tab"
                  aria-selected={active}
                  className={`ep-about-cat-tab ${active ? 'ep-about-cat-tab--active' : ''}`}
                  onClick={() => {
                    setActiveIdx(idx);
                    setSubQuery('');
                    setSubOpen(true);
                  }}
                >
                  <span
                    className="ep-about-cat-tab-icon"
                    style={{
                      '--icon-gradient': cat.iconUi?.gradient,
                      '--icon-glow': cat.iconUi?.glow,
                    }}
                  >
                    <Icon aria-hidden />
                  </span>
                  <span className="ep-about-cat-tab-label">{cat.name}</span>
                </button>
              );
            })}
          </div>

          {activeCat ? (
            <div className={`ep-tag-field ep-about-sub-field ${subOpen && filteredSubs.length ? 'ep-tag-field--open' : ''}`}>
              <div className="ep-tag-field-inner">
                <input
                  ref={subInputRef}
                  type="text"
                  className="ep-tag-field-input"
                  value={subQuery}
                  placeholder={`Search subcategories in ${activeCat.name}…`}
                  onChange={(e) => {
                    setSubQuery(e.target.value);
                    setSubOpen(true);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ',') {
                      e.preventDefault();
                      commitSubTyped();
                    }
                  }}
                  onFocus={() => setSubOpen(true)}
                  onBlur={() => setTimeout(() => setSubOpen(false), 180)}
                />
              </div>
              <FiChevronDown className="ep-tag-field-chevron" aria-hidden />

              {subOpen && (activeCat.subcategories || []).length === 0 ? (
                <div className="ep-tag-dropdown ep-about-sub-empty-msg" role="status">
                  No subcategories listed for this category.
                </div>
              ) : null}

              {subOpen && filteredSubs.length > 0 ? (
                <div className="ep-tag-dropdown ep-tag-dropdown--full-cat ep-tag-dropdown--sub-only" role="listbox">
                  {filteredSubs.map((subLabel) => {
                    const Icon = gigsCategoryIcons[activeCat.iconKey] || GigsCategoryIconFallback;
                    return (
                      <button
                        key={`${activeCat.name}:${subLabel}`}
                        type="button"
                        role="option"
                        className="ep-tag-dropdown-item ep-tag-dropdown-item--with-icon"
                        aria-selected={false}
                        onMouseDown={(e) => e.preventDefault()}
                        onClick={() => {
                          if (subValues.length >= maxTags) return;
                          onAddSub(subLabel);
                          setSubQuery('');
                          setSubOpen(false);
                        }}
                      >
                        <span
                          className="ep-tag-dd-icon"
                          style={{
                            '--icon-gradient': activeCat.iconUi?.gradient,
                            '--icon-glow': activeCat.iconUi?.glow,
                          }}
                        >
                          <Icon aria-hidden />
                        </span>
                        <span className="ep-tag-dd-label">{subLabel}</span>
                      </button>
                    );
                  })}
                </div>
              ) : null}

              {subOpen &&
              activeCat &&
              (activeCat.subcategories || []).length > 0 &&
              filteredSubs.length === 0 ? (
                <div className="ep-tag-dropdown ep-about-sub-empty-msg" role="status">
                  No matching subcategories{subQuery.trim() ? ' for your search.' : ' left to add.'}
                </div>
              ) : null}
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}

function LanguageTagField({ values, onAdd, onRemove, suggestions, placeholder, maxTags = 32 }) {
  const inputRef = useRef(null);
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const setVals = new Set(values.map((v) => v.toLowerCase()));
    const list = suggestions.filter((s) => !setVals.has(s.toLowerCase()));
    if (!q) return list;
    return list.filter((s) => s.toLowerCase().includes(q));
  }, [query, suggestions, values]);

  const commit = () => {
    const t = query.trim();
    if (!t || values.length >= maxTags) return;
    if (values.some((v) => v.toLowerCase() === t.toLowerCase())) return;
    onAdd(t);
    setQuery('');
    setOpen(false);
    inputRef.current?.focus();
  };

  const onKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      commit();
    } else if (e.key === 'Backspace' && !query && values.length) {
      onRemove(values[values.length - 1]);
    }
  };

  return (
    <div>
      <label className="ep-field-label">Languages</label>
      <div className={`ep-tag-field ${open && filtered.length ? 'ep-tag-field--open' : ''}`}>
        <div className="ep-tag-field-inner">
          {values.map((s) => (
            <span key={s} className="ep-chip ep-chip--interactive">
              {s}
              <button type="button" className="ep-chip-remove" onClick={() => onRemove(s)} aria-label={`Remove ${s}`}>
                ×
              </button>
            </span>
          ))}
          <input
            ref={inputRef}
            type="text"
            className="ep-tag-field-input"
            value={query}
            placeholder={values.length === 0 ? placeholder : '+ Add'}
            onChange={(e) => {
              setQuery(e.target.value);
              setOpen(true);
            }}
            onKeyDown={onKeyDown}
            onFocus={() => setOpen(true)}
            onBlur={() => setTimeout(() => setOpen(false), 150)}
          />
        </div>
        <FiChevronDown className="ep-tag-field-chevron" aria-hidden />

        {open && filtered.length > 0 ? (
          <div className="ep-tag-dropdown" role="listbox">
            {filtered.map((s) => (
              <button
                key={s}
                type="button"
                role="option"
                className="ep-tag-dropdown-item"
                aria-selected={false}
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => {
                  if (values.length >= maxTags) return;
                  onAdd(s);
                  setQuery('');
                  setOpen(false);
                }}
              >
                {s}
              </button>
            ))}
          </div>
        ) : null}
      </div>
    </div>
  );
}

const EditProfileAboutFields = ({ draft, setDraft, userIdentifier, refreshData, onBack, onContinue }) => {
  const editorRef = useRef(null);
  const lastGoodBioHtmlRef = useRef(typeof draft?.bio === 'string' ? draft.bio : '');

  const [plainLen, setPlainLen] = useState(() => plainTextFromHtml(draft?.bio || ''));

  const [eduFormOpen, setEduFormOpen] = useState(false);
  const [eduDraft, setEduDraft] = useState({
    degree: '',
    institution: '',
    startYear: '',
    endYear: '',
  });

  const [saving, setSaving] = useState(false);

  useLayoutEffect(() => {
    const el = editorRef.current;
    if (!el) return;
    const nextHtml = draft.bio || '';
    lastGoodBioHtmlRef.current = nextHtml;
    if (document.activeElement === el) return;
    if ((el.innerHTML || '') !== nextHtml) {
      el.innerHTML = nextHtml;
    }
    setPlainLen(plainTextFromHtml(nextHtml).length);
  }, [draft.bio]);

  const commitHtmlSnapshot = () => {
    const el = editorRef.current;
    if (!el) return;
    let html = el.innerHTML;
    const plain = plainTextFromHtml(html);
    if (plain.length > BIO_MAX_PLAIN) {
      el.innerHTML = lastGoodBioHtmlRef.current;
      return;
    }
    lastGoodBioHtmlRef.current = html;
    setPlainLen(plain.length);
    setDraft((d) => ({ ...d, bio: html }));
  };

  const runFormatting = (cmd) => {
    const el = editorRef.current;
    if (!el) return;
    el.focus();
    document.execCommand(cmd, false);
    commitHtmlSnapshot();
  };

  const runListInsert = (listCmd) => {
    const el = editorRef.current;
    if (!el) return;
    prepareEditorForListCommand(el);
    document.execCommand(listCmd, false);
    commitHtmlSnapshot();
  };

  const syncBioFromEditor = () => {
    const el = editorRef.current;
    if (!el) return;
    let html = el.innerHTML;
    const plain = plainTextFromHtml(html);
    if (plain.length > BIO_MAX_PLAIN) {
      el.innerHTML = lastGoodBioHtmlRef.current;
      html = lastGoodBioHtmlRef.current;
    } else {
      lastGoodBioHtmlRef.current = html;
      setPlainLen(plain.length);
      setDraft((d) => ({ ...d, bio: html }));
    }
  };

  const addEducationEntry = () => {
    const degree = eduDraft.degree.trim();
    const institution = eduDraft.institution.trim();
    if (!degree && !institution) {
      window.alert('Add a degree title or institution.');
      return;
    }
    const id = `edu-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    setDraft((d) => ({
      ...d,
      educations: [
        ...(Array.isArray(d.educations) ? d.educations : []),
        {
          id,
          degree,
          institution,
          startYear: eduDraft.startYear.trim(),
          endYear: eduDraft.endYear.trim(),
        },
      ],
    }));
    setEduDraft({ degree: '', institution: '', startYear: '', endYear: '' });
    setEduFormOpen(false);
  };

  const saveAndContinue = async () => {
    if (!userIdentifier) {
      window.alert('You must be logged in to save your profile.');
      return;
    }
    syncBioFromEditor();
    const htmlBio = editorRef.current?.innerHTML ?? draft.bio ?? '';
    setSaving(true);
    try {
      await updateProfileData(userIdentifier, {
        bio: htmlBio || '',
        skills: Array.isArray(draft.skills) ? draft.skills : [],
        skill_subcategories: Array.isArray(draft.skillSubcategories) ? draft.skillSubcategories : [],
        languages: Array.isArray(draft.languages) ? draft.languages : [],
        educations: (Array.isArray(draft.educations) ? draft.educations : []).map((e) => ({
          id: String(e.id),
          degree: e.degree ?? '',
          institution: e.institution ?? '',
          start_year: e.startYear ?? '',
          end_year: e.endYear ?? '',
        })),
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

  const educations = Array.isArray(draft.educations) ? draft.educations : [];
  const yearHint = `${new Date().getFullYear()}`;

  return (
    <div className="ep-about-form ep-root space-y-5">
      <div>
        <label className="ep-field-label">Bio</label>
        <BioToolbar
          onFmt={runFormatting}
          onBulletList={() => runListInsert('insertUnorderedList')}
          onNumberedList={() => runListInsert('insertOrderedList')}
        />
        <div
          ref={editorRef}
          role="textbox"
          aria-multiline
          aria-label="Bio"
          contentEditable
          suppressContentEditableWarning
          className="ep-about-bio-editor ep-input resize-y rounded-t-none"
          onInput={syncBioFromEditor}
          onPaste={(e) => setTimeout(syncBioFromEditor, 0)}
        />
        <p className="ep-about-bio-meta">
          {plainLen}/{BIO_MAX_PLAIN} characters
        </p>
      </div>

      <div className="ep-about-skills-wrap">
        <p className="ep-field-label ep-about-skills-section-title">Top skills</p>
        <CategorySkillTagField
          values={draft.skills || []}
          onAdd={(tag) =>
            setDraft((d) => ({
              ...d,
              skills: [...(Array.isArray(d.skills) ? d.skills : []), tag],
            }))
          }
          onRemove={(tag) =>
            setDraft((d) => ({
              ...d,
              skills: (Array.isArray(d.skills) ? d.skills : []).filter((x) => x !== tag),
            }))
          }
        />
      </div>

      <OptionalSubcategoryTabs
        subValues={draft.skillSubcategories || []}
        maxTags={48}
        onAddSub={(tag) =>
          setDraft((d) => ({
            ...d,
            skillSubcategories: [...(Array.isArray(d.skillSubcategories) ? d.skillSubcategories : []), tag],
          }))
        }
        onRemoveSub={(tag) =>
          setDraft((d) => ({
            ...d,
            skillSubcategories: (Array.isArray(d.skillSubcategories) ? d.skillSubcategories : []).filter((x) => x !== tag),
          }))
        }
      />

      <LanguageTagField
        values={draft.languages || []}
        onAdd={(tag) =>
          setDraft((d) => ({
            ...d,
            languages: [...(Array.isArray(d.languages) ? d.languages : []), tag],
          }))
        }
        onRemove={(tag) =>
          setDraft((d) => ({
            ...d,
            languages: (Array.isArray(d.languages) ? d.languages : []).filter((x) => x !== tag),
          }))
        }
        suggestions={LANGUAGE_SUGGESTIONS}
        placeholder="Type and press Enter to add languages"
      />

      <div>
        <label className="ep-field-label">Education</label>
        <div className="space-y-3">
          {educations.map((edu) => {
            const ys = [edu.startYear, edu.endYear].map((y) => (y ?? '').trim()).filter(Boolean);
            const years = ys.length === 2 ? `${ys[0]} - ${ys[1]}` : ys[0] || '';
            return (
              <div key={edu.id} className="ep-edu-card">
                <FiBookOpen className="ep-edu-card-icon shrink-0" aria-hidden />
                <div className="min-w-0 flex-1">
                  <p className="ep-edu-card-degree">{edu.degree?.trim() || 'Degree'}</p>
                  <p className="ep-edu-card-inst">{edu.institution?.trim() || 'Institution'}</p>
                </div>
                {years ? <span className="ep-edu-card-years">{years}</span> : null}
                <button
                  type="button"
                  className="ep-edu-remove"
                  aria-label="Remove education entry"
                  onClick={() =>
                    setDraft((d) => ({
                      ...d,
                      educations: (Array.isArray(d.educations) ? d.educations : []).filter((x) => x.id !== edu.id),
                    }))
                  }
                >
                  ×
                </button>
              </div>
            );
          })}

          {eduFormOpen ? (
            <div className="ep-edu-add-panel">
              <div className="ep-edu-grid">
                <label className="ep-edu-field">
                  <span>Degree</span>
                  <input
                    className="ep-input ep-input--solid"
                    value={eduDraft.degree}
                    placeholder="BS in Computer Science"
                    onChange={(e) => setEduDraft((s) => ({ ...s, degree: e.target.value }))}
                  />
                </label>
                <label className="ep-edu-field">
                  <span>Institution</span>
                  <input
                    className="ep-input ep-input--solid"
                    value={eduDraft.institution}
                    placeholder="University name"
                    onChange={(e) => setEduDraft((s) => ({ ...s, institution: e.target.value }))}
                  />
                </label>
                <label className="ep-edu-field">
                  <span>Start year</span>
                  <input
                    className="ep-input ep-input--solid"
                    value={eduDraft.startYear}
                    placeholder={yearHint}
                    inputMode="numeric"
                    onChange={(e) => setEduDraft((s) => ({ ...s, startYear: e.target.value }))}
                  />
                </label>
                <label className="ep-edu-field">
                  <span>End year</span>
                  <input
                    className="ep-input ep-input--solid"
                    value={eduDraft.endYear}
                    placeholder={yearHint}
                    inputMode="numeric"
                    onChange={(e) => setEduDraft((s) => ({ ...s, endYear: e.target.value }))}
                  />
                </label>
              </div>
              <div className="flex flex-wrap gap-2">
                <button type="button" className="ep-btn-save-mini" onClick={addEducationEntry}>
                  Done
                </button>
                <button
                  type="button"
                  className="ep-btn-ghost-mini"
                  onClick={() => {
                    setEduFormOpen(false);
                    setEduDraft({ degree: '', institution: '', startYear: '', endYear: '' });
                  }}
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <button type="button" className="ep-about-add-edu" onClick={() => setEduFormOpen(true)}>
              + Add Education
            </button>
          )}
        </div>
      </div>

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

export default EditProfileAboutFields;
