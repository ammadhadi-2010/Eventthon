import { TEAM, TIMELINE } from '../data/aboutData';
import {
  parseAboutJourney,
  parseAboutTeam,
  parseFeedFlag,
  readableParagraphs,
  teamAccentFromIndex,
} from './aboutCmsUtils';
import { DEPARTMENTS, JOBS, CAREERS_SUBTITLE, formatEventThonJobTitle } from '../data/careersData';
import { PRIVACY_SECTIONS, TERMS_SECTIONS } from '../data/legalData';

export const DEFAULT_PRICING_TIERS = [
  { id: 'free', name: 'Free', price: { monthly: 0, yearly: 0 }, features: ['Basic squads', '5 projects', 'Community support'] },
  { id: 'pro', name: 'Pro Dev', price: { monthly: 29, yearly: 290 }, featured: true, features: ['Unlimited projects', 'Gig analytics', 'Priority support', 'API access'] },
  { id: 'ent', name: 'Enterprise Squad', price: { monthly: 99, yearly: 990 }, features: ['SSO', 'Dedicated success', 'Custom contracts', 'Audit logs'] },
];

export function splitMarkdownSections(content) {
  const text = String(content || '').trim();
  if (!text) return {};
  if (!/^## /m.test(text)) {
    return { _body: text };
  }
  const sections = {};
  text
    .split(/^## /m)
    .filter(Boolean)
    .forEach((block) => {
      const nl = block.indexOf('\n');
      const heading = (nl === -1 ? block : block.slice(0, nl)).trim().toLowerCase();
      const body = (nl === -1 ? '' : block.slice(nl + 1)).trim();
      sections[heading] = body;
    });
  return sections;
}

function parsePipeRows(text, minParts = 2) {
  return String(text || '')
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => line.split('|').map((p) => p.trim()))
    .filter((parts) => parts.length >= minParts);
}

function parseTimelineBlock(text) {
  return parsePipeRows(text, 3).map(([year, title, body]) => ({ year, title, text: body }));
}

function parseTeamBlock(text) {
  return parsePipeRows(text, 2).map(([name, role, initials]) => ({
    name,
    role,
    initials: initials || name.split(/\s+/).map((w) => w[0]).join('').slice(0, 2).toUpperCase(),
  }));
}

function paragraphsFromText(text) {
  return String(text || '')
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter(Boolean);
}

