import { PLACEHOLDER_PROJECTS } from './viewFullProfileConstants';

export function fmtMemberSince(val) {
  const raw = val?.created_at ?? val?.createdAt ?? val?.joined_at;
  if (!raw) return '—';
  const d = new Date(typeof raw === 'string' || typeof raw === 'number' ? raw : String(raw));
  if (Number.isNaN(d.getTime())) return '—';
  return d.toLocaleDateString(undefined, { month: 'short', year: 'numeric' });
}

export function bioPlain(html) {
  if (!html || typeof html !== 'string') return '';
  return html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
}

/** Display headline on profile hero; fixes common typos from legacy data. */
export function formatHeroHeadline(raw) {
  const s = String(raw || '').trim();
  if (!s) return 'Add your title in Edit profile — role · expertise.';
  if (/^full\s+stock\s+devolper$/i.test(s)) return 'Full Stack Developer';
  return s;
}

export function fmtEarnings(n) {
  if (!Number.isFinite(n) || n <= 0) return '$0';
  if (n >= 1000) return `$${(n / 1000).toFixed(1)}K`;
  return `$${Math.round(n)}`;
}

export function buildFeaturedProjects(projects) {
  const list = Array.isArray(projects) ? projects : [];
  const real = list.filter((p) => String(p.title || '').trim()).slice(0, 3);
  if (real.length >= 3) return real;
  return [...real, ...PLACEHOLDER_PROJECTS.slice(real.length)].slice(0, 3);
}

export function perfRows(projectCount) {
  const n = Math.min(99, Math.max(0, Number(projectCount) || 0));
  return [...PERF_IMPORT, { label: 'Projects completed', value: `${n}+` }];
}

const PERF_IMPORT = [
  { label: 'Response time', value: '98%' },
  { label: 'On-time delivery', value: '100%' },
  { label: 'Repeat clients', value: '72%' },
  { label: 'Client satisfaction', value: '99%' },
];
