import {
  getSocialPlatformMeta,
  newSocialLinkRow,
} from './globalSocialLinksRegistry';

/** Max company links editable on Basic profile */
export const EDIT_PROFILE_MAX_LINKS = 2;

/** Only company website URLs (no WhatsApp / other platforms here) */
export const EDIT_PROFILE_LINK_PLATFORMS = ['website'];

const ALLOWED = new Set(EDIT_PROFILE_LINK_PLATFORMS);

export function getEditProfileLinkMeta() {
  const base = getSocialPlatformMeta('website');
  return { ...base, label: 'Company website' };
}

export function filterLinksForEditProfileDraft(rows) {
  if (!Array.isArray(rows)) return [];
  const out = rows
    .filter((x) => x && ALLOWED.has(String(x.platform || '').toLowerCase()))
    .map((x, i) => ({
      id: String(x.id || `sl-${i}-${Date.now()}`),
      platform: 'website',
      url: String(x.url || ''),
    }))
    .slice(0, EDIT_PROFILE_MAX_LINKS);
  return out;
}

export function sanitizeSocialLinksForSave(rows) {
  if (!Array.isArray(rows)) return [];
  return rows
    .map(({ id, platform, url }) => ({
      id: String(id),
      platform: 'website',
      url: String(url || '').trim(),
    }))
    .filter((x) => x.url.length > 0)
    .slice(0, EDIT_PROFILE_MAX_LINKS);
}

export { newSocialLinkRow };
