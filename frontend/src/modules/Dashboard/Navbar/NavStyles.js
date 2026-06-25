export const navTheme = {
  bg: 'rgba(2, 6, 23, 0.92)',
  blur: '20px saturate(180%)',
  textPrimary: '#ffffff',
  textSecondary: '#94a3b8',
  accent: '#3b82f6',
  border: 'rgba(255, 255, 255, 0.1)',
};

export const NAV_BAR_HEIGHT = 70;

export const navStyles = {
  container: {
    width: '100%',
    minHeight: `${NAV_BAR_HEIGHT}px`,
    height: `${NAV_BAR_HEIGHT}px`,
    background: navTheme.bg,
    backdropFilter: navTheme.blur,
    WebkitBackdropFilter: navTheme.blur,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '0 24px',
    boxSizing: 'border-box',
    borderBottom: `1px solid ${navTheme.border}`,
    position: 'relative',
    zIndex: 100,
    flexShrink: 0,
  },

  sectionLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
    flex: '1 1 280px',
    minWidth: 0,
  },

  sectionCenter: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '28px',
    flex: '2 1 auto',
    minWidth: 0,
  },

  sectionRight: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    flex: '1 1 280px',
    justifyContent: 'flex-end',
    minWidth: 0,
  },

  logo: {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    flexShrink: 0,
    width: 44,
    height: 44,
  },

  logoGlow: {
    position: 'absolute',
    inset: -4,
    borderRadius: 12,
    background: 'radial-gradient(circle, rgba(59,130,246,0.35) 0%, transparent 70%)',
    pointerEvents: 'none',
  },

  searchWrapper: {
    position: 'relative',
    flex: '1 1 200px',
    maxWidth: 280,
    minWidth: 140,
    display: 'flex',
    alignItems: 'center',
  },

  searchInput: {
    width: '100%',
    padding: '10px 15px 10px 40px',
    background: 'rgba(255, 255, 255, 0.05)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    borderRadius: '8px',
    color: '#fff',
    outline: 'none',
    fontSize: '14px',
    boxSizing: 'border-box',
  },

  navItem: (active) => ({
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    gap: '4px',
    color: active ? navTheme.accent : navTheme.textSecondary,
    position: 'relative',
    flexShrink: 0,
    minWidth: 52,
  }),

  activeGlowLine: {
    position: 'absolute',
    bottom: -8,
    left: '50%',
    transform: 'translateX(-50%)',
    width: 28,
    height: 3,
    borderRadius: 999,
    background: navTheme.accent,
    boxShadow: '0 0 12px rgba(59, 130, 246, 0.6)',
  },

  profileBox: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    cursor: 'pointer',
    padding: '5px 10px',
    borderRadius: '12px',
    background: 'rgba(255, 255, 255, 0.03)',
    border: '1px solid rgba(255, 255, 255, 0.05)',
    position: 'relative',
    flexShrink: 0,
  },

  rightSideIcon: {
    width: '34px',
    height: '34px',
    borderRadius: '10px',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    background: 'rgba(255, 255, 255, 0.04)',
    color: '#cbd5e1',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    position: 'relative',
    flexShrink: 0,
  },

  avatarWrapper: {
    position: 'relative',
    width: '36px',
    height: '36px',
    flexShrink: 0,
    borderRadius: '50%',
    overflow: 'hidden',
    border: '2px solid rgba(99, 102, 241, 0.4)',
    background: '#1e293b',
    boxSizing: 'border-box',
  },

  avatarImg: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
    objectPosition: 'center center',
    display: 'block',
    verticalAlign: 'middle',
  },

  onlineStatus: {
    position: 'absolute',
    bottom: -1,
    right: -1,
    width: 11,
    height: 11,
    borderRadius: '50%',
    background: '#22c55e',
    border: '2px solid #020617',
    zIndex: 2,
    pointerEvents: 'none',
    boxSizing: 'border-box',
  },

  profileName: {
    color: '#fff',
    fontSize: '13px',
    fontWeight: '600',
    whiteSpace: 'nowrap',
  },

  neonBadge: {
    position: 'absolute',
    top: '-5px',
    right: '-8px',
    background: '#ef4444',
    color: '#fff',
    fontSize: '10px',
    fontWeight: 'bold',
    padding: '1px 5px',
    borderRadius: '10px',
    boxShadow: '0 0 10px rgba(239, 68, 68, 0.5)',
  },
};