function slugify(value, fallback = 'item') {
  const slug = String(value || '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
  return slug || fallback;
}

function parsePricingAmount(raw) {
  const text = String(raw || '').trim();
  if (!text) return { monthly: 0, yearly: 0, display: '$0' };
  if (/^free$/i.test(text)) return { monthly: 0, yearly: 0, display: 'Free' };

  const pair = text.split('|').map((s) => s.trim());
  if (pair.length >= 2) {
    const monthly = Number(String(pair[0]).replace(/[^0-9.]/g, '')) || 0;
    const yearly = Number(String(pair[1]).replace(/[^0-9.]/g, '')) || 0;
    return { monthly, yearly, display: text.includes('$') ? text : `$${monthly}|$${yearly}` };
  }

  const num = Number(text.replace(/[^0-9.]/g, '')) || 0;
  return { monthly: num, yearly: num * 10, display: text.startsWith('$') ? text : `$${num}` };
}

export function mapAboutPage(rows = []) {
  const row = rows[0];
  if (!row) {
    return {
      subtitle: 'The story behind EventThon and the team building the elite creator network.',
      bodyParagraphs: [],
      timeline: TIMELINE,
      team: TEAM.map((member, index) => ({
        ...member,
        bio: '',
        avatarUrl: '',
        accent: teamAccentFromIndex(index),
      })),
      coverImage: '',
      feedJourneyEnabled: true,
      feedTeamEnabled: true,
      fromCms: false,
    };
  }

  const journeyFromJson = parseAboutJourney(row.aboutJourney).filter(
    (step) => step.year.trim() || step.title.trim() || step.text.trim(),
  );
  const teamFromJson = parseAboutTeam(row.aboutTeam).filter(
    (member) => member.name.trim() || member.role.trim(),
  );
  const bodyParagraphs = readableParagraphs(row.content);

  return {
    subtitle: row.excerpt?.trim() || 'The story behind EventThon and the team building the elite creator network.',
    bodyParagraphs,
    timeline: journeyFromJson.length ? journeyFromJson : TIMELINE,
    team: teamFromJson.length
      ? teamFromJson
      : TEAM.map((member, index) => ({
          ...member,
          bio: '',
          avatarUrl: '',
          accent: teamAccentFromIndex(index),
        })),
    coverImage: row.imageurl || '',
    feedJourneyEnabled: parseFeedFlag(row.aboutFeedJourney, true),
    feedTeamEnabled: parseFeedFlag(row.aboutFeedTeam, true),
    fromCms: true,
  };
}

export function mapPricingPage(rows = []) {
  if (!rows.length) return { tiers: DEFAULT_PRICING_TIERS, subtitle: 'Plans for solo creators, pro developers, and enterprise squads.', fromCms: false };

  const sorted = [...rows].sort((a, b) => (a.sidebarOrder || 0) - (b.sidebarOrder || 0));
  const tiers = sorted.map((row, index) => {
    const price = parsePricingAmount(row.pricingPrice);
    const features = String(row.pricingFeatures || '')
      .split('\n')
      .map((f) => f.trim())
      .filter(Boolean);
    return {
      id: row.slug || slugify(row.pricingLabel || row.title, `plan-${index}`),
      name: row.pricingLabel || row.title,
      price: { monthly: price.monthly, yearly: price.yearly },
      priceDisplay: price.display,
      featured: (row.sidebarOrder || 0) === 1 || index === 1,
      features: features.length ? features : [row.excerpt].filter(Boolean),
      excerpt: row.excerpt || '',
    };
  });

  return {
    tiers,
    subtitle: sorted.find((r) => r.excerpt)?.excerpt || 'Plans for solo creators, pro developers, and enterprise squads.',
    fromCms: true,
  };
}

export function mapCareersPage(rows = []) {
  if (!rows.length) {
    return {
      jobs: JOBS,
      departments: DEPARTMENTS,
      subtitle: CAREERS_SUBTITLE,
      fromCms: false,
    };
  }

  const sorted = [...rows].sort((a, b) => (a.sidebarOrder || 0) - (b.sidebarOrder || 0));
  const jobs = sorted.map((row, index) => {
    const roleName = String(row.jobTitle || row.title || '').trim() || 'Open Role';
    return {
      id: row.slug || slugify(roleName, `job-${index}`),
      roleName,
      title: formatEventThonJobTitle(roleName),
      dept: String(row.excerpt || '').trim() || 'General',
      location: row.jobLocation || 'Remote · Worldwide',
      type: 'Full-time',
      summary: row.content || '',
      applyUrl: row.externalUrl || '',
    };
  });

  const deptSet = new Set(jobs.map((j) => j.dept).filter(Boolean));
  const departments = ['All', ...Array.from(deptSet).sort()];

  return {
    jobs,
    departments,
    subtitle: CAREERS_SUBTITLE,
    fromCms: true,
  };
}

export function mapContactPage(rows = []) {
  const row = rows[0];
  const DEFAULT_INTRO = 'Reach the EventThon team for support, partnerships, or press.';
  const DEFAULT_LOCATION = ['1200 Innovation Drive, Suite 400', 'San Francisco, CA'];
  const DEFAULT_HOURS = 'Mon–Fri, 9:00 AM – 6:00 PM PST';

  if (!row) {
    return {
      subtitle: DEFAULT_INTRO,
      intro: DEFAULT_INTRO,
      context: '',
      contextParagraphs: [],
      email: 'hello@eventthon.com',
      phone: '',
      addressLines: DEFAULT_LOCATION,
      hours: DEFAULT_HOURS,
      fromCms: false,
    };
  }

  const sections = splitMarkdownSections(row.content || '');
  const addressFromMarkdown = sections.address || sections['office address'] || '';
  const hoursFromMarkdown = sections.hours || sections['office hours'] || '';

  // Prefer dedicated Location field; fall back to legacy ## Address in content
  const locationRaw = String(row.contactLocation || '').trim() || String(addressFromMarkdown || '').trim();
  const addressLines = locationRaw
    ? locationRaw.split('\n').map((l) => l.trim()).filter(Boolean)
    : DEFAULT_LOCATION;

  // Contact Context = plain body (strip ## Address / ## Hours blocks if still present)
  let contextText = String(row.content || '').trim();
  if (sections.address || sections['office address'] || sections.hours || sections['office hours']) {
    const body = sections._body || '';
    const other = Object.entries(sections)
      .filter(([key]) => !['_body', 'address', 'office address', 'hours', 'office hours'].includes(key))
      .map(([, bodyText]) => bodyText)
      .join('\n\n');
    contextText = [body, other].filter(Boolean).join('\n\n').trim();
  }

  const intro = String(row.excerpt || '').trim() || DEFAULT_INTRO;
  const hours =
    String(row.contactHours || '').trim() ||
    String(hoursFromMarkdown || '').trim() ||
    DEFAULT_HOURS;

  return {
    subtitle: intro,
    intro,
    context: contextText,
    contextParagraphs: paragraphsFromText(contextText),
    email: String(row.contactEmail || '').trim() || 'hello@eventthon.com',
    phone: String(row.contactPhone || '').trim(),
    addressLines,
    hours,
    fromCms: true,
  };
}

export function mapLegalPage(rows = [], fallbackSections = []) {
  const row = rows[0];
  if (!row?.content?.trim() && !String(row?.excerpt || '').trim()) {
    return {
      sections: fallbackSections,
      lastUpdated: row?.policyVersion?.trim() || 'May 24, 2026',
      intro: '',
      commitment: '',
      fromCms: false,
    };
  }

  const parsed = splitMarkdownSections(row?.content || '');
  const bodyIntro = (parsed._body || '').trim();
  delete parsed._body;

  const sectionEntries = Object.entries(parsed);
  const sections = sectionEntries.length
    ? sectionEntries.map(([heading, body], index) => {
        const bullets = body
          .split(/\n/)
          .map((line) => line.replace(/^[-*•]\s*/, '').trim())
          .filter(Boolean);
        const paragraphs = paragraphsFromText(body);
        return {
          id: slugify(heading, `section-${index}`),
          label: heading.replace(/\b\w/g, (c) => c.toUpperCase()),
          bullets: bullets.length ? bullets : undefined,
          paragraphs: paragraphs.length ? paragraphs : [body.trim()].filter(Boolean),
        };
      })
    : fallbackSections;

  return {
    sections: sections.length ? sections : fallbackSections,
    lastUpdated: row?.policyVersion?.trim() || 'May 24, 2026',
    intro: String(row?.excerpt || '').trim() || bodyIntro,
    commitment: String(row?.contactHours || '').trim(),
    fromCms: true,
  };
}
