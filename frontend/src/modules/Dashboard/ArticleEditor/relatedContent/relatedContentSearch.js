import API from '../../../../api/axiosConfig';
import { fetchSquadsList } from '../../SquadNetwork/api/squadsApi';
import { fetchProjectsList } from '../../Projects/services/projectsApi';
import { searchHubJobs } from '../../Jobs/services/jobsHubApi';
import { fetchGigsList } from '../../Gigs/services/gigsApi';
import { fetchMyArticles } from '../articleApi';
import { getDashboardSessionHeaders } from '../../utils/dashboardSession';

const LIMIT = 8;

function matchQuery(label, query) {
  if (!query) return true;
  return String(label || '').toLowerCase().includes(query.toLowerCase());
}

function mapRows(rows, pickLabel, pickId = (row) => row._id || row.id) {
  return rows
    .map((row) => ({
      id: String(pickId(row) || '').trim(),
      label: String(pickLabel(row) || '').trim(),
    }))
    .filter((row) => row.id && row.label);
}

async function searchSquads(query) {
  const { squads = [] } = await fetchSquadsList({ force: false });
  return mapRows(squads, (row) => row.name || row.title, (row) => row._id || row.id)
    .filter((row) => matchQuery(row.label, query))
    .slice(0, LIMIT);
}

async function searchProjects(query) {
  const rows = await fetchProjectsList({ limit: 40 });
  const list = Array.isArray(rows?.projects) ? rows.projects : Array.isArray(rows) ? rows : [];
  return mapRows(list, (row) => row.title || row.name)
    .filter((row) => matchQuery(row.label, query))
    .slice(0, LIMIT);
}

async function searchJobs(query) {
  const { rows = [] } = await searchHubJobs({ q: query });
  return mapRows(rows, (row) => row.title || row.job_title || row.role)
    .slice(0, LIMIT);
}

async function searchGigs(query) {
  const { gigs = [] } = await fetchGigsList({ limit: 40 });
  return mapRows(gigs, (row) => row.title || row.name)
    .filter((row) => matchQuery(row.label, query))
    .slice(0, LIMIT);
}

async function searchMembers(query) {
  const res = await API.get('/users/search', {
    headers: getDashboardSessionHeaders(),
    params: { skill: query || 'design' },
  });
  const rows = Array.isArray(res.data) ? res.data : res.data?.data || [];
  return mapRows(
    rows,
    (row) => row.username || row.name || `${row.first_name || ''} ${row.last_name || ''}`.trim(),
    (row) => row._id || row.id || row.username,
  )
    .filter((row) => matchQuery(row.label, query))
    .slice(0, LIMIT);
}

async function searchArticles(query, userData) {
  const rows = await fetchMyArticles(userData);
  return mapRows(rows, (row) => row.title)
    .filter((row) => matchQuery(row.label, query))
    .slice(0, LIMIT);
}

export async function searchRelatedContent(categoryKey, query, userData) {
  const q = String(query || '').trim();
  switch (categoryKey) {
    case 'squads':
      return searchSquads(q);
    case 'projects':
      return searchProjects(q);
    case 'jobs':
      return searchJobs(q);
    case 'gigs':
      return searchGigs(q);
    case 'members':
      return searchMembers(q);
    case 'articles':
      return searchArticles(q, userData);
    default:
      return [];
  }
}
