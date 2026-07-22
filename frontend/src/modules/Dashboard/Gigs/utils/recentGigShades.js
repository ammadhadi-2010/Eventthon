/** Five rotating card shades — index % 5 repeats the same palette. */
export const RECENT_GIG_SHADES = ['violet', 'emerald', 'amber', 'rose', 'sky'];

export function getRecentGigShade(index = 0) {
  const safe = Number.isFinite(index) ? index : 0;
  return RECENT_GIG_SHADES[((safe % RECENT_GIG_SHADES.length) + RECENT_GIG_SHADES.length) % RECENT_GIG_SHADES.length];
}
