import React, { useEffect, useMemo, useRef, useState } from 'react';
import { FiChevronDown, FiCode, FiLayers, FiShield } from 'react-icons/fi';
import { GLOBAL_SERVICE_CATEGORY_OPTIONS } from '../../../../../data/serviceCatalog';
import {
  gigsCategoryIcons,
  GigsCategoryIconFallback,
} from '../../../Gigs/utils/gigsBrowseCategoryIcons';
import '../editProfileLayout.css';

const EditProfileSkillsNicheSelectors = ({
  primary,
  sub,
  interests,
  setDraft,
}) => {
  const [openPri, setOpenPri] = useState(false);
  const [openSub, setOpenSub] = useState(false);
  const priRef = useRef(null);
  const subRef = useRef(null);

  const primaryCat = useMemo(
    () => GLOBAL_SERVICE_CATEGORY_OPTIONS.find((c) => c.name === primary) || null,
    [primary]
  );
  const subItems = primaryCat?.subcategoryItems || [];
  const selectedSubMeta = subItems.find((x) => x.name === sub);
  const SubTriggerIcon = selectedSubMeta
    ? gigsCategoryIcons[selectedSubMeta.iconKey] || GigsCategoryIconFallback
    : FiShield;

  useEffect(() => {
    const onDoc = (e) => {
      if (priRef.current && !priRef.current.contains(e.target)) setOpenPri(false);
      if (subRef.current && !subRef.current.contains(e.target)) setOpenSub(false);
    };
    document.addEventListener('mousedown', onDoc);
    return () => document.removeEventListener('mousedown', onDoc);
  }, []);

  const setPrimaryNiche = (name) => {
    const nextPrimary = String(name || '').trim();
    const cat = GLOBAL_SERVICE_CATEGORY_OPTIONS.find((c) => c.name === nextPrimary);
    let nextSub = sub;
    if (cat && nextSub && !cat.subcategories.includes(nextSub)) nextSub = '';
    setDraft((d) => ({
      ...d,
      primaryNiche: nextPrimary,
      niche: nextPrimary,
      subNiche: nextSub,
      skillSubcategories: nextSub ? [nextSub] : [],
    }));
    setOpenPri(false);
  };

  const setSubNiche = (label) => {
    const v = String(label || '').trim();
    setDraft((d) => ({
      ...d,
      subNiche: v,
      skillSubcategories: v ? [v] : [],
    }));
    setOpenSub(false);
  };

  const patchInterest = (key, checked) => {
    setDraft((d) => ({
      ...d,
      careerInterests: { ...(d.careerInterests || {}), [key]: checked },
    }));
  };

  const PriIconComp = primaryCat
    ? gigsCategoryIcons[primaryCat.iconKey] || GigsCategoryIconFallback
    : FiCode;

  return (
    <div className="ep-sn-col ep-sn-col--niche">
      <h3 className="ep-sn-col-title ep-sn-col-title--solo">Select Your Niche</h3>

      <label className="ep-field-label">Primary Niche</label>
      <div className="ep-sn-dropdown" ref={priRef}>
        <button
          type="button"
          className="ep-sn-select-trigger ep-sn-select-trigger--primary"
          onClick={() => {
            setOpenPri((x) => !x);
            setOpenSub(false);
          }}
          aria-expanded={openPri}
        >
          <span
            className="ep-sn-select-icon ep-sn-select-icon--cat"
            style={
              primaryCat
                ? {
                    '--icon-gradient': primaryCat.iconUi.gradient,
                    '--icon-glow': primaryCat.iconUi.glow,
                  }
                : undefined
            }
          >
            <PriIconComp className="h-4 w-4" aria-hidden />
          </span>
          <span className="ep-sn-select-text">{primary || 'Choose category…'}</span>
          <FiChevronDown className="ep-sn-chevron ml-auto shrink-0 opacity-70" aria-hidden />
        </button>
        {openPri ? (
          <div className="ep-sn-dropdown-panel" role="listbox">
            {GLOBAL_SERVICE_CATEGORY_OPTIONS.map((c) => {
              const CIcon = gigsCategoryIcons[c.iconKey] || GigsCategoryIconFallback;
              const active = c.name === primary;
              return (
                <button
                  key={c.name}
                  type="button"
                  role="option"
                  aria-selected={active}
                  className={`ep-sn-dropdown-item ${active ? 'ep-sn-dropdown-item--active' : ''}`}
                  onClick={() => setPrimaryNiche(c.name)}
                >
                  <span
                    className="ep-sn-cat-ico-mini"
                    style={{
                      '--icon-gradient': c.iconUi.gradient,
                      '--icon-glow': c.iconUi.glow,
                    }}
                  >
                    <CIcon className="ep-sn-dd-ico" aria-hidden />
                  </span>
                  <span>{c.name}</span>
                </button>
              );
            })}
          </div>
        ) : null}
      </div>

      <label className="ep-field-label ep-sn-mt">Sub Niche (Optional)</label>
      <div className={`ep-sn-dropdown ${!primaryCat ? 'ep-sn-dropdown--disabled' : ''}`} ref={subRef}>
        <button
          type="button"
          className="ep-sn-select-trigger"
          disabled={!primaryCat}
          onClick={() => {
            if (!primaryCat) return;
            setOpenSub((x) => !x);
            setOpenPri(false);
          }}
          aria-expanded={openSub}
        >
          <span
            className="ep-sn-select-icon ep-sn-select-icon--sub"
            style={
              selectedSubMeta
                ? {
                    '--icon-gradient': selectedSubMeta.iconUi.gradient,
                    '--icon-glow': selectedSubMeta.iconUi.glow,
                  }
                : undefined
            }
            data-icon-effect={selectedSubMeta?.iconUi?.effect || ''}
          >
            <SubTriggerIcon className="h-4 w-4" aria-hidden />
          </span>
          <span className="ep-sn-select-text">{sub || 'Choose sub-specialty…'}</span>
          <FiChevronDown className="ep-sn-chevron ml-auto shrink-0 opacity-70" aria-hidden />
        </button>
        {openSub && primaryCat ? (
          <div className="ep-sn-dropdown-panel" role="listbox">
            <button
              type="button"
              className="ep-sn-dropdown-item ep-sn-dropdown-item--ghost"
              onClick={() => setSubNiche('')}
            >
              <span className="ep-sn-clear-label">Clear</span>
            </button>
            {subItems.map((item) => {
              const active = item.name === sub;
              const SIcon = gigsCategoryIcons[item.iconKey] || FiLayers;
              return (
                <button
                  key={item.name}
                  type="button"
                  role="option"
                  aria-selected={active}
                  className={`ep-sn-dropdown-item ${active ? 'ep-sn-dropdown-item--active' : ''}`}
                  onClick={() => setSubNiche(item.name)}
                >
                  <span
                    className="ep-sn-sub-ico-mini"
                    style={{
                      '--icon-gradient': item.iconUi.gradient,
                      '--icon-glow': item.iconUi.glow,
                    }}
                    data-icon-effect={item.iconUi.effect || ''}
                  >
                    <SIcon className="ep-sn-dd-ico" aria-hidden />
                  </span>
                  <span>{item.name}</span>
                </button>
              );
            })}
          </div>
        ) : null}
      </div>

      <p className="ep-field-label ep-sn-mt">Interested In</p>
      <div className="ep-sn-check-grid">
        {[
          ['remoteOpportunities', 'Remote Opportunities'],
          ['fullTimeJobs', 'Full Time Jobs'],
          ['freelanceProjects', 'Freelance Projects'],
          ['internships', 'Internships'],
        ].map(([key, lab]) => (
          <label key={key} className="ep-sn-check">
            <input
              type="checkbox"
              checked={Boolean(interests[key])}
              onChange={(e) => patchInterest(key, e.target.checked)}
            />
            <span>{lab}</span>
          </label>
        ))}
      </div>
    </div>
  );
};

export default EditProfileSkillsNicheSelectors;
