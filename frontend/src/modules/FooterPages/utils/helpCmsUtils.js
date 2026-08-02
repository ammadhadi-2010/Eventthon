import {
  FEATURED_ARTICLES,
  FAQ_ITEMS,
  HELP_CATEGORIES,
  HELP_STATUS,
  HELP_SUBTITLE,
} from '../data/helpCenterData';

export function serializeHelpContent({
  categories = HELP_CATEGORIES,
  featured = FEATURED_ARTICLES,
  faq = FAQ_ITEMS,
  status = HELP_STATUS,
} = {}) {
  const catLines = categories
    .map((c) => `${c.id}|${c.label}|${c.icon || 'zap'}|${c.to || ''}`)
    .join('\n');
  const featLines = featured
    .map((a) => `${a.title}|${a.category}|${a.summary || ''}|${(a.body || '').replace(/\n/g, ' ')}`)
    .join('\n');
  const faqLines = faq.map((f) => `${f.q}|${f.a}|${f.category || ''}`).join('\n');
  const statusLines = status
    .map((s) => `${s.id}|${s.label}|${s.online ? 'online' : 'offline'}`)
    .join('\n');
  return [
    '## categories',
    catLines,
    '',
    '## featured',
    featLines,
    '',
    '## faq',
    faqLines,
    '',
    '## status',
    statusLines,
  ].join('\n');
}

export function parseHelpContent(content) {
  const text = String(content || '');
  const section = (name) => {
    const re = new RegExp(`##\\s*${name}\\s*\\n([\\s\\S]*?)(?=\\n##\\s|$)`, 'i');
    return (text.match(re)?.[1] || '').trim();
  };
  const rows = (block, min = 2) =>
    block
      .split('\n')
      .map((l) => l.trim())
      .filter(Boolean)
      .map((l) => l.split('|').map((p) => p.trim()))
      .filter((p) => p.length >= min);

  const defaultById = Object.fromEntries(HELP_CATEGORIES.map((c) => [c.id, c]));
  const categories = rows(section('categories'), 2).map(([id, label, icon, to]) => {
    const base = defaultById[id] || {};
    return {
      id: id || 'general',
      label: label || id,
      icon: icon || base.icon || 'zap',
      ...(to || base.to ? { to: to || base.to } : {}),
    };
  });
  const featured = rows(section('featured'), 2).map(([title, category, summary, body], i) => ({
    id: `feat-${i}-${String(title || '').toLowerCase().replace(/[^a-z0-9]+/g, '-')}`,
    title,
    category: category || 'getting-started',
    summary: summary || '',
    body: body || summary || '',
  }));
  const faq = rows(section('faq'), 2).map(([q, a, category]) => ({
    q,
    a,
    category: category || '',
  }));
  const status = rows(section('status'), 2).map(([id, label, online]) => ({
    id,
    label: label || id,
    online: String(online || 'online').toLowerCase() !== 'offline',
  }));

  return {
    categories: categories.length ? categories : HELP_CATEGORIES,
    featured: featured.length ? featured : FEATURED_ARTICLES,
    faq: faq.length ? faq : FAQ_ITEMS,
    status: status.length ? status : HELP_STATUS,
  };
}

export function defaultHelpFormFields() {
  return {
    title: 'How can we help you?',
    excerpt: HELP_SUBTITLE,
    content: serializeHelpContent(),
    sidebarOrder: 0,
  };
}
