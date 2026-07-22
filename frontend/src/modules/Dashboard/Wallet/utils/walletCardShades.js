/** Six shining wallet row shades — distinct palette for Thon transactions. */
export const WALLET_ROW_SHADES = ['emerald', 'azure', 'violet', 'rose', 'amber', 'teal'];

export function getWalletRowShade(index = 0) {
  const safe = Number.isFinite(index) ? index : 0;
  return WALLET_ROW_SHADES[((safe % WALLET_ROW_SHADES.length) + WALLET_ROW_SHADES.length) % WALLET_ROW_SHADES.length];
}
