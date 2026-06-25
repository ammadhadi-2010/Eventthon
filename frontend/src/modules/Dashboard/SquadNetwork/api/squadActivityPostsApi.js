import API from '../../../../api/axiosConfig';

export async function fetchSquadFeedPosts(squadId) {
  if (!squadId) return [];
  const res = await API.get(`/api/posts/squad/${squadId}`, { timeout: 8000 });
  return res?.data?.status === 'success' ? res.data.data || [] : [];
}
