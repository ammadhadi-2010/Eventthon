import { CASE_CATEGORIES, CASE_STUDIES } from '../data/caseStudiesData';

export const CASE_CATEGORY_OPTIONS = CASE_CATEGORIES.filter((c) => c.id !== 'all');

export function serializeCaseContent({ summary = '', metrics = [] } = {}) {
  const s = String(summary || '').trim();
  const lines = (metrics || [])
    .map((m) => `${String(m.value || '').trim()}|${String(m.label || '').trim()}`)
    .filter((line) => line !== '|');
  if (!lines.length) return s;
  return `## summary\n${s}\n\n## metrics\n${lines.join('\n')}`.trim();
}

export function parseCaseContent(content) {
  const text = String(content || '').trim();
  if (!text) return { summary: '', metrics: [] };

  const summaryMatch = text.match(/##\s*summary\s*\n([\s\S]*?)(?=\n##\s*metrics\b|$)/i);
  const metricsMatch = text.match(/##\s*metrics\s*\n([\s\S]*)$/i);
  if (summaryMatch || metricsMatch) {
    const metrics = String(metricsMatch?.[1] || '')
      .split('\n')
      .map((line) => line.trim())
      .filter(Boolean)
      .map((line) => {
        const [value, label] = line.split('|').map((p) => p.trim());
        return { value: value || '', label: label || '' };
      })
      .filter((m) => m.value);
    return { summary: (summaryMatch?.[1] || '').trim(), metrics };
  }

  const pipe = text.split('\n').map((l) => l.trim()).filter(Boolean);
  const firstPipe = pipe.find((l) => l.includes('|'));
  if (firstPipe && pipe.length <= 4) {
    return {
      summary: '',
      metrics: pipe.filter((l) => l.includes('|')).map((line) => {
        const [value, label] = line.split('|').map((p) => p.trim());
        return { value, label };
      }),
    };
  }
  return { summary: text, metrics: [] };
}

export function defaultCaseFormFields(caseId = 'agency-pro') {
  const item = CASE_STUDIES.find((c) => c.id === caseId) || CASE_STUDIES[0];
  const index = Math.max(0, CASE_STUDIES.findIndex((c) => c.id === item.id));
  return {
    title: item.title,
    excerpt: item.categoryLabel || 'Business',
    pricingLabel: item.category || 'business',
    content: serializeCaseContent({ summary: item.summary, metrics: item.metrics }),
    authorName: item.author || 'EventThon Team',
    authorAvatarUrl: item.authorAvatar || '',
    imageurl: item.imageurl || '',
    readTime: item.readTime || '6 min read',
    policyVersion: item.date || '',
    sidebarOrder: item.featured ? 0 : 10 + index,
  };
}
