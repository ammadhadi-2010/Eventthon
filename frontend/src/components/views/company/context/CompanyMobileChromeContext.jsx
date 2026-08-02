import React, { createContext, useContext, useMemo, useState } from 'react';

const CompanyMobileChromeContext = createContext(null);

export function CompanyMobileChromeProvider({ children }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const value = useMemo(
    () => ({
      isSidebarOpen,
      setIsSidebarOpen,
      toggleSidebar: () => setIsSidebarOpen((open) => !open),
      closeSidebar: () => setIsSidebarOpen(false),
    }),
    [isSidebarOpen],
  );

  return (
    <CompanyMobileChromeContext.Provider value={value}>{children}</CompanyMobileChromeContext.Provider>
  );
}

export function useCompanyMobileChrome() {
  return useContext(CompanyMobileChromeContext);
}
