export const MONITOR_TAB_THEMES = {
  home: { color: '#38bdf8', bg: 'rgba(56,189,248,0.16)', border: 'rgba(56,189,248,0.42)' },
  squads: { color: '#34d399', bg: 'rgba(52,211,153,0.16)', border: 'rgba(52,211,153,0.42)' },
  projects: { color: '#60a5fa', bg: 'rgba(96,165,250,0.16)', border: 'rgba(59,130,246,0.42)' },
  gigs: { color: '#c084fc', bg: 'rgba(192,132,252,0.16)', border: 'rgba(168,85,247,0.42)' },
  jobs: { color: '#fbbf24', bg: 'rgba(251,191,36,0.16)', border: 'rgba(245,158,11,0.42)' },
};

export function monitorTabStyle(section, active) {
  const theme = MONITOR_TAB_THEMES[section] || MONITOR_TAB_THEMES.home;
  if (!active) {
    return {
      color: theme.color,
      background: 'rgba(255,255,255,0.03)',
      borderColor: 'rgba(255,255,255,0.08)',
    };
  }
  return {
    color: '#fff',
    background: theme.bg,
    borderColor: theme.border,
    boxShadow: `0 0 18px -8px ${theme.color}`,
  };
}
