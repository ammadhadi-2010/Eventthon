/** Build filled / empty star slots from a numeric rating (supports decimals e.g. 4.8). */
export function getStarSlots(rating, maxStars = 5) {
  const max = Math.max(1, Math.floor(Number(maxStars) || 5));
  const value = Math.min(max, Math.max(0, Number(rating) || 0));
  const filledCount = Math.min(max, Math.round(value));
  return Array.from({ length: max }, (_, index) => index < filledCount);
}

export function formatStarLabel(rating, maxStars = 5) {
  const value = Math.min(maxStars, Math.max(0, Number(rating) || 0));
  return `${value.toFixed(1)} out of ${maxStars} stars`;
}

export function reviewerInitial(name) {
  const parts = String(name || '')
    .trim()
    .split(/\s+/)
    .filter(Boolean);
  if (!parts.length) return '?';
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
  return `${parts[0].charAt(0)}${parts[parts.length - 1].charAt(0)}`.toUpperCase();
}
