import { API_BASE_URL } from '../../../../api/axiosConfig';

export const SQUAD_FILTER_TABS = ['ALL SQUADS', 'ACTIVE', 'PENDING', 'SUSPENDED', 'DISBANDED'];

export function resolveSquadMediaUrl(path) {
  if (!path || typeof path !== 'string') return '';
  const trimmed = path.trim();
  if (!trimmed) return '';
  if (trimmed.startsWith('http') || trimmed.startsWith('blob:') || trimmed.startsWith('data:')) return trimmed;
  return `${API_BASE_URL}${trimmed.startsWith('/') ? trimmed : `/${trimmed}`}`;
}

export const SQUAD_STATS = [
  { id: 'totalSquads', label: 'Total Squads', value: '24', change: '+18.5%', detail: 'vs last month', color: '#8b5cf6', icon: 'users' },
  { id: 'activeSquads', label: 'Active Squads', value: '18', change: '+15.2%', detail: 'vs last month', color: '#10b981', icon: 'activity' },
  { id: 'totalMembers', label: 'Total Members', value: '342', change: '+22.1%', detail: 'vs last month', color: '#06b6d4', icon: 'badgeCheck' },
  { id: 'pendingRequests', label: 'Pending Requests', value: '4', change: '-5.3%', detail: 'vs last month', color: '#ef4444', icon: 'userX' },
];

export function squadAvatar(seed) {
  return `https://api.dicebear.com/8.x/adventurer/svg?seed=${encodeURIComponent(seed)}`;
}

export function resolveSquadImageurl(row = {}) {
  const raw = String(
    row.imageurl || row.image_url || row.profile_image_url || row.avatar || '',
  ).trim();
  if (raw) return resolveSquadMediaUrl(raw) || raw;
  return squadAvatar(row.name || 'squad');
}

export function mapSquadMemberFromApi(member = {}, index = 0) {
  const name = member.name || member.full_name || 'Member';
  const imageurl = resolveSquadMediaUrl(
    member.imageurl || member.image_url || member.profile_image_url || member.avatar || '',
  );
  return {
    id: member.id || member._id || `member-${index}`,
    name,
    handle: member.handle || member.username || `@${name.toLowerCase().replace(/\s+/g, '.')}`,
    role: member.role || 'Member',
    status: member.online ? 'Online' : member.status || 'Offline',
    imageurl,
  };
}

function pickLeaderInfo(item = {}) {
  const members = Array.isArray(item.members) ? item.members : [];
  const leaderId = String(item.leader_id || '').trim();
  const leaderMember =
    members.find((m) => String(m.id || m._id || '') === leaderId) ||
    members.find((m) => /admin|leader/i.test(String(m.role || ''))) ||
    members[0];
  if (leaderMember) {
    const mapped = mapSquadMemberFromApi(leaderMember);
    return {
      leader: mapped.name,
      leaderHandle: mapped.handle,
      leaderImageurl: resolveSquadMediaUrl(mapped.imageurl) || mapped.imageurl,
    };
  }
  return {
    leader: item.leader_name || 'Squad Leader',
    leaderHandle: leaderId ? `@${leaderId}` : '@leader',
    leaderImageurl: item.leader_imageurl || item.leader_image_url || '',
  };
}

function mapSquadAdminStatus(item = {}) {
  const raw = String(item.admin_status || item.status || 'active').toLowerCase();
  if (raw === 'disbanded' || raw === 'archived') return 'DISBANDED';
  if (raw === 'suspended') return 'SUSPENDED';
  if (raw === 'draft' || raw === 'pending') return 'PENDING';
  return 'ACTIVE';
}

export const SQUAD_STATUS_CLASS = {
  ACTIVE: 'um-status--active',
  PENDING: 'um-status--pending',
  SUSPENDED: 'um-status--suspended',
  DISBANDED: 'um-status--deleted',
};

export function getSquadDetailTabs(squad) {
  const memberCount = Number(squad?.members || 0);
  const projectCount = Number(squad?.metrics?.projects || 0);
  return ['Overview', `Members (${memberCount})`, `Projects (${projectCount})`, 'Activity', 'Settings'];
}

export function mapSquadSummaryFromApi(item = {}) {
  const name = item.squad_name || item.name || 'Squad';
  const members = Number(item.members_count ?? item.members?.length ?? 0);
  const projects = Number(item.projects_count ?? item.projects?.length ?? 0);
  const online = Number(item.online ?? 0);
  const leaderInfo = pickLeaderInfo(item);
  const membersList = Array.isArray(item.members)
    ? item.members.map((member, index) => mapSquadMemberFromApi(member, index))
    : [];
  return {
    id: String(item._id || item.id || ''),
    name,
    handle: `@${name.toLowerCase().replace(/\s+/g, '')}`,
    imageurl: resolveSquadMediaUrl(item.imageurl || item.image_url || item.banner || '') || squadAvatar(name),
    category: item.niche || 'General',
    members,
    leader: leaderInfo.leader,
    leaderHandle: leaderInfo.leaderHandle,
    leaderImageurl: leaderInfo.leaderImageurl,
    leader_id: item.leader_id,
    status: mapSquadAdminStatus(item),
    visibility: item.settings?.memberApproval ? 'Approval Required' : 'Public',
    squadType: 'Professional',
    createdOn: item.created_at ? new Date(item.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—',
    description: item.description || 'No squad description available.',
    rules: ['Be active and respectful', 'No spam or self-promotion', 'Share valuable content', 'Help other members'],
    metrics: {
      online,
      projects,
      completed: Math.max(0, Math.round(projects * 2.2)),
      rating: '4.8',
    },
    membersList,
    projectsList: Array.isArray(item.projects) ? item.projects : [],
    activityList: Array.isArray(item.activity_feed) ? item.activity_feed : [],
  };
}
