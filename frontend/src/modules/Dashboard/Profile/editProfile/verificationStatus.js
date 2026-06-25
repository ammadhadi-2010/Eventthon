/**
 * Identity / KYC state for edit profile + live preview.
 * Primary: `admin_status` — 'pending' | 'approved' (lowercase in API).
 * Legacy: `identity_status` Pending Review / Active, `verified` boolean.
 */

export function normalizeAdminStatus(userData) {
  if (!userData || typeof userData !== 'object') return null;
  const raw = userData.admin_status;
  if (raw != null && String(raw).trim() !== '') {
    return String(raw).trim().toLowerCase();
  }
  const legacy = String(userData.identity_status || '').trim();
  if (legacy === 'Pending Review') return 'pending';
  const verifiedFlag =
    userData.verified === true || userData.verified === 'true' || userData.verified === 1;
  if (legacy === 'Active' || legacy.toLowerCase() === 'verified' || verifiedFlag) return 'approved';
  return null;
}

export function isVerificationPending(userData) {
  return normalizeAdminStatus(userData) === 'pending';
}

export function isVerificationApproved(userData) {
  return normalizeAdminStatus(userData) === 'approved';
}
