import API from '../api/axiosConfig';

export async function fetchAdminGigStats() {
  const { data } = await API.get('/api/admin/gigs/stats');
  return data?.metrics || {};
}

export async function fetchAdminGigs(params = {}) {
  const { data } = await API.get('/api/admin/gigs', { params });
  return Array.isArray(data?.data) ? data.data : [];
}

export async function fetchAdminGigDetail(gigId) {
  const { data } = await API.get(`/api/admin/gigs/${encodeURIComponent(gigId)}/admin-detail`);
  return data?.gig || null;
}

export async function updateAdminGig(gigId, payload) {
  const { data } = await API.put(`/api/gigs/${encodeURIComponent(gigId)}`, payload);
  return data?.gig || null;
}

export async function updateAdminGigStatus(gigId, status) {
  const { data } = await API.patch(`/api/admin/gigs/${encodeURIComponent(gigId)}/admin-status`, {
    status,
  });
  return data?.data || null;
}

export async function deleteAdminGig(gigId) {
  const { data } = await API.delete(`/api/admin/gigs/${encodeURIComponent(gigId)}/admin`);
  return data;
}

export async function updateAdminGigProposalStatus(gigId, proposalId, status) {
  const { data } = await API.patch(
    `/api/admin/gigs/${encodeURIComponent(gigId)}/proposals/${encodeURIComponent(proposalId)}/status`,
    { status },
  );
  return data?.proposal || null;
}

export async function updateAdminGigMilestoneStatus(gigId, milestoneId, status) {
  const { data } = await API.patch(
    `/api/admin/gigs/${encodeURIComponent(gigId)}/milestones/${encodeURIComponent(milestoneId)}/status`,
    { status },
  );
  return Array.isArray(data?.milestones) ? data.milestones : [];
}
