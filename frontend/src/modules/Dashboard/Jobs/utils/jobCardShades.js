/** Six shining job card shades — distinct from Gigs hub palette. */
export const JOB_CARD_SHADES = ['crimson', 'electric', 'lime', 'sunset', 'fuchsia', 'gold'];

export function getJobCardShade(index = 0) {
  const safe = Number.isFinite(index) ? index : 0;
  return JOB_CARD_SHADES[((safe % JOB_CARD_SHADES.length) + JOB_CARD_SHADES.length) % JOB_CARD_SHADES.length];
}
