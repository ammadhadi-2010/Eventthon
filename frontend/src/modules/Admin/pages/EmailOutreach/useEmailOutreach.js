import { useCallback, useEffect, useState } from 'react';
import { fetchOutreachLeads } from '../../services/emailOutreachApi';
import { mapOutreachLead } from './outreachLeadMapper';
import { OUTREACH_PAGE_SIZE } from './outreachData';

const EMPTY_COUNTS = { all: 0, not_contacted: 0, emailed: 0, replied: 0, interested: 0 };

export default function useEmailOutreach() {
  const [tab, setTab] = useState('all');
  const [query, setQuery] = useState('');
  const [page, setPage] = useState(1);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [rows, setRows] = useState([]);
  const [tabCounts, setTabCounts] = useState(EMPTY_COUNTS);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [reloadKey, setReloadKey] = useState(0);

  const refresh = useCallback(() => setReloadKey((k) => k + 1), []);

  useEffect(() => {
    let alive = true;
    setLoading(true);
    setError('');
    fetchOutreachLeads({ page, page_size: OUTREACH_PAGE_SIZE, tab, q: query })
      .then((data) => {
        if (!alive) return;
        setRows((data?.rows || []).map(mapOutreachLead));
        setTabCounts(data?.tabCounts || EMPTY_COUNTS);
        setTotalItems(data?.totalItems || 0);
        setTotalPages(data?.totalPages || 1);
      })
      .catch((err) => {
        if (!alive) return;
        setRows([]);
        setError(err?.response?.data?.detail || err?.message || 'Failed to load leads');
      })
      .finally(() => {
        if (alive) setLoading(false);
      });
    return () => {
      alive = false;
    };
  }, [page, tab, query, reloadKey]);

  const handleTabChange = (nextTab) => {
    setTab(nextTab);
    setPage(1);
  };

  const handleQueryChange = (value) => {
    setQuery(value);
    setPage(1);
  };

  return {
    tab,
    setTab: handleTabChange,
    query,
    setQuery: handleQueryChange,
    page,
    setPage,
    filtersOpen,
    setFiltersOpen,
    tabCounts,
    rows,
    pageSize: OUTREACH_PAGE_SIZE,
    totalItems,
    totalPages,
    currentPage: page,
    loading,
    error,
    refresh,
  };
}
