import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useScrollDirection } from '../../../../hooks/useScrollDirection';
import { useMobileHub } from '../../../../hooks/useMobileHub';
import HubMobileTopBar from '../../components/mobile/HubMobileTopBar';
import { HUB_MOBILE_SEARCH } from '../../components/mobile/hubMobileSearchPresets';
import { API_BASE_URL } from '../../../../api/axiosConfig';
import { normalizeCountryToCode } from '../../../../data/globalCountries';
import {
  filterLinksForEditProfileDraft,
  newSocialLinkRow,
} from '../../../../data/editProfileSocialLinksConfig';
import EditProfileCenterColumn from './EditProfileCenterColumn';
import EditProfileLeftRail from './EditProfileLeftRail';
import EditProfileLivePreview from './EditProfileLivePreview';
import { GLOBAL_SKILL_NAMES } from '../../../../data/serviceCatalog';
import { EDIT_PROFILE_STEPS } from './editProfileSteps';
import { getProfileIdentifier } from '../utils/profileSession';
import { ensureRankMatrixLoaded } from '../../../../services/rankMatrixCache';
import { computeProfileCompletionPct, readPreferencesFromUser } from '../utils/profileCompletion';
import './editProfileLayout.css';

function resolveMediaUrl(val) {
  if (!val || typeof val !== 'string') return '';
  const v = val.trim();
  if (!v) return '';
  if (v.startsWith('http://') || v.startsWith('https://') || v.startsWith('blob:')) return v;
  const path = v.startsWith('/') ? v : `/${v}`;
  return `${API_BASE_URL}${path}`;
}

function buildSocialLinksFromUser(userData) {
  if (Array.isArray(userData?.social_links) && userData.social_links.length > 0) {
    const normalized = userData.social_links
      .filter((x) => x && typeof x === 'object')
      .map((x, i) => ({
        id: String(x.id || `sl-${i}-${Date.now()}`),
        platform: String(x.platform || 'website').toLowerCase(),
        url: String(x.url || ''),
      }));
    return filterLinksForEditProfileDraft(normalized);
  }
  const rows = [];
  if (userData?.link_website?.trim()) {
    rows.push({ ...newSocialLinkRow('website'), url: userData.link_website.trim() });
  }
  return filterLinksForEditProfileDraft(rows);
}

/** Remove a trailing "TOP SKILLS" line mistakenly stored inside HTML bio (legacy / paste). */
function sanitizeBioRemoveStrayTopSkillsHeading(html) {
  if (!html || typeof html !== 'string') return '';
  const trimmed = html.trim();
  if (!trimmed) return '';
  if (typeof document === 'undefined') return html;
  try {
    const d = document.createElement('div');
    d.innerHTML = trimmed;
    const isTopSkillsOnly = (s) => /^top\s+skills\.?$/i.test(String(s).replace(/\u00a0/g, ' ').trim());
    let guard = 0;
    while (guard++ < 48) {
      const last = d.lastChild;
      if (!last) break;
      if (last.nodeType === Node.TEXT_NODE) {
        const text = String(last.textContent || '').replace(/\u00a0/g, ' ').trim();
        if (text === '' || isTopSkillsOnly(text)) {
          last.remove();
          continue;
        }
        break;
      }
      if (last.nodeType === Node.ELEMENT_NODE) {
        const tag = last.tagName.toLowerCase();
        if (tag === 'br') {
          last.remove();
          continue;
        }
        const inner = String(last.textContent || '').replace(/\u00a0/g, ' ').trim();
        if (['p', 'div', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'span'].includes(tag) && isTopSkillsOnly(inner)) {
          last.remove();
          continue;
        }
        break;
      }
      break;
    }
    return d.innerHTML.trim();
  } catch {
    return html;
  }
}

