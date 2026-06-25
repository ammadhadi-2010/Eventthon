export const pageOptions = ['Blue Page', 'Green Page', 'Purple Page', 'Amber Page'];

export const getPageLabel = (member, index) => member.page || pageOptions[index % pageOptions.length];

export const pillStyle = (bg, color) => ({
  width: 'fit-content',
  padding: '4px 10px',
  borderRadius: '999px',
  background: bg,
  color,
  fontSize: '11px',
  fontWeight: '700',
});

export const optionalPill = (member, index) => {
  const label = getPageLabel(member, index).toLowerCase();
  if (label.includes('green')) return pillStyle('rgba(16,185,129,0.22)', '#6ee7b7');
  if (label.includes('purple')) return pillStyle('rgba(168,85,247,0.22)', '#d8b4fe');
  if (label.includes('amber')) return pillStyle('rgba(245,158,11,0.22)', '#fcd34d');
  return pillStyle('rgba(59,130,246,0.22)', '#93c5fd');
};

export const formatJoinDate = (member, index) => {
  const raw = member.joined || member.joined_at || member.created_at;
  if (raw) {
    const date = new Date(raw);
    if (!Number.isNaN(date.getTime())) {
      return date.toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' });
    }
  }
  const base = new Date('2024-01-15T00:00:00Z');
  base.setDate(base.getDate() + index * 11);
  return base.toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' });
};

export const getStatus = (member, index) => {
  if (member.online) return { key: 'online', label: 'Online' };
  return index % 3 === 0 ? { key: 'away', label: 'Away' } : { key: 'offline', label: 'Offline' };
};

export const rolePill = (role) => {
  const clean = String(role || 'Member').toLowerCase();
  if (clean === 'admin') {
    return pillStyle('rgba(168,85,247,0.25)', '#e9d5ff');
  }
  if (clean === 'moderator') {
    return pillStyle('rgba(59,130,246,0.22)', '#93c5fd');
  }
  return pillStyle('rgba(100,116,139,0.25)', '#cbd5e1');
};

export const memberCredential = (member) =>
  member.email || member.mobile || member.handle || member.id || 'Squad member';
