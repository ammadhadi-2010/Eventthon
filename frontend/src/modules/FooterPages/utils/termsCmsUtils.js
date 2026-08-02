import {
  TERMS_COMMITMENT,
  TERMS_INTRO,
  TERMS_LAST_UPDATED,
  TERMS_SECTIONS,
} from '../data/termsData';
import { DEFAULT_PRIVACY_LINKS, normalizePrivacyCard } from './privacyCmsUtils';

export { DEFAULT_PRIVACY_LINKS as DEFAULT_TERMS_LINKS };

export function termsSectionKind(label = '', id = '') {
  const t = `${id} ${label}`.toLowerCase();
  if (t.includes('contact us') || id === 'contact') return 'contact';
  return 'paragraph';
}

/** Public card #18 (index 17) is always the Contact block. */
export function resolveTermsKind(section = {}, index = 0) {
  if (section.kind === 'contact' || termsSectionKind(section.label, section.id) === 'contact') {
    return 'contact';
  }
  if (index === 17) return 'contact';
  return 'paragraph';
}

/** Normalize CMS / default section → public Terms card. */
export function normalizeTermsCard(section = {}, index = 0) {
  const label = section.label || `Section ${index + 1}`;
  const id = section.id || `sec-${index}`;
  const kind = resolveTermsKind(section, index);
  const icon = section.icon || TERMS_SECTIONS[index]?.icon || 'check';

  if (kind === 'contact') {
    const contact = normalizePrivacyCard({ ...section, id, label, kind: 'contact' }, index);
    return {
      ...contact,
      email: contact.email?.includes('@') ? contact.email : 'legal@eventthon.com',
      lead: contact.lead || 'For legal questions about these Terms:',
      links: contact.links?.length ? contact.links : DEFAULT_PRIVACY_LINKS,
      icon: 'mail',
    };
  }

  const body =
    String(section.body || '').trim() ||
    (Array.isArray(section.paragraphs) ? section.paragraphs.join(' ') : '') ||
    (Array.isArray(section.bullets) ? section.bullets.join(' ') : '') ||
    'Details coming soon.';

  return { id, label, kind: 'paragraph', body, icon };
}

export function parseTermsSections(content) {
  const text = String(content || '').trim();
  if (!text) return [];
  if (!/^## /m.test(text)) {
    return [{ id: 'legacy', label: 'Terms', kind: 'paragraph', body: text, icon: 'check' }];
  }

  return text
    .split(/^## /m)
    .filter(Boolean)
    .map((block, index) => {
      const nl = block.indexOf('\n');
      const label = (nl === -1 ? block : block.slice(0, nl)).trim();
      const body = (nl === -1 ? '' : block.slice(nl + 1)).trim();
      const lines = body.split(/\n/).map((l) => l.replace(/^[-*•]\s*/, '').trim()).filter(Boolean);
      const kind = resolveTermsKind({ label, id: `sec-${index}` }, index);
      const icon = TERMS_SECTIONS[index]?.icon || 'check';
      if (kind === 'contact') {
        return normalizeTermsCard({ id: `sec-${index}`, label, kind, bullets: lines, icon }, index);
      }
      return { id: `sec-${index}`, label, kind: 'paragraph', body: lines.join(' '), icon };
    })
    .filter((s) => s.label);
}

export function serializeTermsSections(sections = []) {
  return sections
    .map((section, index) => {
      const label = String(section.label || '').trim();
      if (!label) return '';
      const kind = resolveTermsKind(section, index);
      if (kind === 'contact') {
        const card = normalizeTermsCard({ ...section, kind: 'contact' }, index);
        return [
          `## ${label}`,
          `lead: ${card.lead}`,
          `email: ${card.email}`,
          ...card.links.map((l) => `link: ${l.label}|${l.href}`),
        ].join('\n');
      }
      const body = String(
        section.body || (section.bullets || []).join(' ') || (section.paragraphs || []).join(' '),
      ).trim();
      return [`## ${label}`, body].filter(Boolean).join('\n');
    })
    .filter(Boolean)
    .join('\n\n');
}

export function emptyTermsSection() {
  return { id: `new-${Date.now()}`, label: '', kind: 'paragraph', body: '', icon: 'check' };
}

export function defaultTermsFormFields() {
  return {
    title: 'Terms of Service',
    policyVersion: TERMS_LAST_UPDATED,
    excerpt: TERMS_INTRO,
    content: serializeTermsSections(TERMS_SECTIONS),
    contactHours: TERMS_COMMITMENT,
  };
}
