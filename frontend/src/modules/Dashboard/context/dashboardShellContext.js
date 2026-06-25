import { createContext, useContext } from 'react';

const defaultValue = {
  mobileLeftDrawerOpen: false,
  setMobileLeftDrawerOpen: () => {},
  toggleMobileLeftDrawer: () => {},
  mobileUserMenuOpen: false,
  setMobileUserMenuOpen: () => {},
  toggleMobileUserMenu: () => {},
};

export const DashboardShellContext = createContext(defaultValue);

export function useDashboardShell() {
  return useContext(DashboardShellContext);
}
