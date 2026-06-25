import API from '../../api/axiosConfig';

const BASE = '/api/founders-story';

export async function fetchFoundersStory(visitorId) {
  const params = visitorId ? { visitor_id: visitorId } : {};
  const { data } = await API.get(BASE, { params });
  return data?.data || {};
}

export async function saveFoundersStoryContent(content) {
  const { data } = await API.put(`${BASE}/admin/content`, { content });
  return data?.data;
}

export async function toggleFoundersStoryLike(visitorId) {
  const { data } = await API.post(`${BASE}/like`, { visitor_id: visitorId });
  return data?.data;
}

export async function postFoundersStoryComment(payload) {
  const { data } = await API.post(`${BASE}/comments`, payload);
  return data?.data;
}
