export function pickWebsiteRow(socialLinks) {
  const rows = Array.isArray(socialLinks) ? socialLinks : [];
  const w = rows.find((r) => String(r.platform || '').toLowerCase() === 'website');
  const raw = (w?.url || '').trim();
  return raw ? { url: normalizeHref(raw), label: websiteHostLabel(raw) } : null;
}

export function normalizeHref(url) {
  const t = String(url || '').trim();
  if (!t) return '';
  if (/^https?:\/\//i.test(t)) return t;
  return `https://${t}`;
}

function websiteHostLabel(url) {
  const t = String(url || '').trim();
  if (!t) return '';
  try {
    const u = t.startsWith('http') ? new URL(t) : new URL(`https://${t}`);
    return u.hostname.replace(/^www\./, '');
  } catch {
    return t.replace(/^https?:\/\//i, '').split('/')[0];
  }
}

export function eventthonProfileHref() {
  if (typeof window === 'undefined') return '/profile/view';
  return `${window.location.origin}/profile/view`;
}

export function rankCardMeta(rankKey) {
  const k = String(rankKey || 'recruit').toLowerCase();
  if (k === 'specialist') return { code: 'E-4', subtitle: 'Field Specialist', pct: 72 };
  if (k === 'squad') return { code: 'E-6', subtitle: 'Squad Leader', pct: 86 };
  if (k === 'frontline') return { code: 'E-2', subtitle: 'Frontline Recruit', pct: 58 };
  return { code: 'E-1', subtitle: 'Recruit', pct: 44 };
}

export function formatStatK(n) {
  return n >= 1000 ? `${(n / 1000).toFixed(1)}K` : String(n);
}
