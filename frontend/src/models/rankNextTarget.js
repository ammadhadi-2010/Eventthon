import { ELITE_RANK_MATRIX } from './rankMatrixData';
import { getCachedRankMatrix } from '../services/rankMatrixCache';

function matrixRows() {
  const cached = getCachedRankMatrix();
  return cached.length ? cached : ELITE_RANK_MATRIX;
}

export function getNextRankByCode(rankCode) {
  const rows = matrixRows();
  const idx = rows.findIndex((row) => row.rankCode === rankCode);
  if (idx < 0 || idx >= rows.length - 1) return null;
  return rows[idx + 1];
}

export function resolveRankFromProgress({ points = 0, deals = 0, starRating = 0 } = {}) {
  let matched = matrixRows()[0];
  matrixRows().forEach((tier) => {
    if (
      Number(points) >= tier.minPoints &&
      Number(deals) >= tier.minDealsRequired &&
      Number(starRating) >= tier.minStarRating
    ) {
      matched = tier;
    }
  });
  return matched;
}

function resolveRankPointsOnly(points = 0) {
  let matched = matrixRows()[0];
  matrixRows().forEach((tier) => {
    if (Number(points) >= tier.minPoints) matched = tier;
  });
  return matched;
}

function buildGateStatus(next, { points, deals, starRating }) {
  const reqP = Number(next?.minPoints) || 0;
  const reqD = Number(next?.minDealsRequired) || 0;
  const reqS = Number(next?.minStarRating) || 0;
  return {
    points: { met: points >= reqP, current: points, required: reqP },
    deals: { met: deals >= reqD, current: deals, required: reqD },
    stars: { met: starRating >= reqS, current: starRating, required: reqS },
  };
}

function buildMissingGates(gateStatus) {
  return Object.entries(gateStatus)
    .filter(([, row]) => !row.met)
    .map(([gate, row]) => ({
      gate,
      required: row.required,
      current: row.current,
      deficit: gate === 'stars'
        ? Math.max(0, Number((row.required - row.current).toFixed(1)))
        : Math.max(0, row.required - row.current),
    }));
}

export function buildNextLockTarget(progress = {}) {
  const points = Number(progress.points) || 0;
  const deals = Number(progress.deals) || 0;
  const stars = Number(progress.starRating) || 0;
  const gateLocked = resolveRankFromProgress({ points, deals, starRating: stars });
  const pointsOnly = resolveRankPointsOnly(points);
  const current = gateLocked;
  const next = getNextRankByCode(current.rankCode);

  if (!next) {
    return {
      currentRank: current,
      nextRank: null,
      isMaxRank: true,
      gaps: { points: 0, deals: 0, stars: 0 },
      progressPct: 100,
      gateStatus: {},
      missingGates: [],
      blockedByGates: [],
      pointsOnlyRank: pointsOnly,
    };
  }

  const gateStatus = buildGateStatus(next, { points, deals, starRating: stars });
  const missingGates = buildMissingGates(gateStatus);
  const gaps = {
    points: Math.max(0, next.minPoints - points),
    deals: Math.max(0, next.minDealsRequired - deals),
    stars: Math.max(0, Number((next.minStarRating - stars).toFixed(1))),
  };
  const pointPct = next.minPoints ? Math.min(100, Math.round((points / next.minPoints) * 100)) : 100;
  const dealPct = next.minDealsRequired ? Math.min(100, Math.round((deals / next.minDealsRequired) * 100)) : 100;
  const starPct = next.minStarRating ? Math.min(100, Math.round((stars / next.minStarRating) * 100)) : 100;

  return {
    currentRank: current,
    nextRank: next,
    isMaxRank: false,
    gaps,
    progressPct: Math.round((pointPct + dealPct + starPct) / 3),
    targetLabel: `${next.rankCode} · ${next.rankName}`,
    gateStatus,
    missingGates,
    blockedByGates: missingGates.map((g) => g.gate),
    pointsOnlyRank: pointsOnly,
  };
}

export function attachNextRankMetadata(rows = []) {
  return rows.map((row) => {
    const next = getNextRankByCode(row.rankCode);
    return {
      ...row,
      nextRankCode: next?.rankCode || null,
      nextRankName: next?.rankName || null,
    };
  });
}

export function mapApiGamification(snapshot = {}) {
  const lock = snapshot.nextLockTarget || {};
  const progress = snapshot.progress || {};
  const next = lock.nextRank || snapshot.nextRank || {};
  return {
    rank_label: snapshot.rankName || lock.currentRank?.rankName || 'Frontline Recruit',
    current_xp: Number(progress.points ?? snapshot.gamification?.current_xp ?? 0),
    next_xp: Number(next.minPoints ?? snapshot.gamification?.next_xp ?? 0),
    next_rank: next.rankName || snapshot.gamification?.next_rank || '',
    progress_pct: Number(lock.progressPct ?? snapshot.gamification?.progress_pct ?? 0),
    missing_gates: lock.missingGates || snapshot.gamification?.missing_gates || [],
    blocked_by_gates: lock.blockedByGates || snapshot.gamification?.blocked_by_gates || [],
    gate_status: lock.gateStatus || snapshot.gamification?.gate_status || {},
    deals_current: Number(progress.deals ?? 0),
    deals_required: Number(next.minDealsRequired ?? 0),
    stars_current: Number(progress.starRating ?? 0),
    stars_required: Number(next.minStarRating ?? 0),
  };
}
