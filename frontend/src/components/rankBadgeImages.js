import E1 from '../assets/Rank/E1.png';
import E2 from '../assets/Rank/E2.png';
import E3 from '../assets/Rank/E3.png';
import E4 from '../assets/Rank/E4.png';
import E5 from '../assets/Rank/E5.png';
import E6 from '../assets/Rank/E6.png';

const RANK_BADGE_IMAGES = {
  E1,
  E2,
  E3,
  E4,
  E5,
  E6,
};

export function normalizeTierKey(tier) {
  const raw = String(tier || 'E1').trim().toUpperCase().replace(/-/g, '');
  if (RANK_BADGE_IMAGES[raw]) return raw;
  const match = raw.match(/^E(\d)$/);
  return match ? `E${match[1]}` : 'E1';
}

export function getRankBadgeSrc(tier) {
  return RANK_BADGE_IMAGES[normalizeTierKey(tier)] || RANK_BADGE_IMAGES.E1;
}
