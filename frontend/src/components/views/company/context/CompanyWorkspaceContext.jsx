import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { fetchCompanyPortalDashboard } from '../services/companyPortalApi';
import {
  patchCompanyWorkspaceCacheCompany,
  readCompanyWorkspaceCache,
  writeCompanyWorkspaceCache,
} from '../utils/companyWorkspaceCache';

const CompanyWorkspaceContext = createContext(null);

function parseCompanyPortalError(err) {
  const detail = err?.response?.data?.detail;
  if (typeof detail === 'string') return detail;
  if (Array.isArray(detail)) return detail.map((d) => d?.msg || d).join(', ');
  return err?.message || 'Could not load company workspace.';
}

function useCompanyPortalState() {
  const [data, setData] = useState(() => readCompanyWorkspaceCache());
  const [loading, setLoading] = useState(() => !readCompanyWorkspaceCache());
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');

  const load = useCallback(async ({ background = false } = {}) => {
    if (background) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }
    setError('');
    try {
      const payload = await fetchCompanyPortalDashboard();
      setData(payload);
      writeCompanyWorkspaceCache(payload);
    } catch (err) {
      if (!background) {
        setData(null);
        setError(parseCompanyPortalError(err));
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    load({ background: Boolean(readCompanyWorkspaceCache()) });
  }, [load]);

  useEffect(() => {
    const onCompanyUpdated = (event) => {
      const nextCompany = event?.detail?.company;
      if (!nextCompany) return;
      setData((prev) => {
        if (!prev) return prev;
        const next = { ...prev, company: { ...(prev.company || {}), ...nextCompany } };
        writeCompanyWorkspaceCache(next);
        return next;
      });
      patchCompanyWorkspaceCacheCompany(nextCompany);
    };
    window.addEventListener('et:company-updated', onCompanyUpdated);
    return () => window.removeEventListener('et:company-updated', onCompanyUpdated);
  }, []);

  const reload = useCallback(() => load({ background: false }), [load]);

  return { data, loading, refreshing, error, reload };
}

export function CompanyWorkspaceProvider({ children }) {
  const value = useCompanyPortalState();
  return <CompanyWorkspaceContext.Provider value={value}>{children}</CompanyWorkspaceContext.Provider>;
}

export function useCompanyWorkspace() {
  return useContext(CompanyWorkspaceContext);
}
