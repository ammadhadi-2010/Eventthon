/** Map API / seed rows into ReviewCard props (English fields only). */
export function toReviewCardProps(source = {}) {
  const rawRating = source.rating ?? source.stars ?? 0;
  const rating = typeof rawRating === 'string' ? parseFloat(rawRating) : Number(rawRating);

  const avatarRaw = source.avatarUrl || source.imageurl || source.imageUrl || '';

  return {
    reviewerName: source.reviewerName || source.name || 'Client',
    serviceType: source.serviceType || source.gigTitle || source.projectTag || 'Service',
    rating: Number.isFinite(rating) ? rating : 0,
    comment: String(source.comment ?? source.text ?? '').trim(),
    date: String(source.date ?? source.timeAgo ?? source.ago ?? '').trim(),
    avatarUrl: typeof avatarRaw === 'string' && avatarRaw.startsWith('http') ? avatarRaw : '',
  };
}
