/** Page numbers with ellipsis gaps, e.g. [1, 2, 3, '...', 12]. */
export function buildPagerItems(page, total) {
  if (total <= 5) {
    return Array.from({ length: total }, (_, i) => i + 1);
  }
  const pages = new Set([1, 2, 3, total, page, page - 1, page + 1]);
  const sorted = [...pages].filter((p) => p >= 1 && p <= total).sort((a, b) => a - b);
  const result = [];
  sorted.forEach((p, i) => {
    if (i > 0 && p - sorted[i - 1] > 1) result.push('...');
    result.push(p);
  });
  return result;
}
