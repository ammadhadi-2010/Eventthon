import { belongsToCurrentUser } from '../accountHub/profilePosts/profilePostsUtils';

export function normalizeArticleTitle(title = '') {
  return String(title || '')
    .trim()
    .replace(/^artucle$/i, 'Article');
}

export function filterOwnArticles(articles = [], userData = null) {
  return (Array.isArray(articles) ? articles : []).filter((row) => belongsToCurrentUser(row, userData));
}

export function countArticlesByStatus(articles = []) {
  const published = articles.filter((row) => String(row.status || '').toLowerCase() === 'published').length;
  return {
    all: articles.length,
    published,
    draft: Math.max(0, articles.length - published),
  };
}
