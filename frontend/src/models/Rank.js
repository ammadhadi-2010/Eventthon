/** Elite 6-level matrix — locked badge assets, criteria, and theme accents. */

import { getRankBadgeSrc, normalizeTierKey } from '../components/rankBadgeImages';
import { getCachedRankByCode } from '../services/rankMatrixCache';

import {
  ELITE_RANK_MATRIX,
  RANK_BADGE_BASE,
  RANK_CODES,
  getRankPresetByCode,
} from './rankMatrixData';

export { RANK_BADGE_BASE, RANK_CODES, ELITE_RANK_MATRIX, getRankPresetByCode };

function resolvePreset(rankCode) {
  return getCachedRankByCode(rankCode) || getRankPresetByCode(rankCode);
}

export const RANK_THEME = {
  'E-1': { id: 'emerald', label: 'Emerald Green', glow: 'rm-glow--emerald' },
  'E-2': { id: 'cyan', label: 'Cyan Blue', glow: 'rm-glow--cyan' },
  'E-3': { id: 'silver', label: 'Silver', glow: 'rm-glow--silver' },
  'E-4': { id: 'gold', label: 'Gold', glow: 'rm-glow--gold' },
  'E-5': { id: 'crimson', label: 'Crimson Red', glow: 'rm-glow--crimson' },
  'E-6': { id: 'solar', label: 'Solar Gold', glow: 'rm-glow--solar' },
};

export const ELITE_RANK_PRESETS = ELITE_RANK_MATRIX;

export const EMPTY_RANK_FORM = {
  rankCode: 'E-1',
  rankName: '',
  minPoints: 0,
  minDealsRequired: 0,
  minStarRating: 0,
  iconUrl: '',
  featureOnFrontlineDashboard: false,
  benefits: '',
  status: 'active',
};

export const RANK_FIELD_CLASS =
  'w-full bg-[#111622] border border-slate-800 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-cyan-500/60 transition-colors';

export const RANK_LABEL_CLASS = 'text-xs font-bold text-white tracking-tight block mb-1.5';

export function rankIdFromCode(rankCode) {
  return String(rankCode || '').trim().toLowerCase();
}

export function getRankTheme(rankCode) {
  return RANK_THEME[rankCode] || RANK_THEME['E-1'];
}

export function resolveRankBadgeUrl(row = {}) {
  if (row.rankCode) return getRankBadgeSrc(row.rankCode);
  return getRankBadgeSrc('E1');
}

export function rowToRankForm(row = {}) {
  return {
    rankCode: row.rankCode || 'E-1',
    rankName: row.rankName || row.name || '',
    minPoints: Number(row.minPoints) || 0,
    minDealsRequired: Number(row.minDealsRequired) || 0,
    minStarRating: Number(row.minStarRating) || 0,
    iconUrl: resolveRankBadgeUrl(row),
    featureOnFrontlineDashboard: Boolean(row.featureOnFrontlineDashboard),
    benefits: row.benefits || '',
    status: row.status || 'active',
  };
}

export function applyRankPresetToForm(form, rankCode) {
  const preset = resolvePreset(rankCode);
  if (!preset) return form;
  return {
    ...form,
    rankCode,
    rankName: preset.rankName,
    minPoints: preset.minPoints,
    minDealsRequired: preset.minDealsRequired,
    minStarRating: preset.minStarRating,
    iconUrl: preset.iconUrl,
    featureOnFrontlineDashboard: preset.featureOnFrontlineDashboard,
    benefits: preset.benefits,
  };
}

export function getUserRankMeta(rankKey) {
  const key = String(rankKey || '').trim().toLowerCase();
  const aliases = {
    recruit: 'E-1',
    frontline: 'E-1',
    specialist: 'E-2',
    operative: 'E-3',
    squad: 'E-4',
    commander: 'E-5',
    elite: 'E-6',
    vanguard: 'E-6',
  };
  const code = aliases[key] || (key.startsWith('e-') ? key.toUpperCase() : 'E-1');
  const preset = resolvePreset(code) || ELITE_RANK_MATRIX[0];
  const rankCode = preset.rankCode || code;
  const theme = preset.themeId
    ? { id: preset.themeId, glow: `rm-glow--${preset.themeId}` }
    : getRankTheme(rankCode);
  return {
    code: rankCode,
    label: preset.rankName,
    tier: preset.badgeTier || normalizeTierKey(code),
    iconUrl: getRankBadgeSrc(preset.badgeTier || code),
    shieldClass: `um-rank--${theme.id}`,
    glowClass: theme.glow,
  };
}