export function buildDraft(userData) {
  const fn = userData?.first_name || '';
  const ln = userData?.last_name || '';
  const pic =
    userData?.imageurl ||
    userData?.profile_image_url ||
    userData?.avatar ||
    '';
  const banner = userData?.banner || '';
  const defaultSkillNames =
    Array.isArray(GLOBAL_SKILL_NAMES) && GLOBAL_SKILL_NAMES.length >= 3
      ? GLOBAL_SKILL_NAMES.slice(0, 5)
      : ['React', 'Node.js', 'JavaScript', 'MongoDB', 'Tailwind CSS'];
  const normalizeTopSkillRow = (x, i) => {
    if (typeof x === 'string') {
      const name = x.trim();
      const proficiency = Math.max(55, 95 - i * 5);
      return {
        id: `sk-legacy-${i}-${name}`,
        name,
        proficiency,
      };
    }
    const name = String(x?.name ?? '').trim();
    let proficiency = Number(x?.proficiency);
    if (Number.isNaN(proficiency)) proficiency = 80;
    proficiency = Math.min(100, Math.max(5, Math.round(proficiency)));
    return {
      id: String(x?.id || `sk-${i}-${Date.now()}`),
      name,
      proficiency,
    };
  };
  const rawTopSkills = Array.isArray(userData?.top_skills) ? userData.top_skills : null;
  const rawLegacySkills = Array.isArray(userData?.skills) ? userData.skills : null;
  let skillEntries = [];
  if (rawTopSkills && rawTopSkills.length > 0) {
    skillEntries = rawTopSkills.map(normalizeTopSkillRow).filter((s) => s.name);
  } else if (rawLegacySkills && rawLegacySkills.length > 0) {
    skillEntries = rawLegacySkills.map(normalizeTopSkillRow).filter((s) => s.name);
  } else {
    skillEntries = defaultSkillNames.map((n, i) => normalizeTopSkillRow(n, i));
  }
  skillEntries = skillEntries.filter((s) => s.name);
  const skills = skillEntries.map((e) => e.name);
  const langs =
    Array.isArray(userData?.languages) && userData.languages.length > 0
      ? userData.languages
      : ['English', 'Urdu'];
  const normalizeEducationEntry = (x, i) => ({
    id: String(x?.id || `edu-${i}-${Date.now()}`),
    degree: String(x?.degree ?? x?.title ?? ''),
    institution: String(x?.institution ?? x?.school ?? ''),
    startYear: String(x?.start_year ?? x?.startYear ?? ''),
    endYear: String(x?.end_year ?? x?.endYear ?? ''),
  });
  const educations =
    Array.isArray(userData?.educations) && userData.educations.length > 0
      ? userData.educations.map(normalizeEducationEntry)
      : [];
  const skillSubcategories =
    Array.isArray(userData?.skill_subcategories) && userData.skill_subcategories.length > 0
      ? [...userData.skill_subcategories.map((x) => String(x))]
      : [];
  const subNicheDraft = String(skillSubcategories[0] ?? '').trim();
  const primaryNicheDraft = String(userData?.niche ?? '').trim() || '';

  const ciRaw =
    userData?.career_interests && typeof userData.career_interests === 'object'
      ? userData.career_interests
      : {};
  const careerInterests = {
    remoteOpportunities: ciRaw.remote_opportunities ?? ciRaw.remoteOpportunities ?? true,
    fullTimeJobs: ciRaw.full_time_jobs ?? ciRaw.fullTimeJobs ?? true,
    freelanceProjects: ciRaw.freelance_projects ?? ciRaw.freelanceProjects ?? true,
    internships: ciRaw.internships ?? false,
  };
  const normalizeExperienceEntry = (x, i) => {
    const period = String(x?.period ?? '');
    const current =
      x?.current != null
        ? Boolean(x.current)
        : /\bpresent\b/i.test(period);
    return {
      id: String(x?.id || `exp-${i}-${Date.now()}`),
      role: String(x?.role ?? ''),
      company: String(x?.company ?? ''),
      period,
      desc: String(x?.desc ?? ''),
      tags: Array.isArray(x?.tags) ? x.tags.map((t) => String(t)) : [],
      logoUrl: String(x?.logo_url ?? x?.logoUrl ?? ''),
      durationLabel: String(x?.duration_label ?? x?.durationLabel ?? ''),
      current,
    };
  };
  const experiences =
    Array.isArray(userData?.experiences) && userData.experiences.length > 0
      ? userData.experiences.map(normalizeExperienceEntry)
      : [];
  const normalizeProjectEntry = (x, i) => {
    const techRaw = x?.tech ?? x?.tech_stack ?? x?.stack;
    let tech = [];
    if (Array.isArray(techRaw)) tech = techRaw.map((t) => String(t));
    else if (typeof techRaw === 'string') tech = techRaw.split(',').map((t) => t.trim()).filter(Boolean);
    const kr = x?.key_results ?? x?.keyResults ?? x?.results;
    let keyResults = [];
    if (Array.isArray(kr)) keyResults = kr.map((t) => String(t));
    return {
      id: String(x?.id || `proj-${i}-${Date.now()}`),
      title: String(x?.title ?? ''),
      desc: String(x?.desc ?? x?.description ?? ''),
      imageUrl: String(x?.image ?? x?.imageUrl ?? x?.thumb ?? ''),
      tech,
      featured: Boolean(x?.featured),
      linkUrl: String(x?.link ?? x?.url ?? x?.live_url ?? ''),
      completedDate: String(x?.completed_date ?? x?.completedDate ?? ''),
      keyResults,
    };
  };
  const projects =
    Array.isArray(userData?.projects) && userData.projects.length > 0
      ? userData.projects.map(normalizeProjectEntry)
      : [];
  return {
    firstName: fn,
    lastName: ln,
    fullName: [fn, ln].filter(Boolean).join(' ').trim(),
    headline: userData?.headline || '',
    city: userData?.city || '',
    countryCode: normalizeCountryToCode(userData?.country),
    niche: primaryNicheDraft,
    primaryNiche: primaryNicheDraft,
    subNiche: subNicheDraft,
    profilePreferences: readPreferencesFromUser(userData),
    bio: sanitizeBioRemoveStrayTopSkillsHeading(userData?.bio || ''),
    profileImageUrl: resolveMediaUrl(pic),
    coverImageUrl: resolveMediaUrl(banner),
    availability: userData?.availability || 'available',
    skills,
    skillEntries,
    skillSubcategories,
    careerInterests,
    languages: langs,
    socialLinks: buildSocialLinksFromUser(userData),
    educations,
    experiences,
    projects,
  };
}

