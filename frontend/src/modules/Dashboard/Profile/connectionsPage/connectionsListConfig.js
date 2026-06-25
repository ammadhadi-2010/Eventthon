/** Valid URL segment under `/profile/connections/:listKey` */
export const CONNECTIONS_LIST_KEYS = ['commanders', 'mutual', 'followers', 'following', 'connections'];

export function isValidListKey(key) {
  return CONNECTIONS_LIST_KEYS.includes(String(key || '').toLowerCase());
}

function fmtK(n) {
  const x = Math.max(0, Number(n) || 0);
  if (x >= 1000) return `${(x / 1000).toFixed(1)}K`.replace('.0K', 'K');
  return String(Math.floor(x));
}

/** UI copy + how rows behave in `UserListCard`. */
export function getListPageMeta(listKey, stats = {}) {
  const k = String(listKey || 'commanders').toLowerCase();
  const safe = isValidListKey(k) ? k : 'commanders';

  const meta = {
    commanders: {
      listMode: 'commanders',
      title: (s) => `Top Commanders (${fmtK(s.top_commanders ?? 8)})`,
      subtitle:
        'Top Commanders are elite leaders who lead squads and drive the community forward.',
      searchPlaceholder: 'Search commanders…',
      totalFromStats: (s) => s.top_commanders ?? 8,
    },
    mutual: {
      listMode: 'social',
      socialVariant: 'mutual',
      title: (s) => `Mutual Connections (${fmtK(s.connections_mutual ?? 24)})`,
      /** Filled in ConnectionsPage with signed-in user’s display name */
      resolveSubtitle: (viewerName) =>
        `People you and ${viewerName?.trim() || 'your profile'} both know.`,
      searchPlaceholder: 'Search connections…',
      totalFromStats: (s) => s.connections_mutual ?? 24,
    },
    followers: {
      listMode: 'social',
      title: (s) => `Followers (${fmtK(s.followers ?? 0)})`,
      subtitle: 'Everyone following your public updates.',
      searchPlaceholder: 'Search followers…',
      totalFromStats: (s) => s.followers ?? 0,
    },
    following: {
      listMode: 'social',
      title: (s) => `Following (${fmtK(s.following ?? 0)})`,
      subtitle: 'Creators and teams you follow across EventThon.',
      searchPlaceholder: 'Search following…',
      totalFromStats: (s) => s.following ?? 0,
    },
    connections: {
      listMode: 'social',
      title: (s) => `Connections (${fmtK(s.connections ?? 0)})`,
      subtitle: 'Your professional graph — message or connect in one tap.',
      searchPlaceholder: 'Search connections…',
      totalFromStats: (s) => s.connections ?? 0,
    },
  };

  return meta[safe];
}

export function viewAllHrefForSidebarKey(key) {
  const k = String(key).toLowerCase();
  if (!isValidListKey(k)) return '/profile/connections/commanders';
  return `/profile/connections/${k}`;
}
