import { navStyles, NAV_BAR_HEIGHT, navTheme } from '../../Dashboard/Navbar/NavStyles';

/** Shell chrome only — flex/grid layout lives in admin-global-navbar.css */
export const adminNavbarShellStyle = {
  width: '100%',
  minHeight: `${NAV_BAR_HEIGHT}px`,
  height: `${NAV_BAR_HEIGHT}px`,
  background: navTheme.bg,
  backdropFilter: navTheme.blur,
  WebkitBackdropFilter: navTheme.blur,
  padding: '0 24px',
  boxSizing: 'border-box',
  borderBottom: `1px solid ${navTheme.border}`,
  position: 'relative',
  zIndex: 100,
  flexShrink: 0,
};

export { navStyles };
