import { memberAvatar } from '../../SquadNetwork/components/workspace/squadWorkspaceData';

export function resolveProjectContributors(project) {
  const list = Array.isArray(project?.contributors) ? project.contributors.filter(Boolean) : [];
  if (list.length) {
    return list.map((c, i) => ({
      user_id: c.user_id || c.id || `c-${i}`,
      name: c.name || 'Member',
      avatar: c.avatar || c.image_url || c.imageurl || '',
      role: c.role || 'collaborator',
    }));
  }
  if (project?.owner) {
    return [
      {
        user_id: 'owner',
        name: project.owner,
        avatar: '',
        role: 'owner',
      },
    ];
  }
  return [];
}

export function contributorAvatarUrl(contributor) {
  if (contributor?.avatar) return contributor.avatar;
  return memberAvatar(contributor?.name, contributor?.user_id);
}

export function hasUserJoined(contributors, userId) {
  if (!userId) return false;
  return contributors.some((c) => String(c.user_id) === String(userId));
}
