const TOKEN_KEY = 'et_company_invite_token';
const EMAIL_KEY = 'et_company_invite_email';

export function storeCompanyInvite(token, email = '') {
  if (typeof window === 'undefined') return;
  const t = String(token || '').trim();
  if (!t) return;
  sessionStorage.setItem(TOKEN_KEY, t);
  const em = String(email || '').trim().toLowerCase();
  if (em) sessionStorage.setItem(EMAIL_KEY, em);
}

export function captureCompanyInviteFromUrl(search = '') {
  if (typeof window === 'undefined') return { token: '', email: '' };
  const params = new URLSearchParams(search || window.location.search);
  const token = String(params.get('invite') || '').trim();
  const email = String(params.get('email') || '').trim().toLowerCase();
  if (token) storeCompanyInvite(token, email);
  return {
    token: token || getStoredCompanyInviteToken(),
    email: email || getStoredCompanyInviteEmail(),
  };
}

export function getStoredCompanyInviteToken() {
  if (typeof window === 'undefined') return '';
  return String(sessionStorage.getItem(TOKEN_KEY) || '').trim();
}

export function getStoredCompanyInviteEmail() {
  if (typeof window === 'undefined') return '';
  return String(sessionStorage.getItem(EMAIL_KEY) || '').trim().toLowerCase();
}

export function clearStoredCompanyInvite() {
  if (typeof window === 'undefined') return;
  sessionStorage.removeItem(TOKEN_KEY);
  sessionStorage.removeItem(EMAIL_KEY);
}

export function companyInviteAcceptPath(token) {
  const t = String(token || getStoredCompanyInviteToken() || '').trim();
  return t ? `/company/invite/${encodeURIComponent(t)}` : '';
}
