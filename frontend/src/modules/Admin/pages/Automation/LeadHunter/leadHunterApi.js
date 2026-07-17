import API from '../../../../../api/axiosConfig';

const LEAD_HUNTER_PATHS = {
  categories: [
    '/api/admin/email-outreach/lead-hunter/categories',
    '/api/admin/automation/categories',
  ],
  googleSearch: [
    '/api/admin/email-outreach/lead-hunter/google-search',
    '/api/admin/automation/google-search',
  ],
  extract: [
    '/api/admin/email-outreach/lead-hunter/extract',
    '/api/admin/automation/extract',
  ],
  sendPitch: [
    '/api/admin/email-outreach/lead-hunter/send-pitch',
    '/api/admin/automation/send-pitch',
  ],
};

async function getWithFallback(paths) {
  let lastError = null;
  for (const path of paths) {
    try {
      const { data } = await API.get(path);
      return data;
    } catch (err) {
      lastError = err;
      if (err?.response?.status !== 404) throw err;
    }
  }
  throw lastError;
}

async function postWithFallback(paths, payload) {
  let lastError = null;
  for (const path of paths) {
    try {
      const { data } = await API.post(path, payload);
      return data;
    } catch (err) {
      lastError = err;
      if (err?.response?.status !== 404) throw err;
    }
  }
  throw lastError;
}

export async function fetchLeadHunterCategories() {
  const data = await getWithFallback(LEAD_HUNTER_PATHS.categories);
  return Array.isArray(data?.categories) ? data.categories : [];
}

export async function searchGoogleLeads(payload) {
  return postWithFallback(LEAD_HUNTER_PATHS.googleSearch, payload);
}

export async function extractLeads(payload) {
  return postWithFallback(LEAD_HUNTER_PATHS.extract, payload);
}

export async function sendPitch(payload) {
  return postWithFallback(LEAD_HUNTER_PATHS.sendPitch, payload);
}
