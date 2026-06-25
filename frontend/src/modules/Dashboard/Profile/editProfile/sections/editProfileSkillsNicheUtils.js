import { FiCode, FiCpu, FiDatabase, FiLayers } from 'react-icons/fi';
import { deriveSkillIconUi, GLOBAL_SKILL_OPTIONS } from '../../../../../data/serviceCatalog';
import {
  gigsCategoryIcons,
  GigsCategoryIconFallback,
} from '../../../Gigs/utils/gigsBrowseCategoryIcons';

export function clampPct(n) {
  const x = Number(n);
  if (Number.isNaN(x)) return 80;
  return Math.min(100, Math.max(5, Math.round(x)));
}

export function proficiencyBadge(pct) {
  if (pct >= 85) return 'Expert';
  if (pct >= 65) return 'Proficient';
  if (pct >= 45) return 'Developing';
  return 'Beginner';
}

function skillIconHeuristic(name) {
  const n = String(name || '').toLowerCase();
  if (n.includes('mongo') || n.includes('sql')) return FiDatabase;
  if (n.includes('node') || n.includes('java') || n.includes('python')) return FiCpu;
  if (n.includes('tailwind') || n.includes('css') || n.includes('html')) return FiLayers;
  return FiCode;
}

function nameHash(s) {
  let h = 0;
  const str = String(s || '');
  for (let i = 0; i < str.length; i++) h = (h * 31 + str.charCodeAt(i)) | 0;
  return Math.abs(h);
}

/** Icon + iconUi for skill row (catalog match or heuristic + skill preset). */
export function resolveSkillRowVisual(name) {
  const trimmed = String(name || '').trim();
  const hit = GLOBAL_SKILL_OPTIONS.find((x) => x.name.toLowerCase() === trimmed.toLowerCase());
  if (hit) {
    return {
      Icon: gigsCategoryIcons[hit.iconKey] || GigsCategoryIconFallback,
      iconUi: hit.iconUi,
    };
  }
  return {
    Icon: skillIconHeuristic(name),
    iconUi: deriveSkillIconUi(nameHash(trimmed)),
  };
}

export function newSkillId() {
  return `sk-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}
