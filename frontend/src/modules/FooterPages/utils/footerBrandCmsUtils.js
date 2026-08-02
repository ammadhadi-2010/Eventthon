import {
  FOOTER_COPYRIGHT,
  FOOTER_DESCRIPTION,
  FOOTER_NEWSLETTER,
  FOOTER_PAYMENTS,
  FOOTER_SOCIAL,
  FOOTER_STATS,
  FOOTER_TAGLINE,
  FOOTER_VALUES,
} from '../../../components/Footer/footerData';

export const FOOTER_SOCIAL_OPTIONS = [
  { id: 'facebook', label: 'Facebook' },
  { id: 'x', label: 'X' },
  { id: 'linkedin', label: 'LinkedIn' },
  { id: 'discord', label: 'Discord' },
  { id: 'youtube', label: 'YouTube' },
  { id: 'instagram', label: 'Instagram' },
];

function sectionOf(text, name) {
  const re = new RegExp(`##\\s*${name}\\s*\\n([\\s\\S]*?)(?=\\n##\\s|$)`, 'i');
  return (String(text || '').match(re)?.[1] || '').trim();
}

function pipeRows(block) {
  return String(block || '')
    .split('\n')
    .map((l) => l.trim())
    .filter(Boolean)
    .map((l) => l.split('|').map((p) => p.trim()));
}

export function serializeFooterBrandContent({
  about = FOOTER_DESCRIPTION,
  social = FOOTER_SOCIAL,
  newsletter = FOOTER_NEWSLETTER,
  stats = FOOTER_STATS,
  values = FOOTER_VALUES,
  payments = FOOTER_PAYMENTS,
  copyright = FOOTER_COPYRIGHT,
} = {}) {
  const socialLines = social
    .map((s) => `${s.id}|${s.label || s.id}|${s.href || ''}`)
    .join('\n');
  const newsLines = [
    `title|${newsletter.title || ''}`,
    `desc|${newsletter.desc || ''}`,
    ...(newsletter.checks || []).map((c) => `check|${c}`),
  ].join('\n');
  const statLines = (stats || [])
    .map((s) => `${s.id}|${s.value}|${s.label}|${s.tone || 'violet'}`)
    .join('\n');
  const valueLines = (values || [])
    .map((v) => `${v.id}|${v.title}|${v.text}|${v.tone || 'violet'}`)
    .join('\n');
  const paymentLine = (payments || []).join('|');

  return [
    '## about',
    String(about || '').trim(),
    '',
    '## social',
    socialLines,
    '',
    '## newsletter',
    newsLines,
    '',
    '## stats',
    statLines,
    '',
    '## values',
    valueLines,
    '',
    '## payments',
    paymentLine,
    '',
    '## copyright',
    String(copyright || '').trim(),
  ].join('\n');
}

export function parseFooterBrandContent(content) {
  const about = sectionOf(content, 'about') || FOOTER_DESCRIPTION;

  const socialRows = pipeRows(sectionOf(content, 'social')).filter((p) => p.length >= 2 && p[0]);
  const social = socialRows.map(([id, label, href = '']) => ({
    id: id || 'link',
    label: label || id,
    href: href || '',
  }));

  const newsRows = pipeRows(sectionOf(content, 'newsletter'));
  let newsTitle = FOOTER_NEWSLETTER.title;
  let newsDesc = FOOTER_NEWSLETTER.desc;
  const checks = [];
  newsRows.forEach(([key, ...rest]) => {
    const val = rest.join('|').trim();
    if (key === 'title' && val) newsTitle = val;
    else if (key === 'desc' && val) newsDesc = val;
    else if (key === 'check' && val) checks.push(val);
  });
  const newsletter = {
    title: newsTitle,
    desc: newsDesc,
    checks: checks.length ? checks : [...FOOTER_NEWSLETTER.checks],
  };

  const stats = pipeRows(sectionOf(content, 'stats'))
    .filter((p) => p.length >= 3)
    .map(([id, value, label, tone = 'violet']) => ({ id, value, label, tone }));

  const values = pipeRows(sectionOf(content, 'values'))
    .filter((p) => p.length >= 3)
    .map(([id, title, text, tone = 'violet']) => ({ id, title, text, tone }));

  const paymentsRaw = sectionOf(content, 'payments');
  const payments = paymentsRaw
    ? paymentsRaw.split(/[|\n]/).map((p) => p.trim()).filter(Boolean)
    : [];

  const copyright = sectionOf(content, 'copyright') || FOOTER_COPYRIGHT;

  return {
    about,
    social: social.length ? social : FOOTER_SOCIAL.map((s) => ({ ...s })),
    newsletter,
    stats: stats.length ? stats : FOOTER_STATS.map((s) => ({ id: s.id, value: s.value, label: s.label, tone: s.tone })),
    values: values.length
      ? values
      : FOOTER_VALUES.map((v) => ({ id: v.id, title: v.title, text: v.text, tone: v.tone })),
    payments: payments.length ? payments : [...FOOTER_PAYMENTS],
    copyright,
  };
}

export function defaultFooterBrandFormFields() {
  return {
    title: 'EventThon',
    excerpt: FOOTER_TAGLINE,
    content: serializeFooterBrandContent(),
    sidebarOrder: 0,
  };
}

export function mapFooterBrandPage(rows = []) {
  const fallback = {
    brandName: 'EventThon',
    tagline: FOOTER_TAGLINE,
    description: FOOTER_DESCRIPTION,
    social: FOOTER_SOCIAL,
    newsletter: FOOTER_NEWSLETTER,
    stats: FOOTER_STATS,
    values: FOOTER_VALUES,
    payments: FOOTER_PAYMENTS,
    copyright: FOOTER_COPYRIGHT,
    fromCms: false,
  };
  if (!rows.length) return fallback;

  const row = rows[0];
  const parsed = parseFooterBrandContent(row.content);
  const social = parsed.social.filter((s) => /^https?:\/\//i.test(String(s.href || '').trim()));
  return {
    brandName: row.title?.trim() || 'EventThon',
    tagline: row.excerpt?.trim() || FOOTER_TAGLINE,
    description: parsed.about,
    social: social.length ? social : FOOTER_SOCIAL,
    newsletter: parsed.newsletter,
    stats: parsed.stats,
    values: parsed.values,
    payments: parsed.payments,
    copyright: parsed.copyright,
    fromCms: true,
  };
}
