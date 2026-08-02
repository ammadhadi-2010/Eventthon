import API from '../../../../api/axiosConfig';
import { resolveCompanyPortalUserId } from '../utils/companyWorkspaceCache';

function uid() {
  const user_id = resolveCompanyPortalUserId();
  if (!user_id || user_id.length < 2) {
    throw new Error('Sign in to manage company team.');
  }
  return user_id;
}

export async function fetchCompanyTeam() {
  const user_id = uid();
  const { data } = await API.get(
    `/api/company-portal/team?user_id=${encodeURIComponent(user_id)}`,
  );
  return data?.data || null;
}

export async function inviteCompanyMember({ email, role }) {
  const { data } = await API.post('/api/company-portal/team/invite', {
    user_id: uid(),
    email,
    role,
  });
  return data?.data || null;
}

export async function fetchMyCompanyInvites() {
  const user_id = uid();
  const { data } = await API.get(
    `/api/company-portal/team/invites/mine?user_id=${encodeURIComponent(user_id)}`,
  );
  return data?.data || [];
}

export async function fetchCompanyInvitePreview(token) {
  const { data } = await API.get(`/api/company-portal/team/invites/${encodeURIComponent(token)}`);
  return data?.data || null;
}

export async function acceptCompanyInvite(token) {
  const { data } = await API.post(`/api/company-portal/team/invites/${encodeURIComponent(token)}/accept`, {
    user_id: uid(),
  });
  return data?.data || null;
}

export async function declineCompanyInvite(token) {
  const { data } = await API.post(`/api/company-portal/team/invites/${encodeURIComponent(token)}/decline`, {
    user_id: uid(),
  });
  return data?.data || null;
}

export async function revokeCompanyInvite(inviteId) {
  const { data } = await API.post(
    `/api/company-portal/team/invites/${encodeURIComponent(inviteId)}/revoke`,
    { user_id: uid() },
  );
  return data?.data || null;
}

export async function changeCompanyMemberRole(memberId, role) {
  const { data } = await API.post(
    `/api/company-portal/team/members/${encodeURIComponent(memberId)}/role`,
    { user_id: uid(), role },
  );
  return data?.data || null;
}

export async function suspendCompanyMember(memberId, reason = '') {
  const { data } = await API.post(
    `/api/company-portal/team/members/${encodeURIComponent(memberId)}/suspend`,
    { user_id: uid(), reason },
  );
  return data?.data || null;
}

export async function unsuspendCompanyMember(memberId) {
  const { data } = await API.post(
    `/api/company-portal/team/members/${encodeURIComponent(memberId)}/unsuspend`,
    { user_id: uid() },
  );
  return data?.data || null;
}

export async function removeCompanyMember(memberId) {
  const { data } = await API.post(
    `/api/company-portal/team/members/${encodeURIComponent(memberId)}/remove`,
    { user_id: uid() },
  );
  return data?.data || null;
}

export async function transferCompanyOwnership(targetMemberId, confirmationEmail) {
  const { data } = await API.post('/api/company-portal/team/transfer-ownership', {
    user_id: uid(),
    target_member_id: targetMemberId,
    confirmation_email: confirmationEmail,
  });
  return data?.data || null;
}
