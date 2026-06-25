import { fetchInviteTargets } from '../components/createSquad/createSquadApi';
import { pickImageurl } from '../../utils/dashboardMedia';

/** Merge profile images from dashboard users when squad member rows only have names. */
export async function enrichSquadMembersWithAvatars(members = []) {
  if (!Array.isArray(members) || members.length === 0) return members;
  try {
    const targets = await fetchInviteTargets();
    if (!targets.length) return members;

    const byId = new Map(targets.map((user) => [String(user._id), user]));
    const byName = new Map(
      targets.map((user) => [String(user.name || '').trim().toLowerCase(), user]),
    );

    return members.map((member) => {
      const match =
        byId.get(String(member?.id || '')) ||
        byName.get(String(member?.name || '').trim().toLowerCase());
      if (!match) return member;

      const image = pickImageurl(match) || match.avatar || match.profile_image_url;
      if (!image) return member;

      return {
        ...member,
        imageurl: image,
        profile_image_url: image,
        avatar: image,
      };
    });
  } catch {
    return members;
  }
}
