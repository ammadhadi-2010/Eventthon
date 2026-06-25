import { useCallback, useEffect, useState } from 'react';
import { fetchCompanyPortalDashboard } from '../services/companyPortalApi';
import {
  patchCompanyWorkspaceCacheCompany,
  readCompanyWorkspaceCache,
  writeCompanyWorkspaceCache,
} from '../utils/companyWorkspaceCache';

function parseCompanyPortalError(err) {
  const detail = err?.response?.data?.detail;
  if (typeof detail === 'string') return detail;
  if (Array.isArray(detail)) return detail.map((d) => d?.msg || d).join(', ');
  return err?.message || 'Could not load company dashboard.';
}

export function useCompanyPortalStandalone() {
  const [data, setData] = useState(() => readCompanyWorkspaceCache());
  const [loading, setLoading] = useState(() => !readCompanyWorkspaceCache());
  const [error, setError] = useState('');

  const load = useCallback(async ({ background = false } = {}) => {
    if (!background) setLoading(true);
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

  return { data, loading, error, reload: () => load({ background: false }) };
}
