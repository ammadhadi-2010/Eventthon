import API from '../../../../api/axiosConfig';

const BASE = '/api/footer-cms-resources';
const TIMEOUT = 15000;

export async function getFooterResources(category = '', footerBlock = '') {
  const params = {};
  if (category) params.category = category;
  if (footerBlock) params.footer_block = footerBlock;
  const { data } = await API.get(BASE, { params, timeout: TIMEOUT });
  return {
    rows: Array.isArray(data?.data) ? data.data : [],
    categories: Array.isArray(data?.categories) ? data.categories : [],
  };
}

export async function createFooterResource(payload) {
  const { data } = await API.post(BASE, payload, { timeout: TIMEOUT });
  return data?.data || null;
}

export async function updateFooterResource(id, payload) {
  const { data } = await API.put(`${BASE}/${encodeURIComponent(id)}`, payload, { timeout: TIMEOUT });
  return data?.data || null;
}

export async function deleteFooterResource(id) {
  const { data } = await API.delete(`${BASE}/${encodeURIComponent(id)}`, { timeout: TIMEOUT });
  return data?.data || null;
}

export async function uploadFooterMedia(file) {
  const formData = new FormData();
  formData.append('file', file);
  const { data } = await API.post(`${BASE}/upload-media`, formData, {
    timeout: TIMEOUT,
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return data?.data || null;
}

/** Seed Privacy, Terms, Docs, Guides, and Tutorials defaults into Mongo when missing. */
export async function seedFooterDefaults(force = false) {
  const { data } = await API.post(
    `${BASE}/seed-defaults`,
    null,
    { params: { force }, timeout: 60000 },
  );
  return data?.data || null;
}
