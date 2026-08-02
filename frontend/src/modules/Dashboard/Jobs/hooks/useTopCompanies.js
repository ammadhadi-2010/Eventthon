import { useCallback, useEffect, useMemo, useState } from 'react';
import { ALL_INDUSTRIES_LABEL, buildCompanyIndustries } from '../data/companiesData';
import { fetchTopCompanies } from '../services/jobsHubApi';

export default function useTopCompanies() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');
  const [industry, setIndustry] = useState(ALL_INDUSTRIES_LABEL);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        const data = await fetchTopCompanies();
        if (!cancelled) setRows(Array.isArray(data) ? data : []);
      } catch {
        if (!cancelled) setRows([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const industries = useMemo(() => buildCompanyIndustries(rows), [rows]);

  const filtered = useMemo(() => {
    const term = query.trim().toLowerCase();
    return rows.filter((company) => {
      const matchesIndustry =
        industry === ALL_INDUSTRIES_LABEL || company.industry === industry;
      const matchesQuery =
        !term ||
        company.name.toLowerCase().includes(term) ||
        String(company.industry || '')
          .toLowerCase()
          .includes(term);
      return matchesIndustry && matchesQuery;
    });
  }, [rows, query, industry]);

  const resetFilters = useCallback(() => {
    setQuery('');
    setIndustry(ALL_INDUSTRIES_LABEL);
  }, []);

  return {
    loading,
    filtered,
    industries,
    query,
    setQuery,
    industry,
    setIndustry,
    resetFilters,
    empty: !loading && rows.length === 0,
  };
}
