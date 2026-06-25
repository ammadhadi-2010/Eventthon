import { mapPublicSquadShowroom } from './mapPublicSquadShowroom';

export function mapPublicToWorkspace(raw) {
  const data = mapPublicSquadShowroom(raw);
  if (!data) return null;

  const headerStats = data.headerStats || {};

  return {
    squad: {
      squad_name: data.displayName,
      niche: data.professionalRole,
      description: data.dynamicBio,
      banner: data.avatar,
      icon: data.icon,
      efficiency: headerStats.activityScore || '98%',
      created_at: data.createdLabel,
      slug: data.squadSlug,
      settings: { publicListing: data.isPublic !== false },
    },
    state: {
      squadStats: data.squadStats || [],
      projects: (data.activeProjects || []).map((p) => ({
        id: p.id,
        title: p.title,
        status: p.status,
        owner: p.owner,
        progress: p.progress,
        tags: p.tags,
      })),
      members: (data.members || data.membersPreview || []).map((m, i) => ({
        id: m.id || `m-${i}`,
        name: m.name || m.displayName || 'Member',
        avatar: m.avatar,
        role: m.role || 'Member',
        online: Boolean(m.online),
      })),
      activity: data.recentActivity || [],
      activityFeed: (data.recentActivity || []).map((item, i) => ({
        id: item.id || `a-${i}`,
        text: item.text || item.message,
        actor_name: item.actor_name || item.actor,
        time: item.time || item.created_at,
      })),
      files: data.recentFiles || [],
      chatMessages: [],
    },
    headerStats: {
      members: headerStats.members ?? data.memberCount ?? 0,
      online: headerStats.online ?? 0,
      projects: headerStats.projects ?? (data.activeProjects?.length || 0),
    },
    tabCounts: data.tabCounts || {},
  };
}
