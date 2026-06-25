import { useCallback, useEffect, useState } from 'react';
import { fetchCompanyDetail } from '../../../../services/adminCompanyService';

export default function useCompanyDetail(companyId) {
  const [company, setCompany] = useState(null);
  const [loading, setLoading] = useState(Boolean(companyId));
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    if (!companyId) {
      setCompany(null);
      setLoading(false);
      return;
    }
    setLoading(true);
    setError('');
    try {
      const data = await fetchCompanyDetail(companyId);
      setCompany(data);
      if (!data) setError('Company not found.');
    } catch (err) {
      setCompany(null);
      setError(err?.response?.data?.detail || err?.message || 'Could not load company.');
    } finally {
      setLoading(false);
    }
  }, [companyId]);

  useEffect(() => {
    load();
  }, [load]);

  return { company, loading, error, refetch: load, setCompany };
}
