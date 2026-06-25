/**
 * Home timeline filters only. Never excludes posts by is_carousel_update.
 * Carousel highlights use a separate /api/updates pipeline.
 */
const FILTER_TYPE_MAP = {
  Posts: ['POST'],
  Squad: ['SQUAD'],
  Project: ['PROJECT'],
  Win: ['WIN'],
  Articles: ['ARTICLE'],
};

export function filterTimelinePosts(posts, activeFilter = 'All') {
  const safePosts = Array.isArray(posts) ? posts.filter(Boolean) : [];
  if (activeFilter === 'All') {
    return safePosts;
  }
  const allowedTypes = FILTER_TYPE_MAP[activeFilter];
  if (!allowedTypes) {
    return safePosts;
  }
  return safePosts.filter((post) => {
    const postType = String(post?.post_type || 'POST').toUpperCase();
    return allowedTypes.includes(postType);
  });
}
