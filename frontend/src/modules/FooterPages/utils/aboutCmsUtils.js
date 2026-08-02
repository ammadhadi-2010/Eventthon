export const EMPTY_JOURNEY_STEP = { year: '', title: '', text: '' };
export const EMPTY_TEAM_MEMBER = { name: '', role: '', initials: '', avatarUrl: '', bio: '' };

export const TEAM_ACCENTS = [
  ['#6366f1', '#8b5cf6'],
  ['#ec4899', '#f97316'],
  ['#06b6d4', '#3b82f6'],
  ['#10b981', '#059669'],
  ['#f59e0b', '#ef4444'],
  ['#a855f7', '#6366f1'],
];

export function teamAccentFromIndex(index = 0) {
  const pair = TEAM_ACCENTS[Math.abs(Number(index) || 0) % TEAM_ACCENTS.length];
  return `linear-gradient(135deg, ${pair[0]}, ${pair[1]})`;
}

export function initialsFromName(name) {
  return String(name || '')
    .trim()
    .split(/\s+/)
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();
}

export function parseFeedFlag(raw, defaultEnabled = true) {
  if (raw === undefined || raw === null || raw === '') return defaultEnabled;
  const value = String(raw).trim().toLowerCase();
  return !['0', 'false', 'no', 'off'].includes(value);
}

export function serializeFeedFlag(enabled) {
  return enabled ? '1' : '0';
}

export function parseAboutJourney(raw) {
  if (Array.isArray(raw)) {
    return raw.map((step) => ({
      year: String(step?.year ?? ''),
      title: String(step?.title ?? ''),
      text: String(step?.text ?? step?.description ?? ''),
    }));
  }
  const text = String(raw ?? '').trim();
  if (!text) return [];
  try {
    const parsed = JSON.parse(text);
    return Array.isArray(parsed) ? parseAboutJourney(parsed) : [];
  } catch {
    return [];
  }
}

export function parseAboutTeam(raw) {
  if (Array.isArray(raw)) {
    return raw.map((member, index) => {
      const name = String(member?.name ?? '');
      const initialsRaw = String(member?.initials ?? '').trim();
      return {
        name,
        role: String(member?.role ?? ''),
        initials: initialsRaw || initialsFromName(name),
        avatarUrl: String(member?.avatarUrl ?? member?.imageurl ?? ''),
        bio: String(member?.bio ?? member?.description ?? ''),
        accent: teamAccentFromIndex(index),
      };
    });
  }
  const text = String(raw ?? '').trim();
  if (!text) return [];
  try {
    const parsed = JSON.parse(text);
    return Array.isArray(parsed) ? parseAboutTeam(parsed) : [];
  } catch {
    return [];
  }
}

export function serializeAboutJourney(steps) {
  return JSON.stringify(
    (Array.isArray(steps) ? steps : []).map((step) => ({
      year: String(step?.year ?? ''),
      title: String(step?.title ?? ''),
      text: String(step?.text ?? ''),
    })),
  );
}

export function serializeAboutTeam(members) {
  return JSON.stringify(
    (Array.isArray(members) ? members : []).map((member) => {
      const name = String(member?.name ?? '');
      const initialsRaw = String(member?.initials ?? '').trim();
      return {
        name,
        role: String(member?.role ?? ''),
        initials: initialsRaw || initialsFromName(name),
        avatarUrl: String(member?.avatarUrl ?? ''),
        bio: String(member?.bio ?? ''),
      };
    }),
  );
}

/** Trim + drop blank rows before persisting to CMS. */
export function normalizeAboutJourneyForSave(raw) {
  return JSON.stringify(
    parseAboutJourney(raw)
      .map((step) => ({
        year: step.year.trim(),
        title: step.title.trim(),
        text: step.text.trim(),
      }))
      .filter((step) => step.year || step.title || step.text),
  );
}

export function normalizeAboutTeamForSave(raw) {
  return JSON.stringify(
    parseAboutTeam(raw)
      .map((member) => ({
        name: member.name.trim(),
        role: member.role.trim(),
        initials: String(member.initials || '').trim() || initialsFromName(member.name),
        avatarUrl: member.avatarUrl.trim(),
        bio: member.bio.trim(),
      }))
      .filter((member) => member.name || member.role),
  );
}

export function readableParagraphs(text) {
  const blocks = String(text || '')
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter(Boolean);
  if (blocks.length) return blocks;
  return String(text || '')
    .split('\n')
    .map((p) => p.trim())
    .filter(Boolean);
}
