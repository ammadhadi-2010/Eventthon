import React, { useEffect, useMemo, useRef, useState } from 'react';
import { FiInfo, FiPlus, FiTrash2 } from 'react-icons/fi';
import { GLOBAL_SKILL_OPTIONS } from '../../../../../data/serviceCatalog';
import {
  gigsCategoryIcons,
  GigsCategoryIconFallback,
} from '../../../Gigs/utils/gigsBrowseCategoryIcons';
import { clampPct, newSkillId, proficiencyBadge, resolveSkillRowVisual } from './editProfileSkillsNicheUtils';
import '../editProfileLayout.css';

const MAX_DROPDOWN = 14;

function notInEntries(entries, name) {
  const q = name.trim().toLowerCase();
  return !entries.some((e) => e.name.toLowerCase() === q);
}

const EditProfileSkillsNicheTopSkills = ({ entries, patchEntries }) => {
  const [addName, setAddName] = useState('');
  const [comboOpen, setComboOpen] = useState(false);
  const comboRef = useRef(null);

  const catalogAvailable = useMemo(
    () => GLOBAL_SKILL_OPTIONS.filter((o) => notInEntries(entries, o.name)),
    [entries]
  );

  const needle = addName.trim().toLowerCase();
  /** Dropdown only while typing (search); no browse-all list on empty input. */
  const filteredCatalog = useMemo(() => {
    if (!needle) return [];
    return catalogAvailable
      .filter((o) => o.name.toLowerCase().includes(needle))
      .slice(0, MAX_DROPDOWN);
  }, [needle, catalogAvailable]);

  /** Catalogue still lists this spelling (unused slot). */
  const hasExactCatalogLeft =
    needle && catalogAvailable.some((o) => o.name.toLowerCase() === needle);

  useEffect(() => {
    const onDoc = (e) => {
      if (comboRef.current && !comboRef.current.contains(e.target)) setComboOpen(false);
    };
    document.addEventListener('mousedown', onDoc);
    return () => document.removeEventListener('mousedown', onDoc);
  }, []);

  const tryAdd = (rawInput) => {
    const trimmed = String(rawInput || '').trim();
    if (!trimmed) return;
    const avail = GLOBAL_SKILL_OPTIONS.filter((o) => notInEntries(entries, o.name));
    const n = trimmed.toLowerCase();
    let canonical = trimmed;
    const exact = avail.find((o) => o.name.toLowerCase() === n);
    if (exact) {
      canonical = exact.name;
    } else {
      const matches = avail.filter((o) => o.name.toLowerCase().includes(n));
      if (matches.length === 1) canonical = matches[0].name;
    }
    if (!notInEntries(entries, canonical)) return;
    patchEntries((prev) => {
      if (!notInEntries(prev, canonical)) return prev;
      return [...prev, { id: newSkillId(), name: canonical, proficiency: 80 }];
    });
    setAddName('');
    setComboOpen(false);
  };

  const submitAdd = (e) => {
    e?.preventDefault?.();
    e?.stopPropagation?.();
    tryAdd(addName);
  };

  const showDropdown =
    comboOpen &&
    Boolean(needle) &&
    (filteredCatalog.length > 0 ||
      (notInEntries(entries, addName.trim()) && !hasExactCatalogLeft));

  return (
    <div className="ep-sn-col ep-sn-col--skills">
      <div className="ep-sn-col-head">
        <h3 className="ep-sn-col-title">Top Skills</h3>
        <span
          className="ep-sn-info"
          title="Search the skill list below, pick a row, or add a custom name with Enter / Add Skill."
        >
          <FiInfo className="h-3.5 w-3.5" aria-hidden />
        </span>
      </div>

      <ul className="ep-sn-skill-list">
        {entries.map((row) => {
          const { Icon, iconUi } = resolveSkillRowVisual(row.name);
          const pct = clampPct(row.proficiency);
          return (
            <li key={row.id} className="ep-sn-skill-row">
              <span
                className="ep-sn-skill-icon"
                style={{
                  '--icon-gradient': iconUi.gradient,
                  '--icon-glow': iconUi.glow,
                }}
                data-icon-effect={iconUi.effect || ''}
                aria-hidden
              >
                <Icon className="h-4 w-4" />
              </span>
              <div className="ep-sn-skill-main">
                <div className="ep-sn-skill-top">
                  <input
                    className="ep-input ep-input--solid ep-sn-name-input"
                    value={row.name}
                    onChange={(e) => {
                      const v = e.target.value;
                      patchEntries((prev) =>
                        prev.map((x) => (x.id === row.id ? { ...x, name: v } : x))
                      );
                    }}
                  />
                  <span className="ep-sn-pct">{pct}%</span>
                </div>
                <div className="ep-sn-bar-wrap">
                  <div className="ep-sn-bar-fill" style={{ width: `${pct}%` }} />
                </div>
                <input
                  type="range"
                  className="ep-sn-range"
                  min={5}
                  max={100}
                  value={pct}
                  onChange={(e) => {
                    const n = Number(e.target.value);
                    patchEntries((prev) =>
                      prev.map((x) => (x.id === row.id ? { ...x, proficiency: n } : x))
                    );
                  }}
                  aria-label={`${row.name} proficiency`}
                />
                <span className="ep-sn-badge">{proficiencyBadge(pct)}</span>
              </div>
              <button
                type="button"
                className="ep-sn-remove"
                onClick={() => patchEntries((prev) => prev.filter((x) => x.id !== row.id))}
                aria-label={`Remove ${row.name}`}
              >
                <FiTrash2 className="h-4 w-4" />
              </button>
            </li>
          );
        })}
      </ul>

      <div className="ep-sn-add-row ep-sn-combo" ref={comboRef}>
        <div className="ep-sn-combo-inner">
          <input
            className="ep-input ep-input--solid ep-sn-add-input"
            placeholder="Search skill list…"
            value={addName}
            onChange={(e) => {
              setAddName(e.target.value);
              setComboOpen(true);
            }}
            onFocus={() => setComboOpen(true)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                submitAdd(e);
              }
              if (e.key === 'Escape') setComboOpen(false);
            }}
            autoComplete="off"
          />
          {showDropdown ? (
            <div id="skill-catalog-suggest" className="ep-sn-skill-dd" role="listbox">
              {filteredCatalog.map((o) => {
                const Ico = gigsCategoryIcons[o.iconKey] || GigsCategoryIconFallback;
                return (
                  <button
                    key={o.name}
                    type="button"
                    role="option"
                    aria-selected={false}
                    className="ep-sn-skill-dd-item"
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => tryAdd(o.name)}
                  >
                    <span
                      className="ep-sn-skill-dd-ico"
                      style={{
                        '--icon-gradient': o.iconUi.gradient,
                        '--icon-glow': o.iconUi.glow,
                      }}
                    >
                      <Ico className="h-3 w-3" aria-hidden />
                    </span>
                    <span>{o.name}</span>
                  </button>
                );
              })}
              {needle && notInEntries(entries, addName.trim()) && !hasExactCatalogLeft ? (
                <button
                  type="button"
                  role="option"
                  aria-selected={false}
                  className="ep-sn-skill-dd-item ep-sn-skill-dd-item--custom"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => tryAdd(addName.trim())}
                >
                  Add custom: <strong>{addName.trim()}</strong>
                </button>
              ) : null}
            </div>
          ) : null}
        </div>
        <button
          type="button"
          className="ep-exp-add-inline ep-sn-add-btn shrink-0"
          onClick={submitAdd}
          disabled={!addName.trim()}
          title="Matched catalogue name use ho gi; warna yeh custom skill ban jaye gi."
        >
          <FiPlus className="h-4 w-4" aria-hidden />
          Add Skill
        </button>
      </div>
    </div>
  );
};

export default EditProfileSkillsNicheTopSkills;
