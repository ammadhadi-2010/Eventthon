import { isSquadPubliclyListed } from './squadPublicPaths';

export function getUserId(userData) {
  return userData?._id || userData?.id || null;
}

function normalizeMembers(squad) {
  const raw = squad?.members;
  if (!Array.isArray(raw)) return [];
  return raw.filter((m) => m && typeof m === 'object');
}

/** Creator / admin who can edit squad details. */
export function isSquadLeader(squad, userData) {
  if (!squad) return false;
  const uid = getUserId(userData);
  if (uid && squad.leader_id && String(squad.leader_id) === String(uid)) return true;

  const name = `${userData?.first_name || ''} ${userData?.last_name || ''}`.trim().toLowerCase();
  const members = normalizeMembers(squad);
  return members.some((m) => {
    const role = String(m?.role || '').toLowerCase();
    if (role !== 'admin') return false;
    if (uid && m?.id && String(m.id) === String(uid)) return true;
    if (name && String(m?.name || '').toLowerCase() === name) return true;
    return false;
  });
}

/** Only the squad creator (leader) may invite new members. */
export function canInviteSquadMembers(squad, userData) {
  if (!squad) return false;
  const uid = getUserId(userData);
  if (!uid || !squad.leader_id) return false;
  return String(squad.leader_id) === String(uid);
}

/** Member-only hub access (private squads stay in dashboard for members). */
export function isSquadMember(squad, userData) {
  if (!squad) return false;
  if (isSquadLeader(squad, userData)) return true;
  const uid = getUserId(userData);
  const members = normalizeMembers(squad);
  if (uid && members.some((m) => m?.id && String(m.id) === String(uid))) return true;
  const name = `${userData?.first_name || ''} ${userData?.last_name || ''}`.trim().toLowerCase();
  if (name && members.some((m) => String(m?.name || '').toLowerCase() === name)) return true;
  return false;
}

/** Only public squads open the Explore / public showroom. */
export function canOpenPublicExplore(squad) {
  return isSquadPubliclyListed(squad);
}
