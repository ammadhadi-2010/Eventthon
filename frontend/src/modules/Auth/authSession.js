import { companyInviteAcceptPath, getStoredCompanyInviteToken } from '../../utils/companyInviteStorage';

/** Persist login / OAuth session fields used across the app. */
export function persistAuthSession(user = {}, accessToken = '') {
  if (!user || typeof user !== 'object') return;

  localStorage.clear();

  if (user.email) localStorage.setItem('userEmail', user.email);
  if (user.mobile) localStorage.setItem('userMobile', user.mobile);
  if (user.user_id) localStorage.setItem('userId', user.user_id);
  if (user.first_name) {
    const fullName = [user.first_name, user.last_name].filter(Boolean).join(' ').trim();
    localStorage.setItem('userName', fullName || user.first_name);
  }
  if (user.role) localStorage.setItem('userRole', user.role);
  if (user.company_id) localStorage.setItem('companyId', user.company_id);
  if (user.company_status) localStorage.setItem('companyStatus', user.company_status);
  if (user.rank) localStorage.setItem('userRank', user.rank);
  if (user.picture) localStorage.setItem('userImageurl', user.picture);
  if (accessToken) localStorage.setItem('accessToken', accessToken);
}

export function resolvePostLoginPath(user = {}) {
  const invitePath = companyInviteAcceptPath(getStoredCompanyInviteToken());
  if (invitePath) return invitePath;
  if (user.role === 'admin') return '/admin-control';
  if (user.role === 'employer') return '/company/dashboard';
  return '/jobs';
}
