const STORAGE_KEY = 'et_referral_code';

function isMobileDevice() {
  if (typeof navigator === 'undefined') return false;
  return /Android|iPhone|iPad|iPod|Mobile/i.test(navigator.userAgent || '');
}

export function captureReferralFromUrl(search = '') {
  if (typeof window === 'undefined') return '';
  const params = new URLSearchParams(search || window.location.search);
  const ref = String(params.get('ref') || params.get('referral') || '').trim();
  if (!ref) return getStoredReferralCode();
  const code = ref.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 16);
  if (code) localStorage.setItem(STORAGE_KEY, code);
  return code;
}

export function getStoredReferralCode() {
  if (typeof window === 'undefined') return '';
  return String(localStorage.getItem(STORAGE_KEY) || '').trim();
}

export function clearStoredReferralCode() {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(STORAGE_KEY);
}

export function buildReferralLink(code) {
  const origin = typeof window !== 'undefined' ? window.location.origin : 'https://eventthone.com';
  const safe = String(code || '').trim();
  return `${origin}/?ref=${encodeURIComponent(safe)}`;
}

export function buildReferralShareText(link, { inviterName = '', lang = 'en' } = {}) {
  const name = String(inviterName || '').trim();
  const byLine = name ? (lang === 'ur' ? `${name} aap ko invite kar raha/rahi hai.` : `${name} invited you.`) : '';
  if (lang === 'ur') {
    return [byLine, 'EventThon par join karein — squads, gigs aur projects ek hi platform par. Free signup:', link]
      .filter(Boolean)
      .join('\n');
  }
  return [
    byLine,
    'Join me on EventThon — squads, gigs, projects & collaboration in one place. Free to join:',
    link,
  ]
    .filter(Boolean)
    .join('\n');
}

export const REFERRAL_SHARE_MESSAGES = {
  en: (link, inviterName = '') => buildReferralShareText(link, { inviterName, lang: 'en' }),
  ur: (link, inviterName = '') => buildReferralShareText(link, { inviterName, lang: 'ur' }),
};

export function whatsAppShareUrl(text) {
  const encoded = encodeURIComponent(text);
  // Mobile: opens WhatsApp app when installed; stays in current browser otherwise.
  if (isMobileDevice()) {
    return `https://api.whatsapp.com/send?text=${encoded}`;
  }
  return `https://web.whatsapp.com/send?text=${encoded}`;
}

export function facebookShareUrl(link) {
  return `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(link)}`;
}

export function xShareUrl(link, text = '') {
  const params = new URLSearchParams();
  if (text) params.set('text', text);
  params.set('url', link);
  return `https://twitter.com/intent/tweet?${params.toString()}`;
}

/**
 * Open external share/auth URLs in a new tab of the CURRENT browser.
 * Never use a fixed window name — that reuses an old Opera/Chrome window.
 */
export function openBrowserShareWindow(url) {
  if (!url || typeof window === 'undefined') return;

  const link = document.createElement('a');
  link.href = url;
  link.target = '_blank';
  link.rel = 'noopener noreferrer';
  link.style.display = 'none';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

/** Same-tab open — use when a new tab still picks the wrong default browser. */
export function openBrowserShareSameTab(url) {
  if (!url || typeof window === 'undefined') return;
  window.location.assign(url);
}
