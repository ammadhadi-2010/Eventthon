import {
  COMMUNITY_ACTIONS,
  COMMUNITY_CATEGORIES,
  COMMUNITY_STATS,
  COMMUNITY_SUBTITLE,
  FEATURED_DISCUSSIONS,
  TOP_MEMBERS,
  TRENDING_TOPICS,
  UPCOMING_EVENTS,
} from '../data/communityData';

function pipeJoin(parts) {
  return parts.map((p) => String(p ?? '').replace(/\|/g, '/').replace(/\n/g, ' ')).join('|');
}

export function serializeCommunityContent({
  actions = COMMUNITY_ACTIONS,
  discussions = FEATURED_DISCUSSIONS,
  categories = COMMUNITY_CATEGORIES,
  trending = TRENDING_TOPICS,
  events = UPCOMING_EVENTS,
  members = TOP_MEMBERS,
  stats = COMMUNITY_STATS,
} = {}) {
  return [
    '## actions',
    actions.map((a) => pipeJoin([a.id, a.title, a.text, a.cta, a.tone, a.icon, a.to || ''])).join('\n'),
    '',
    '## discussions',
    discussions
      .map((d) => pipeJoin([d.title, d.summary, d.replies, d.icon, d.tone, (d.avatars || []).join(',')]))
      .join('\n'),
    '',
    '## categories',
    categories.map((c) => pipeJoin([c.id, c.label, c.members, c.icon, c.tone])).join('\n'),
    '',
    '## trending',
    trending.map((t) => pipeJoin([t.title, t.replies])).join('\n'),
    '',
    '## events',
    events.map((e) => pipeJoin([e.title, e.when, e.cta, e.icon, e.tone])).join('\n'),
    '',
    '## members',
    members.map((m) => pipeJoin([m.name, m.role, m.points, m.medal || '', m.initial || '', m.avatar || ''])).join('\n'),
    '',
    '## stats',
    stats.map((s) => pipeJoin([s.id, s.label, s.value, s.online ? 'online' : ''])).join('\n'),
  ].join('\n');
}

export function parseCommunityContent(content) {
  const text = String(content || '');
  const section = (name) => {
    const re = new RegExp(`##\\s*${name}\\s*\\n([\\s\\S]*?)(?=\\n##\\s|$)`, 'i');
    return (text.match(re)?.[1] || '').trim();
  };
  const rows = (block, min = 2) =>
    block
      .split('\n')
      .map((l) => l.trim())
      .filter(Boolean)
      .map((l) => l.split('|').map((p) => p.trim()))
      .filter((p) => p.length >= min);

  const actions = rows(section('actions'), 2).map(([id, title, textRow, cta, tone, icon, to]) => ({
    id: id || 'action',
    title,
    text: textRow || '',
    cta: cta || 'Open →',
    tone: tone || 'violet',
    icon: icon || 'help',
    to: to || '/resources/community',
  }));

  const discussions = rows(section('discussions'), 2).map(([title, summary, replies, icon, tone, avatars], i) => ({
    id: `d-${i}-${String(title || '').toLowerCase().replace(/[^a-z0-9]+/g, '-')}`,
    title,
    summary: summary || '',
    replies: Number(String(replies).replace(/[^0-9]/g, '')) || 0,
    icon: icon || 'star',
    tone: tone || 'violet',
    avatars: (avatars || 'A,B,C').split(',').map((a) => a.trim()).filter(Boolean).slice(0, 3),
  }));

  const categories = rows(section('categories'), 2).map(([id, label, members, icon, tone]) => ({
    id: id || 'general',
    label: label || id,
    members: members || '',
    icon: icon || 'users',
    tone: tone || 'violet',
  }));

  const trending = rows(section('trending'), 1).map(([title, replies], i) => ({
    id: `t-${i}`,
    title,
    replies: Number(String(replies).replace(/[^0-9]/g, '')) || 0,
  }));

  const events = rows(section('events'), 2).map(([title, when, cta, icon, tone], i) => ({
    id: `e-${i}`,
    title,
    when: when || '',
    cta: cta || 'Register',
    icon: icon || 'calendar',
    tone: tone || 'violet',
  }));

  const members = rows(section('members'), 2).map(([name, role, points, medal, initial, avatar], i) => ({
    id: `m-${i}`,
    name,
    role: role || 'Member',
    points: Number(String(points).replace(/[^0-9]/g, '')) || 0,
    medal: medal || '',
    initial: initial || (name || '?')[0].toUpperCase(),
    avatar: avatar || `https://api.dicebear.com/8.x/avataaars/svg?seed=${encodeURIComponent(name || `m-${i}`)}`,
  }));

  const stats = rows(section('stats'), 2).map(([id, label, value, online]) => ({
    id: id || label,
    label,
    value: value || '',
    online: String(online || '').toLowerCase() === 'online',
  }));

  // Legacy fallbacks
  const legacyLb = rows(section('leaderboard'), 3);
  const legacyThreads = rows(section('threads'), 2);

  return {
    actions: actions.length ? actions : COMMUNITY_ACTIONS,
    discussions: discussions.length
      ? discussions
      : legacyThreads.length
        ? legacyThreads.map(([title, replies], i) => ({
            id: `legacy-${i}`,
            title,
            summary: '',
            replies: Number(String(replies).replace(/[^0-9]/g, '')) || 0,
            icon: 'star',
            tone: 'violet',
            avatars: ['A', 'B', 'C'],
          }))
        : FEATURED_DISCUSSIONS,
    categories: categories.length ? categories : COMMUNITY_CATEGORIES,
    trending: trending.length ? trending : TRENDING_TOPICS,
    events: events.length ? events : UPCOMING_EVENTS,
    members: members.length
      ? members
      : legacyLb.length
        ? legacyLb.map(([rank, name, points], i) => ({
            id: `lb-${rank}`,
            name,
            role: i === 0 ? 'Top Contributor' : 'Active Member',
            points: Number(String(points).replace(/[^0-9]/g, '')) || 0,
            medal: i === 0 ? 'gold' : i === 1 ? 'silver' : i === 2 ? 'bronze' : '',
            initial: (name || '?')[0].toUpperCase(),
            avatar: `https://api.dicebear.com/8.x/avataaars/svg?seed=${encodeURIComponent(name || `lb-${i}`)}`,
          }))
        : TOP_MEMBERS,
    stats: stats.length ? stats : COMMUNITY_STATS,
  };
}

export function defaultCommunityFormFields() {
  return {
    title: 'Community',
    excerpt: COMMUNITY_SUBTITLE,
    externalUrl: 'https://discord.com/invite/eventthon',
    content: serializeCommunityContent(),
    sidebarOrder: 0,
  };
}
