import axios from 'axios';
import { API_BASE_URL } from '../../../api/axiosConfig';

export const getArticleIdentifier = (userData) =>
  userData?.email ||
  userData?.mobile ||
  (userData?._id ? String(userData._id) : '') ||
  localStorage.getItem('userEmail') ||
  localStorage.getItem('userMobile') ||
  localStorage.getItem('userId') ||
  localStorage.getItem('user_id') ||
  '';

const getIdentifier = (userData) => getArticleIdentifier(userData);

export const fetchArticles = async () => {
  const res = await axios.get(`${API_BASE_URL}/api/articles/articles/all`);
  return Array.isArray(res.data) ? res.data : res.data?.data || [];
};

export const fetchArticleById = async (articleId) => {
  const res = await axios.get(`${API_BASE_URL}/api/articles/articles/${encodeURIComponent(articleId)}`);
  return res?.data?.data || null;
};

export const updateArticleById = async (articleId, payload) => {
  const data = new FormData();
  data.append('title', payload.title || '');
  data.append('content', payload.content || '');
  data.append('identifier', getIdentifier());
  data.append('slug', payload.slug || '');
  data.append('excerpt', payload.excerpt || '');
  data.append('tags', Array.isArray(payload.tags) ? payload.tags.join(',') : '');
  data.append('primary_keyword', payload.primaryKeyword || '');
  data.append('meta_title', payload.metaTitle || '');
  data.append('meta_description', payload.metaDescription || '');
  data.append('category', payload.category || 'General');
  data.append('seo_score', String(payload.seoScore || 0));
  data.append('status_value', payload.status || 'draft');
  if (payload.coverImage) data.append('cover_image', payload.coverImage);

  const res = await axios.put(`${API_BASE_URL}/api/articles/articles/${encodeURIComponent(articleId)}`, data, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return res?.data?.data || null;
};

export const uploadArticleMedia = async (file) => {
  const identifier = getIdentifier();
  if (!identifier) throw new Error('Login required to upload images');
  const data = new FormData();
  data.append('identifier', identifier);
  data.append('file', file);
  const res = await axios.post(`${API_BASE_URL}/api/articles/articles/upload-media`, data, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return res?.data?.imageurl || res?.data?.url || '';
};

export const deleteArticleById = async (articleId, userData) => {
  const identifier = getIdentifier(userData);
  if (!identifier) throw new Error('Login required to delete article');
  const res = await axios.delete(`${API_BASE_URL}/api/articles/articles/${encodeURIComponent(articleId)}`, {
    params: { identifier },
  });
  return res?.data;
};

export const incrementArticleMetric = async (articleId, action) => {
  const data = new FormData();
  data.append('action', action);
  const res = await axios.post(`${API_BASE_URL}/api/articles/articles/${encodeURIComponent(articleId)}/metrics`, data);
  return res?.data?.data || null;
};

