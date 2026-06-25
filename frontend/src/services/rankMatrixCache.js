import { ELITE_RANK_MATRIX } from '../models/rankMatrixData';
import { fetchRankMatrix } from './rankService';

let matrixRows = [...ELITE_RANK_MATRIX];
let loadPromise = null;

function mapApiRow(row = {}) {
  const rankCode = row.rankCode || 'E-1';
  const badgeTier = row.badgeTier || String(rankCode).replace('-', '');
  const iconUrl = row.badgeImageUrl || row.iconUrl || `/assets/Rank/${badgeTier}.png`;
  return {
    rankCode,
    rankName: row.rankName || row.name,
    minPoints: Number(row.minPoints) || 0,
    minDealsRequired: Number(row.minDealsRequired) || 0,
    minStarRating: Number(row.minStarRating) || 0,
    iconUrl,
    badgeLabel: row.badgeLabel || row.rankName,
    badgeTier,
    themeId: row.themeId || 'emerald',
    ribbonText: row.ribbonText || 'RANK',
    starCount: Number(row.starCount) || 2,
    benefits: row.benefits || '',
    featureOnFrontlineDashboard: Boolean(row.featureOnFrontlineDashboard),
    nextRankCode: row.nextRankCode || null,
    nextRankName: row.nextRankName || null,
    vipBenefitPreview: row.vipBenefitPreview || '',
  };
}

export function getCachedRankMatrix() {
  return matrixRows;
}

export function getCachedRankByCode(rankCode) {
  const code = String(rankCode || 'E-1').trim().toUpperCase();
  return matrixRows.find((row) => row.rankCode === code) || matrixRows[0] || null;
}

export async function ensureRankMatrixLoaded() {
  if (loadPromise) return loadPromise;
  loadPromise = fetchRankMatrix()
    .then((rows) => {
      if (rows.length) matrixRows = rows.map(mapApiRow);
      return matrixRows;
    })
    .catch(() => matrixRows)
    .finally(() => {
      loadPromise = null;
    });
  return loadPromise;
}

export function primeRankMatrix(rows = []) {
  if (rows.length) matrixRows = rows.map(mapApiRow);
}
