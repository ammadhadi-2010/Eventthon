import { getCachedRankByCode } from '../services/rankMatrixCache';

const FALLBACK_PRESETS = {
  'E-1': { tier: 'E1', label: 'Frontline Recruit', ribbonText: 'RECRUIT', starCount: 2 },
  'E-2': { tier: 'E2', label: 'Frontline Specialist', ribbonText: 'SPECIALIST', starCount: 3 },
  'E-3': { tier: 'E3', label: 'Tactical Operative', ribbonText: 'OPERATIVE', starCount: 3 },
  'E-4': { tier: 'E4', label: 'Squad Commander', ribbonText: 'COMMANDER', starCount: 3 },
  'E-5': { tier: 'E5', label: 'Elite Commander', ribbonText: 'ELITE', starCount: 5 },
  'E-6': { tier: 'E6', label: 'Apex Vanguard', ribbonText: 'VANGUARD', starCount: 5 },
};

export function normalizeRankCode(rankCode) {
  const raw = String(rankCode || 'E-1').trim().toUpperCase();
  if (FALLBACK_PRESETS[raw]) return raw;
  const compact = raw.replace(/\s+/g, '');
  if (FALLBACK_PRESETS[compact]) return compact;
  const match = compact.match(/^E-?(\d)$/i);
  return match ? `E-${match[1]}` : 'E-1';
}

export function rankCodeToBadgeProps(rankCode, overrides = {}) {
  const code = normalizeRankCode(rankCode);
  const row = getCachedRankByCode(code);
  const fallback = FALLBACK_PRESETS[code] || FALLBACK_PRESETS['E-1'];
  const preset = row
    ? {
        tier: row.badgeTier || fallback.tier,
        label: row.rankName || fallback.label,
        ribbonText: row.ribbonText || fallback.ribbonText,
        starCount: row.starCount ?? fallback.starCount,
      }
    : fallback;
  return {
    ...preset,
    tierCode: code,
    ...overrides,
    label: overrides.label || preset.label,
  };
}

export function rowToBadgeProps(row = {}) {
  return rankCodeToBadgeProps(row.rankCode || 'E-1', {
    label: row.rankName || row.name || undefined,
  });
}
