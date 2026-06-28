import React, { useRef, useState } from 'react';
import { FiArrowRight, FiCamera, FiChevronDown, FiGlobe, FiMapPin, FiPlus } from 'react-icons/fi';
import { GLOBAL_COUNTRIES } from '../../../../../data/globalCountries';
import {
  EDIT_PROFILE_MAX_LINKS,
  getEditProfileLinkMeta,
  newSocialLinkRow,
  sanitizeSocialLinksForSave,
} from '../../../../../data/editProfileSocialLinksConfig';
import { blobUrlToFile, updateProfileData, uploadUserImage } from '../../services/profileService';
import { validateProfileImageFile } from '../../utils/profileMedia';
import { persistUserSession } from '../../../../../utils/storedUser';
import CoverBannerCropModal from './CoverBannerCropModal';
import '../editProfileLayout.css';

const HEADLINE_MAX = 80;

const EditProfileBasicFields = ({
  draft,
  setDraft,
  userIdentifier,
  refreshData,
  onContinue,
  onBasicSaveComplete,
}) => {
  const photoInputRef = useRef(null);
  const bannerInputRef = useRef(null);
  const set = (patch) => setDraft((d) => ({ ...d, ...patch }));

  const [bannerCropOpen, setBannerCropOpen] = useState(false);
  const [bannerCropSrc, setBannerCropSrc] = useState(null);
  const [saving, setSaving] = useState(false);

  const onPhotoFile = (e) => {
    const file = e.target.files?.[0];
    const err = validateProfileImageFile(file);
    if (err) {
      window.alert(err);
      e.target.value = '';
      return;
    }
    const url = URL.createObjectURL(file);
    set({ profileImageUrl: url });
    e.target.value = '';
  };

  const onBannerFile = (e) => {
    const file = e.target.files?.[0];
    const err = validateProfileImageFile(file);
    if (err) {
      window.alert(err);
      e.target.value = '';
      return;
    }
    const url = URL.createObjectURL(file);
    setBannerCropSrc((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      return url;
    });
    setBannerCropOpen(true);
    e.target.value = '';
  };

  const closeBannerCrop = () => {
    setBannerCropOpen(false);
    setBannerCropSrc((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      return null;
    });
  };

  const applyBannerCrop = (croppedUrl) => {
    setDraft((d) => {
      if (d.coverImageUrl?.startsWith('blob:')) URL.revokeObjectURL(d.coverImageUrl);
      return { ...d, coverImageUrl: croppedUrl };
    });
    setBannerCropSrc((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      return null;
    });
    setBannerCropOpen(false);
  };

  const syncNameParts = (full) => {
    const t = full.trim();
    if (!t) return { fullName: '', firstName: '', lastName: '' };
    const parts = t.split(/\s+/);
    return {
      fullName: full,
      firstName: parts[0] || '',
      lastName: parts.slice(1).join(' ') || '',
    };
  };

  const availDotClass =
    draft.availability === 'available'
      ? 'ep-avail-dot ep-avail-dot--green'
      : draft.availability === 'busy'
        ? 'ep-avail-dot ep-avail-dot--amber'
        : 'ep-avail-dot ep-avail-dot--slate';

  const socialLinks = Array.isArray(draft.socialLinks) ? draft.socialLinks : [];

  const updateLinkRow = (id, patch) => {
    setDraft((d) => ({
      ...d,
      socialLinks: (Array.isArray(d.socialLinks) ? d.socialLinks : []).map((row) =>
        row.id === id ? { ...row, ...patch } : row
      ),
    }));
  };

  const removeLinkRow = (id) => {
    setDraft((d) => ({
      ...d,
      socialLinks: (Array.isArray(d.socialLinks) ? d.socialLinks : []).filter((row) => row.id !== id),
    }));
  };

  const addLinkRow = () => {
    setDraft((d) => {
      const cur = Array.isArray(d.socialLinks) ? d.socialLinks : [];
      if (cur.length >= EDIT_PROFILE_MAX_LINKS) return d;
      return { ...d, socialLinks: [...cur, newSocialLinkRow('website')] };
    });
  };

  const linkMeta = getEditProfileLinkMeta();
  const canAddAnotherLink = socialLinks.length < EDIT_PROFILE_MAX_LINKS;

  const saveAndContinue = async () => {
    if (!userIdentifier) {
      window.alert('You must be logged in to save your profile.');
      return;
    }
    setSaving(true);
    try {
      if (draft.profileImageUrl?.startsWith('blob:')) {
        const file = await blobUrlToFile(draft.profileImageUrl, 'profile.jpg');
        const uploaded = await uploadUserImage(file, 'profile', userIdentifier);
        if (uploaded?.imageurl) {
          persistUserSession({ imageurl: uploaded.imageurl, profile_image_url: uploaded.imageurl, avatar: uploaded.imageurl });
        }
      }
      if (draft.coverImageUrl?.startsWith('blob:')) {
        const file = await blobUrlToFile(draft.coverImageUrl, 'banner.jpg');
        const uploaded = await uploadUserImage(file, 'banner', userIdentifier);
        if (uploaded?.url || uploaded?.imageurl) {
          const bannerUrl = uploaded.url || uploaded.imageurl;
          persistUserSession({ banner: bannerUrl });
        }
      }

      const socialList = sanitizeSocialLinksForSave(draft.socialLinks);
      const websiteUrl = socialList.find((x) => x.platform === 'website')?.url ?? '';

      await updateProfileData(userIdentifier, {
        first_name: draft.firstName ?? '',
        last_name: draft.lastName ?? '',
        headline: draft.headline ?? '',
        city: draft.city ?? '',
        country: draft.countryCode ?? '',
        availability: draft.availability ?? 'available',
        social_links: socialList,
        ...(websiteUrl ? { link_website: websiteUrl } : {}),
      });
      if (typeof refreshData === 'function') {
        await refreshData();
      }
      if (typeof onBasicSaveComplete === 'function') {
        onBasicSaveComplete();
      }
      if (onContinue) {
        onContinue();
        return;
      }
      document.getElementById('edit-section-about')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
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
    <div className="ep-basic-form ep-root">
      <CoverBannerCropModal
        open={bannerCropOpen}
        imageSrc={bannerCropSrc}
        onClose={closeBannerCrop}
        onApply={applyBannerCrop}
      />
      <input
        ref={photoInputRef}
        type="file"
        accept="image/jpeg,image/png,image/gif,image/webp"
        className="ep-basic-file-input"
        aria-hidden
        tabIndex={-1}
        onChange={onPhotoFile}
      />
      <input
        ref={bannerInputRef}
        type="file"
        accept="image/jpeg,image/png,image/gif,image/webp"
        className="ep-basic-file-input"
        aria-hidden
        tabIndex={-1}
        onChange={onBannerFile}
      />

      {/* Profile photo + Cover banner */}
      <div className="ep-basic-media-grid">
        <div className="ep-basic-media-col">
          <p className="ep-basic-label-title">Profile Photo</p>
          <div className="flex flex-col items-center sm:items-start">
            <div className="relative shrink-0">
              <div className="ep-basic-avatar-ring flex h-[7.5rem] w-[7.5rem] items-center justify-center overflow-hidden rounded-full border-2 border-white/[0.14] bg-[rgba(15,23,42,0.6)] shadow-inner shadow-black/40 ring-2 ring-violet-500/20">
                {draft.profileImageUrl ? (
                  <img src={draft.profileImageUrl} alt="" className="h-full w-full object-cover" />
                ) : (
                  <FiCamera className="ep-basic-avatar-placeholder-icon" aria-hidden />
                )}
              </div>
              <button
                type="button"
                className="absolute bottom-0 right-0 flex h-8 w-8 items-center justify-center rounded-full border border-white/15 bg-[#1e1b4b]/95 text-violet-200 shadow-lg shadow-violet-950/50 ring-1 ring-white/10 transition hover:bg-[#312e81] hover:text-white"
                aria-label="Upload profile photo"
                onClick={() => photoInputRef.current?.click()}
              >
                <FiCamera size={15} strokeWidth={2} />
              </button>
            </div>
            <p className="ep-basic-media__hint mt-3 max-w-[13rem] text-center sm:text-left">
              JPG, PNG or GIF. Max size 2MB.
            </p>
          </div>
        </div>

        <div className="ep-basic-media-col min-w-0">
          <p className="ep-basic-label-title">Cover Banner</p>
          <div className="ep-basic-banner relative overflow-hidden rounded-xl border border-white/[0.08] shadow-lg shadow-black/30">
            {draft.coverImageUrl ? (
              <img src={draft.coverImageUrl} alt="" className="absolute inset-0 z-0 h-full w-full object-cover" />
            ) : null}
            <div className="ep-basic-banner__glow pointer-events-none absolute inset-0 z-[1]" aria-hidden />
            <div
              className="pointer-events-none absolute inset-0 z-[1] opacity-[0.35]"
              style={{
                backgroundImage: `radial-gradient(ellipse 80% 60% at 70% 40%, rgba(167, 139, 250, 0.45), transparent 55%),
                  radial-gradient(ellipse 50% 40% at 20% 80%, rgba(99, 102, 241, 0.35), transparent 50%)`,
              }}
            />
            <div className="pointer-events-none absolute inset-0 z-[1] bg-gradient-to-br from-[#1e1b4b]/92 via-[#312e81]/88 to-[#0f172a]/92" />
            <button
              type="button"
              className="absolute bottom-3 right-3 z-[2] flex h-9 w-9 items-center justify-center rounded-full border border-white/20 bg-black/50 text-violet-100 shadow-md backdrop-blur-sm transition hover:bg-black/65 hover:text-white"
              aria-label="Upload cover banner"
              onClick={() => bannerInputRef.current?.click()}
            >
              <FiCamera size={16} strokeWidth={2} />
            </button>
          </div>
        </div>
      </div>

      {/* Two columns × two rows */}
      <div className="ep-basic-fields-grid grid grid-cols-1 md:grid-cols-2">
        <div className="min-w-0">
          <label className="ep-field-label">Full Name</label>
          <input
            className="ep-input ep-input--solid"
            value={draft.fullName ?? [draft.firstName, draft.lastName].filter(Boolean).join(' ')}
            onChange={(e) => set(syncNameParts(e.target.value))}
            placeholder="Ahmad Salman"
            autoComplete="name"
          />
        </div>
        <div className="min-w-0">
          <label className="ep-field-label">Headline</label>
          <div className="relative">
            <input
              className="ep-input ep-input--solid ep-input--counter pr-14"
              value={draft.headline}
              onChange={(e) => set({ headline: e.target.value.slice(0, HEADLINE_MAX) })}
              placeholder="Full Stack Developer | Building Scalable Web Applications"
            />
            <span className="ep-basic-counter pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 tabular-nums">
              {(draft.headline || '').length}/{HEADLINE_MAX}
            </span>
          </div>
        </div>
        <div className="min-w-0">
          <label className="ep-field-label">City</label>
          <div className="relative">
            <FiMapPin className="ep-basic-input-icon pointer-events-none absolute left-3 top-1/2 z-[1] -translate-y-1/2" />
            <input
              className="ep-input ep-input--solid pl-10"
              value={draft.city}
              onChange={(e) => set({ city: e.target.value })}
              placeholder="Lahore"
              autoComplete="address-level2"
            />
          </div>
        </div>
        <div className="min-w-0">
          <label className="ep-field-label">Country</label>
          <div className="relative">
            <FiGlobe className="ep-basic-input-icon pointer-events-none absolute left-3 top-1/2 z-[1] -translate-y-1/2" />
            <select
              className="ep-input ep-input--solid ep-select appearance-none pl-10 pr-10"
              value={draft.countryCode || ''}
              onChange={(e) => set({ countryCode: e.target.value })}
              aria-label="Country"
            >
              <option value="">Select country</option>
              {GLOBAL_COUNTRIES.map(({ code, name }) => (
                <option key={code} value={code}>
                  {name}
                </option>
              ))}
            </select>
            <FiChevronDown className="ep-basic-input-icon pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 opacity-80" />
          </div>
        </div>
        <div className="min-w-0 md:col-span-2">
          <label className="ep-field-label">Availability Status</label>
          <div className="relative">
            <span className={`pointer-events-none absolute left-3 top-1/2 z-[1] -translate-y-1/2 ${availDotClass}`} />
            <select
              className="ep-input ep-input--solid ep-select appearance-none pl-9 pr-10"
              value={draft.availability}
              onChange={(e) => set({ availability: e.target.value })}
            >
              <option value="available">Available for Work</option>
              <option value="busy">Busy</option>
              <option value="hidden">Not visible</option>
            </select>
            <FiChevronDown className="ep-basic-input-icon pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 opacity-80" />
          </div>
        </div>
      </div>

      {/* Links — max 2 company websites (full platform list: globalSocialLinksRegistry.js) */}
      <div className="ep-basic-links">
        <label className="ep-field-label">Links</label>
        <p className="mt-1 text-[11px] leading-snug text-slate-500">
          Up to {EDIT_PROFILE_MAX_LINKS} company website URLs. When your profile is verified, your EventThon profile
          link is added automatically.
        </p>
        <div className="ep-basic-links-list mt-3">
          {socialLinks.map((row, idx) => {
            const Icon = linkMeta.Icon;
            return (
              <div key={row.id} className="ep-basic-link-row ep-basic-link-row--social">
                <div className="ep-basic-link-meta ep-basic-link-meta--platform ep-basic-link-meta--fixed">
                  <Icon className="ep-basic-link-icon" aria-hidden />
                  <span className="ep-basic-link-name">
                    {linkMeta.label}
                    {socialLinks.length > 1 ? ` (${idx + 1})` : ''}
                  </span>
                </div>
                <input
                  className="ep-input ep-input--solid ep-basic-link-url min-w-0 flex-1"
                  placeholder={linkMeta.placeholder}
                  value={row.url}
                  onChange={(e) => updateLinkRow(row.id, { url: e.target.value })}
                  inputMode="url"
                  autoComplete="url"
                />
                <button
                  type="button"
                  className="ep-basic-link-remove"
                  aria-label="Remove link"
                  onClick={() => removeLinkRow(row.id)}
                >
                  ×
                </button>
              </div>
            );
          })}
          <button
            type="button"
            className="ep-basic-add-link"
            onClick={addLinkRow}
            disabled={!canAddAnotherLink}
          >
            <FiPlus className="h-3.5 w-3.5" aria-hidden />
            {canAddAnotherLink ? 'Add another link' : `Maximum ${EDIT_PROFILE_MAX_LINKS} links`}
          </button>
        </div>
      </div>

      <div className="ep-basic-footer">
        <button
          type="button"
          className="ep-btn-save-continue"
          onClick={saveAndContinue}
          disabled={saving}
        >
          {saving ? 'Saving…' : 'Save & Continue'}
          <FiArrowRight className="h-4 w-4" aria-hidden />
        </button>
      </div>
    </div>
  );
};

export default EditProfileBasicFields;
