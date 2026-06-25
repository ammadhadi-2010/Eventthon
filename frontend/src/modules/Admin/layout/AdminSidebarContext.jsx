import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

const AdminSidebarContext = createContext(null);

export function AdminSidebarProvider({ children }) {
  const [open, setOpen] = useState(false);

  const toggle = useCallback(() => setOpen((value) => !value), []);
  const close = useCallback(() => setOpen(false), []);

  useEffect(() => {
    const onResize = () => {
      if (window.innerWidth >= 1024) setOpen(false);
    };
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  const value = useMemo(
    () => ({ open, setOpen, toggle, close }),
    [open, toggle, close],
  );

  return <AdminSidebarContext.Provider value={value}>{children}</AdminSidebarContext.Provider>;
}

export function useAdminSidebar() {
  const ctx = useContext(AdminSidebarContext);
  if (!ctx) {
    return { open: false, setOpen: () => {}, toggle: () => {}, close: () => {} };
  }
  return ctx;
}
