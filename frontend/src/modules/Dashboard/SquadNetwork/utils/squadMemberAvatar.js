import { getAvatarUrl } from '../../Navbar/userMenuUtils';
import { resolveDashboardMediaUrl } from '../../utils/dashboardMedia';
import { resolveProfileAvatar } from '../../Profile/utils/profileMedia';

function firstResolvableAvatar(member) {
  const fields = [
    member?.imageurl,
    member?.imageUrl,
    member?.image_url,
    member?.profile_image_url,
    member?.profileImage,
    member?.avatar,
  ];
  for (const field of fields) {
    const raw = String(field || '').trim();
    if (!raw || raw.includes('ep-live-preview')) continue;
    const resolved = resolveDashboardMediaUrl(raw) || resolveProfileAvatar({ imageurl: raw });
    if (resolved) return resolved;
  }
  return '';
}

export function squadMemberAvatarSrc(member) {
  const resolved = firstResolvableAvatar(member);
  if (resolved) return resolved;
  return getAvatarUrl({
    name: member?.name,
    email: member?.email,
    profile_image_url: member?.profile_image_url || member?.avatar || member?.imageurl,
  });
}
