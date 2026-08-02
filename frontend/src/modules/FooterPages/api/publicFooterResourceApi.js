import API from '../../../api/axiosConfig';

const BASE = '/api/footer-cms-resources';
const TIMEOUT = 15000;

export async function fetchFooterResourcesByCategory(category) {
  const { data } = await API.get(BASE, {
    params: { category },
    timeout: TIMEOUT,
  });
  return Array.isArray(data?.data) ? data.data : [];
}

export async function fetchCompanyFooterResources() {
  const { data } = await API.get(BASE, {
    params: { footer_block: 'company' },
    timeout: TIMEOUT,
  });
  return Array.isArray(data?.data) ? data.data : [];
}
