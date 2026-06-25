import React, { createContext, useContext } from 'react';
import { useJobsHubState } from '../hooks/useJobsHubState';

const JobsHubContext = createContext(null);

export function JobsHubProvider({ children }) {
  const value = useJobsHubState();
  return <JobsHubContext.Provider value={value}>{children}</JobsHubContext.Provider>;
}

export function useJobsHub() {
  const ctx = useContext(JobsHubContext);
  if (!ctx) throw new Error('useJobsHub must be used within JobsHubProvider');
  return ctx;
}
