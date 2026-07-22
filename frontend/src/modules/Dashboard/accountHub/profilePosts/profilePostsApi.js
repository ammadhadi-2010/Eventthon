import API from '../../../../api/axiosConfig';
import { fetchArticles } from '../../ArticleEditor/articleApi';

export async function fetchProfilePostsFeed() {
  const [postsRes, articles] = await Promise.all([
    API.get('/api/posts/all', { timeout: 15000 }).catch(() => ({ data: { data: [] } })),
    fetchArticles().catch(() => []),
  ]);

  const postsPayload = postsRes?.data;
  const postRows = Array.isArray(postsPayload?.data)
    ? postsPayload.data
    : Array.isArray(postsPayload)
      ? postsPayload
      : [];

  return { posts: postRows, articles: Array.isArray(articles) ? articles : [] };
}
