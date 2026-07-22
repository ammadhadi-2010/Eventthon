/** Six shining project shades — distinct from Gigs & Jobs palettes. */
export const PROJECT_CARD_SHADES = ['aurora', 'cobalt', 'coral', 'mint', 'plasma', 'solar'];

export function getProjectCardShade(index = 0) {
  const safe = Number.isFinite(index) ? index : 0;
  return PROJECT_CARD_SHADES[((safe % PROJECT_CARD_SHADES.length) + PROJECT_CARD_SHADES.length) % PROJECT_CARD_SHADES.length];
}
