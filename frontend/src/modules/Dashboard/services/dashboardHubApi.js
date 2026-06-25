import API from '../../../api/axiosConfig';
import { getDashboardSessionHeaders } from '../utils/dashboardSession';

const TIMEOUT = 10000;

export async function fetchSuggestedSquadsPreview(limit = 4) {
  try {
    const res = await API.get('/api/squads', {
      headers: getDashboardSessionHeaders(),
      timeout: TIMEOUT,
    });
    const rows = Array.isArray(res?.data) ? res.data : res?.data?.squads || [];
    return rows.slice(0, limit).map((s) => ({
      id: s._id || s.id,
      title: s.name || s.title || 'Squad',
      category: s.category || s.niche || 'Collaboration',
      members: s.member_count ?? (Array.isArray(s.members) ? s.members.length : 0),
      imageurl: s.imageurl || s.imageUrl || '',
      color: '#7c3aed',
    }));
  } catch {
    return [];
  }
}

export async function fetchTrendingProjectsPreview(limit = 3) {
  try {
    const res = await API.get('/api/projects', {
      params: { limit },
      headers: getDashboardSessionHeaders(),
      timeout: TIMEOUT,
    });
    const rows = res?.data?.projects || [];
    return rows.slice(0, limit).map((p) => ({
      id: p._id || p.id,
      title: p.title || 'Project',
      tag: p.status_label || p.status || 'Open',
      path: `/projects/explore/${p._id || p.id}`,
      imageurl: p.imageurl || p.imageUrl || '',
    }));
  } catch {
    return [];
  }
}
