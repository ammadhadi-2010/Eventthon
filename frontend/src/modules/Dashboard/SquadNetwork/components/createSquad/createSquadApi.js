import API from '../../../../../api/axiosConfig';
import { createSquad, updateSquadInfo, updateSquadSettings } from '../../api/squadsApi';
import { getSquadsSessionHeaders } from '../../services/squadsSession';
import { buildCreateSquadSettings } from './createSquadUtils';

export async function fetchInviteTargets(query = '') {
  const res = await API.get('/api/posts/send-targets', {
    params: { query, limit: 100 },
    headers: getSquadsSessionHeaders(),
  });
  return res?.data?.data || [];
}

export async function submitCreateSquad(form, { userData, users = [], draft = false }) {
  const invited = users
    .filter((u) => form.invitedUserIds.includes(u._id))
    .map((u) => ({ name: u.name, role: u.role || 'Member' }));

  const payload = {
    name: form.name.trim(),
    leader_id: userData?._id || userData?.id || null,
    leader_name: `${userData?.first_name || 'You'} ${userData?.last_name || ''}`.trim(),
    description: form.description.trim(),
    category: form.category,
    privacy: form.privacy,
    banner: form.bannerPreview || null,
    imageurl: form.bannerPreview || null,
    settings: buildCreateSquadSettings(form),
    invited_members: invited,
    is_draft: draft,
  };

  return createSquad(payload);
}

export async function submitUpdateSquadInfo(squadId, form) {
  const res = await updateSquadInfo(squadId, {
    squad_name: form.name.trim(),
    niche: form.category || form.niche || '',
    description: form.description.trim(),
  });
  if (res?.status === 'error') return res;

  const settingsRes = await updateSquadSettings(squadId, buildCreateSquadSettings(form));
  if (settingsRes?.status === 'success' && res?.data) {
    return { ...res, data: { ...res.data, settings: settingsRes.data } };
  }
  return res;
}
