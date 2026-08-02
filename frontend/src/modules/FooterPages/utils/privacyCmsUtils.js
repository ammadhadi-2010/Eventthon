import {
  PRIVACY_INTRO,
  PRIVACY_LAST_UPDATED,
  PRIVACY_SECTIONS,
} from '../data/privacyData';

export const DEFAULT_PRIVACY_LINKS = [
  { label: 'Support Center', href: '/company/contact' },
  { label: 'Help Center', href: '/resources/help' },
  { label: 'Contact Form', href: '/company/contact' },
];

export function sectionKind(label = '', id = '') {
  const t = `${id} ${label}`.toLowerCase();
  if (t.includes('contact us') || id === 'contact') return 'contact';
  if (t.includes('updates to this policy') || id === 'updates') return 'paragraph';
  return 'bullets';
}

function linesFromSection(section) {
  if (Array.isArray(section.bullets) && section.bullets.length) return section.bullets;
  if (Array.isArray(section.paragraphs) && section.paragraphs.length) {
    return section.paragraphs.flatMap((p) =>
      String(p)
        .split(/\n/)
        .map((s) => s.trim())
        .filter(Boolean),
    );
  }
  if (section.body) return [String(section.body)];
  return [];
}

/** Normalize CMS / default section → public card model. */
export function normalizePrivacyCard(section = {}, index = 0) {
  const label = section.label || `Section ${index + 1}`;
  const id = section.id || `sec-${index}`;
  const kind = section.kind || sectionKind(label, id);
  const lines = linesFromSection(section).map((l) => String(l).replace(/^[-*•]\s*/, '').trim()).filter(Boolean);

  if (kind === 'paragraph') {
    const body =
      String(section.body || '').trim() ||
      lines.join(' ') ||
      'We may update this Privacy Policy. When significant changes are made, users will be notified inside EventThon.';
    return { id, label, kind, body };
  }

  if (kind === 'contact') {
    let lead = String(section.lead || '').trim();
    let email = String(section.email || '').trim();
    const links = Array.isArray(section.links) ? [...section.links] : [];

    lines.forEach((line) => {
      const lower = line.toLowerCase();
      if (lower.startsWith('lead:')) lead = line.slice(5).trim();
      else if (lower.startsWith('email:')) email = line.slice(6).trim().replace(/^email:\s*/i, '');
      else if (lower.startsWith('link:')) {
        const rest = line.slice(5).trim();
        const pipe = rest.indexOf('|');
        if (pipe === -1) links.push({ label: rest, href: '#' });
        else links.push({ label: rest.slice(0, pipe).trim(), href: rest.slice(pipe + 1).trim() || '#' });
      } else if (line.includes('@') && !email) email = line.replace(/^email:\s*/i, '').trim();
    });

    return {
      id,
      label,
      kind,
      lead: lead || 'For privacy-related questions:',
      email: email || 'privacy@eventthon.com',
      links: (links.length ? links : DEFAULT_PRIVACY_LINKS).slice(0, 3).map((l) => ({
        label: String(l.label || '').trim() || 'Link',
        href: String(l.href || '').trim() || '#',
      })),
    };
  }

  return {
    id,
    label,
    kind: 'bullets',
    bullets: lines.length ? lines : ['Details coming soon.'],
  };
}

/** Parse ## Section blocks (bullets = lines, -/* stripped). */
export function parsePrivacySections(content) {
  const text = String(content || '').trim();
  if (!text) return [];

  if (!/^## /m.test(text)) {
    return [{ id: 'legacy', label: 'Policy', kind: 'bullets', bullets: text.split(/\n/).map((l) => l.replace(/^[-*•]\s*/, '').trim()).filter(Boolean) }];
  }

  return text
    .split(/^## /m)
    .filter(Boolean)
    .map((block, index) => {
      const nl = block.indexOf('\n');
      const label = (nl === -1 ? block : block.slice(0, nl)).trim();
      const body = (nl === -1 ? '' : block.slice(nl + 1)).trim();
      const bullets = body.split(/\n/).map((line) => line.replace(/^[-*•]\s*/, '').trim()).filter(Boolean);
      const kind = sectionKind(label, `sec-${index}`);
      if (kind === 'paragraph') {
        return { id: `sec-${index}`, label, kind, body: bullets.join(' '), bullets: [] };
      }
      if (kind === 'contact') {
        return normalizePrivacyCard({ id: `sec-${index}`, label, kind, bullets }, index);
      }
      return { id: `sec-${index}`, label: label || `Section ${index + 1}`, kind: 'bullets', bullets };
    })
    .filter((s) => s.label);
}

export function serializePrivacySections(sections = []) {
  return sections
    .map((section) => {
      const label = String(section.label || '').trim();
      if (!label) return '';
      const kind = section.kind || sectionKind(label, section.id);

      if (kind === 'paragraph') {
        const body = String(section.body || (section.bullets || []).join(' ')).trim();
        return [`## ${label}`, body].filter(Boolean).join('\n');
      }

      if (kind === 'contact') {
        const card = normalizePrivacyCard(section, 0);
        return [
          `## ${label}`,
          `lead: ${card.lead}`,
          `email: ${card.email}`,
          ...card.links.map((l) => `link: ${l.label}|${l.href}`),
        ].join('\n');
      }

      const lines = (section.bullets || [])
        .map((b) => String(b || '').trim())
        .filter(Boolean)
        .map((b) => `- ${b}`);
      return [`## ${label}`, ...lines].join('\n');
    })
    .filter(Boolean)
    .join('\n\n');
}

export function emptyPrivacySection() {
  return { id: `new-${Date.now()}`, label: '', kind: 'bullets', bullets: [''] };
}

export function defaultPrivacyFormFields() {
  return {
    title: 'Privacy Policy',
    policyVersion: PRIVACY_LAST_UPDATED,
    excerpt: PRIVACY_INTRO,
    content: serializePrivacySections(PRIVACY_SECTIONS),
  };
}
