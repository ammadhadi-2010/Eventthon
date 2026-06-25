import React, { useEffect, useMemo, useRef } from 'react';
import { Link } from 'react-router-dom';
import { FiCheck, FiExternalLink } from 'react-icons/fi';
import { rankCodeToBadgeProps } from '../../../../../components/badgeTierProps';
import { getRankMeta } from '../../../../Admin/pages/UserManagement/userManagementData';
import { findCountryByCode } from '../../../../../data/globalCountries';
import { buildAutoEventthonSocialLink } from '../../../../../data/globalSocialLinksRegistry';
import EditProfileLivePreviewAside from './EditProfileLivePreviewAside';
import EditProfileLivePreviewHero from './EditProfileLivePreviewHero';
import EditProfileLivePreviewSections from './EditProfileLivePreviewSections';
import {
  bioLooksLikeHtml,
  DEFAULT_ABOUT,
  resolvePreviewMedia,
  stripBioToPlain,
} from './livePreviewUtils';
import { isVerificationApproved } from '../verificationStatus';
import '../editProfileLayout.css';

/**
 * Right column: full profile preview driven by draft (live updates).
 * Inner scroll area follows `focusStepId` from the center column — smooth scroll to matching section.
 */
const EditProfileLivePreview = ({ draft, userData, focusStepId = 'basic' }) => {
  const scrollRef = useRef(null);

  const displayName = useMemo(() => {
    const joined = [draft.firstName, draft.lastName].filter(Boolean).join(' ').trim();
    if (joined) return joined;
    return draft.fullName?.trim() || 'Your name';
  }, [draft.firstName, draft.lastName, draft.fullName]);

  const headline = draft.headline?.trim() || 'Professional headline';

  const locationLabel = useMemo(() => {
    const cityPart = draft.city?.trim();
    const code = draft.countryCode?.trim()?.toUpperCase();
    const countryName = code ? findCountryByCode(code)?.name : '';
    if (cityPart && countryName) return `${cityPart}, ${countryName}`;
    if (countryName) return countryName;
    if (cityPart) return cityPart;
    return 'Location';
  }, [draft.city, draft.countryCode]);

  const avatar =
    draft.profileImageUrl ||
    `https://api.dicebear.com/8.x/avataaars/svg?seed=${encodeURIComponent(displayName)}`;

  const coverUrl = useMemo(() => resolvePreviewMedia(draft.coverImageUrl || ''), [draft.coverImageUrl]);

  const previewSocialLinks = useMemo(() => {
    const list = Array.isArray(draft.socialLinks) ? draft.socialLinks : [];
    const user = list.filter((x) => String(x.url || '').trim());
    const auto = buildAutoEventthonSocialLink(userData);
    return auto ? [...user, auto] : user;
  }, [draft.socialLinks, userData]);

  const rawBio = (draft.bio || '').trim();
  const bioIsRich = bioLooksLikeHtml(rawBio);
  const aboutPlainFallback = stripBioToPlain(rawBio) || DEFAULT_ABOUT;

  const skillTags = Array.isArray(draft.skills) && draft.skills.length ? draft.skills.filter(Boolean) : [];
  const subSkillTags = Array.isArray(draft.skillSubcategories) ? draft.skillSubcategories.filter(Boolean) : [];
  const languageTags = Array.isArray(draft.languages) ? draft.languages.filter(Boolean) : [];
  const educationList = Array.isArray(draft.educations) ? draft.educations : [];

  const skillEntries = useMemo(() => {
    const raw = Array.isArray(draft.skillEntries) ? draft.skillEntries : [];
    return raw.filter((e) => String(e?.name || '').trim());
  }, [draft.skillEntries]);

  const primaryNiche = String(draft.primaryNiche || draft.niche || '').trim();
  const subNiche = String(draft.subNiche || '').trim();

  const experiencePreviewList = Array.isArray(draft.experiences)
    ? draft.experiences.filter((x) => String(x.role || '').trim() || String(x.company || '').trim())
    : [];

  const projectsPreviewList = useMemo(() => {
    const raw = Array.isArray(draft.projects) ? draft.projects : [];
    return raw.filter((p) => String(p.title || '').trim() || String(p.desc || '').trim());
  }, [draft.projects]);

  const projectsStatCount = useMemo(() => {
    const raw = Array.isArray(draft.projects) ? draft.projects : [];
    return String(raw.filter((p) => String(p.title || '').trim()).length);
  }, [draft.projects]);

  const availabilityLabel =
    draft.availability === 'available'
      ? 'Available for Work'
      : draft.availability === 'busy'
        ? 'Busy'
        : 'Not visible';

  const idVerified = isVerificationApproved(userData);
  const rankMeta = getRankMeta(userData?.rank || 'frontline');
  const badgeProps = rankCodeToBadgeProps(rankMeta.code, { label: rankMeta.label });

  const availDot =
    draft.availability === 'available'
      ? 'bg-emerald-500'
      : draft.availability === 'busy'
        ? 'bg-amber-400'
        : 'bg-slate-500';

  useEffect(() => {
    const id = window.requestAnimationFrame(() => {
      const root = scrollRef.current;
      if (!root) return;
      const pad = 10;
      const target = root.querySelector(`#ep-preview-section-${focusStepId}`);
      if (!target) {
        root.scrollTo({ top: 0, behavior: 'smooth' });
        return;
      }
      const top =
        target.getBoundingClientRect().top -
        root.getBoundingClientRect().top +
        root.scrollTop -
        pad;
      root.scrollTo({ top: Math.max(0, top), behavior: 'smooth' });
    });
    return () => window.cancelAnimationFrame(id);
  }, [focusStepId]);

  return (
    <div className="ep-live-preview ep-root">
      <div className="ep-live-preview__header">
        <div>
          <p className="ep-live-preview__eyebrow">Live Preview</p>
          <p className="ep-live-preview__tagline">See how your profile looks to others.</p>
        </div>
        <Link to="/profile/view" className="ep-live-preview__link-btn">
          <span>Preview public profile</span>
          <FiExternalLink className="ep-live-preview__link-icon" aria-hidden />
        </Link>
      </div>

      <div className="ep-live-preview__card">
        <div ref={scrollRef} className="ep-live-preview__body-scroll" tabIndex={-1}>
          <EditProfileLivePreviewHero
            focusStepId={focusStepId}
            coverUrl={coverUrl}
            avatar={avatar}
            badgeProps={badgeProps}
            idVerified={idVerified}
            displayName={displayName}
            headline={headline}
            previewSocialLinks={previewSocialLinks}
            locationLabel={locationLabel}
            availDot={availDot}
            availabilityLabel={availabilityLabel}
            projectsStatCount={projectsStatCount}
          />

          <div className="ep-live-preview__detail-grid">
            <div className="ep-live-preview__main">
              <EditProfileLivePreviewSections
                rawBio={rawBio}
                bioIsRich={bioIsRich}
                aboutPlainFallback={aboutPlainFallback}
                skillTags={skillTags}
                subSkillTags={subSkillTags}
                skillEntries={skillEntries}
                languageTags={languageTags}
                educationList={educationList}
                primaryNiche={primaryNiche}
                subNiche={subNiche}
                experiencePreviewList={experiencePreviewList}
                projectsPreviewList={projectsPreviewList}
                focusStepId={focusStepId}
              />
            </div>
            <EditProfileLivePreviewAside focusStepId={focusStepId} />
          </div>

          {idVerified ? (
            <div className="ep-live-preview__trust-strip" aria-label="Trust and verification">
              {['Identity verified', 'Email verified', 'Phone verified', 'Admin approved'].map((label) => (
                <div key={label} className="ep-live-preview__trust-item">
                  <FiCheck className="ep-live-preview__trust-check" aria-hidden strokeWidth={3} />
                  <span>{label}</span>
                </div>
              ))}
            </div>
          ) : null}

          <div className="ep-live-preview__footer-cta">
            <Link to="/profile/view" className="ep-live-preview__view-full-btn">
              View full profile
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditProfileLivePreview;
