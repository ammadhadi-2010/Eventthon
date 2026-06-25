/** Leaf module — matrix constants only (no imports from Rank.js). */

export const RANK_BADGE_BASE = '/static/uploads/ranks';

export const RANK_CODES = ['E-1', 'E-2', 'E-3', 'E-4', 'E-5', 'E-6'];

export const ELITE_RANK_MATRIX = [
  {
    rankCode: 'E-1',
    rankName: 'Frontline Recruit',
    minPoints: 0,
    minDealsRequired: 0,
    minStarRating: 0,
    iconUrl: `${RANK_BADGE_BASE}/e-1-emerald-dual-star-crest.png`,
    badgeLabel: 'Emerald Dual-Star Crest',
    featureOnFrontlineDashboard: false,
    benefits: 'Basic profile visibility. Standard bidding limit on gigs.',
  },
  {
    rankCode: 'E-2',
    rankName: 'Frontline Specialist',
    minPoints: 1000,
    minDealsRequired: 3,
    minStarRating: 4.2,
    iconUrl: `${RANK_BADGE_BASE}/e-2-cyan-tri-chevron-shield.png`,
    badgeLabel: 'Cyan Tri-Chevron Shield',
    featureOnFrontlineDashboard: false,
    benefits: 'Specialist badge on profile. Squad join permission unlocked.',
  },
  {
    rankCode: 'E-3',
    rankName: 'Tactical Operative',
    minPoints: 3500,
    minDealsRequired: 10,
    minStarRating: 4.5,
    iconUrl: `${RANK_BADGE_BASE}/e-3-platinum-winged-shield.png`,
    badgeLabel: 'Platinum Winged Shield',
    featureOnFrontlineDashboard: false,
    benefits: 'Silver highlight on proposals. 2% platform fee discount.',
  },
  {
    rankCode: 'E-4',
    rankName: 'Squad Commander',
    minPoints: 7000,
    minDealsRequired: 25,
    minStarRating: 4.7,
    iconUrl: `${RANK_BADGE_BASE}/e-4-golden-tri-star-crest.png`,
    badgeLabel: 'Golden Tri-Star Crest',
    featureOnFrontlineDashboard: false,
    benefits: 'Priority above normal users in bidding. Create squad/team permission.',
  },
  {
    rankCode: 'E-5',
    rankName: 'Elite Commander',
    minPoints: 15000,
    minDealsRequired: 50,
    minStarRating: 4.8,
    iconUrl: `${RANK_BADGE_BASE}/e-5-crimson-ruby-wreath-crown.png`,
    badgeLabel: 'Crimson Ruby Wreath Crown',
    featureOnFrontlineDashboard: false,
    benefits: 'VIP badge. 1-hour early exclusive access to new gigs.',
  },
  {
    rankCode: 'E-6',
    rankName: 'Apex Vanguard',
    minPoints: 30000,
    minDealsRequired: 100,
    minStarRating: 4.9,
    iconUrl: `${RANK_BADGE_BASE}/e-6-gold-crown-onyx-core.png`,
    badgeLabel: 'Ultimate Gold Crown Onyx Core',
    featureOnFrontlineDashboard: true,
    benefits: 'Frontline featured atop recruiter dashboards. Official elite verified token.',
  },
];

export function getRankPresetByCode(rankCode) {
  return ELITE_RANK_MATRIX.find((row) => row.rankCode === rankCode) || null;
}
