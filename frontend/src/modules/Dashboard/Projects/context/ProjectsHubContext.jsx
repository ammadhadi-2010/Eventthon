import React, { createContext, useContext } from 'react';

const ProjectsHubContext = createContext(null);

export function ProjectsHubProvider({ value, children }) {
  return <ProjectsHubContext.Provider value={value}>{children}</ProjectsHubContext.Provider>;
}

export function useProjectsHub() {
  const ctx = useContext(ProjectsHubContext);
  if (!ctx) {
    throw new Error('useProjectsHub must be used within ProjectsHubProvider');
  }
  return ctx;
}