/**
 * 3-column scaffold: left steps | center (stacked sections) | right live preview detail.
 */
const EditProfileFlowPage = ({ userData, refreshData }) => {
  const isMobile = useMobileHub();
  const scrollDirection = useScrollDirection();
  const [searchQuery, setSearchQuery] = useState('');
  const [focusedStepId, setFocusedStepId] = useState(EDIT_PROFILE_STEPS[0]?.id || 'basic');
  const programmaticScrollRef = useRef(false);
  const [draft, setDraft] = useState(() => buildDraft(userData));
  const [preferencesComplete, setPreferencesComplete] = useState(
    () => Boolean(userData?.profile_onboarding_complete),
  );

  const activeIndex = useMemo(() => {
    const i = EDIT_PROFILE_STEPS.findIndex((s) => s.id === focusedStepId);
    return i >= 0 ? i : 0;
  }, [focusedStepId]);

  const userIdentifier = useMemo(() => getProfileIdentifier(userData), [userData]);

  useEffect(() => {
    ensureRankMatrixLoaded();
  }, []);

  useEffect(() => {
    setDraft(buildDraft(userData));
    setPreferencesComplete(Boolean(userData?.profile_onboarding_complete));
  }, [userData]);

  const completionPct = useMemo(
    () => computeProfileCompletionPct(userData, preferencesComplete, activeIndex),
    [userData, preferencesComplete, activeIndex],
  );

  const handlePreferencesSaved = useCallback(() => {
    setPreferencesComplete(true);
  }, []);

  /** Sync focused step with viewport while scrolling the center column (page scroll). */
  useEffect(() => {
    const stepIds = EDIT_PROFILE_STEPS.map((s) => s.id);
    let raf = 0;

    const pickStepInView = () => {
      if (programmaticScrollRef.current) return;
      const anchorY = window.innerHeight * 0.26;
      let bestId = stepIds[0];
      let bestDist = Infinity;
      stepIds.forEach((id) => {
        const el = document.getElementById(`edit-section-${id}`);
        if (!el) return;
        const r = el.getBoundingClientRect();
        if (r.bottom < 96 || r.top > window.innerHeight - 48) return;
        const ref = r.top + Math.min(r.height * 0.2, 56);
        const dist = Math.abs(ref - anchorY);
        if (dist < bestDist) {
          bestDist = dist;
          bestId = id;
        }
      });
      setFocusedStepId((prev) => (prev === bestId ? prev : bestId));
    };

    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(pickStepInView);
    };

    const scrollRoot = document.querySelector('main.center-content-scroll') || window;
    scrollRoot.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll, { passive: true });
    pickStepInView();
    return () => {
      scrollRoot.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
      cancelAnimationFrame(raf);
    };
  }, []);

  const goToStep = useCallback((idx) => {
    const step = EDIT_PROFILE_STEPS[idx];
    if (!step) return;
    programmaticScrollRef.current = true;
    setFocusedStepId(step.id);
    requestAnimationFrame(() => {
      document.getElementById(`edit-section-${step.id}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
    window.setTimeout(() => {
      programmaticScrollRef.current = false;
    }, 900);
  }, []);

  useEffect(() => {
    const q = (searchQuery || '').trim().toLowerCase();
    if (!q) return;
    const idx = EDIT_PROFILE_STEPS.findIndex(
      (step) =>
        step.label.toLowerCase().includes(q) ||
        step.hint.toLowerCase().includes(q) ||
        step.id.toLowerCase().includes(q),
    );
    if (idx >= 0) goToStep(idx);
  }, [searchQuery, goToStep]);

  return (
    <div className={`ep-root min-h-screen w-full min-w-0 bg-[#0b0e14] pb-12 pt-2 text-slate-100 sm:pb-20 sm:pt-3${isMobile ? ' ep-mobile-shell' : ''}`}>
      {isMobile ? (
        <HubMobileTopBar
          scrollDirection={scrollDirection}
          searchQuery={searchQuery}
          onSearchQueryChange={setSearchQuery}
          {...HUB_MOBILE_SEARCH.editProfile}
        />
      ) : null}
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(ellipse_at_top,_rgba(91,33,182,0.14),_transparent_55%)]" />
      <div className="ep-flow-shell relative">
        <header className="ep-page-header mb-4 flex flex-wrap items-end gap-4 border-b border-white/10 pb-3">
          <div>
            <h1 className="text-[1.65rem] font-black leading-tight tracking-tight text-white">Edit profile</h1>
            <p className="mt-1.5 max-w-xl text-[13px] leading-snug text-slate-500">
              Scroll through every section below — edit in any order. Use Save & Continue on Step 1 when you want to
              sync basic info to your account.
            </p>
          </div>
        </header>

        <div className="ep-flow-grid">
          <div className="ep-flow-grid__cell ep-flow-grid__cell--left order-2 flex flex-col lg:order-1">
            <EditProfileLeftRail activeIndex={activeIndex} onSelectStep={goToStep} completionPct={completionPct} />
          </div>
          <div className="ep-flow-grid__cell ep-flow-grid__cell--center order-1 lg:order-2">
            <EditProfileCenterColumn
              draft={draft}
              setDraft={setDraft}
              userData={userData}
              userIdentifier={userIdentifier}
              refreshData={refreshData}
              activeStepIndex={activeIndex}
              onGoToStep={goToStep}
              onAfterBasicContinue={() => goToStep(1)}
              onAfterAboutContinue={() => goToStep(2)}
              onBackAbout={() => goToStep(0)}
              onAfterExperienceContinue={() => goToStep(3)}
              onBackExperience={() => goToStep(1)}
              onAfterProjectsContinue={() => goToStep(4)}
              onBackProjects={() => goToStep(2)}
              onAfterSkillsContinue={() => goToStep(5)}
              onBackSkills={() => goToStep(3)}
              onAfterIdentityContinue={() => goToStep(6)}
              onBackIdentity={() => goToStep(4)}
              onBackPreferences={() => goToStep(5)}
              onAfterPreferencesContinue={() => goToStep(6)}
              onPreferencesSaved={handlePreferencesSaved}
            />
          </div>
          <div className="ep-flow-grid__cell ep-flow-grid__cell--right order-3 lg:order-3">
            <EditProfileLivePreview draft={draft} userData={userData} focusStepId={focusedStepId} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditProfileFlowPage;
