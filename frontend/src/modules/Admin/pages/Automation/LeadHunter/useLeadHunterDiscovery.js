import { useCallback, useRef, useState } from 'react';
import { searchGoogleLeads } from './leadHunterApi';

function mergeDiscoveryRows(existing, incoming) {
  const map = new Map(existing.map((row) => [String(row.website_url || row.domain || row.id), row]));
  incoming.forEach((row) => {
    const key = String(row.website_url || row.domain || row.id);
    map.set(key, { ...map.get(key), ...row });
  });
  return Array.from(map.values());
}

export default function useLeadHunterDiscovery(patchForm, setNotice, setError) {
  const [discoveredLinks, setDiscoveredLinks] = useState([]);
  const [searchBusy, setSearchBusy] = useState(false);
  const [websiteHighlight, setWebsiteHighlight] = useState(false);
  const websiteInputRef = useRef(null);
  const highlightTimerRef = useRef(null);

  const upsertDiscoveredRows = useCallback((rows) => {
    if (!Array.isArray(rows) || !rows.length) return;
    setDiscoveredLinks((prev) => mergeDiscoveryRows(prev, rows));
  }, []);

  const runGoogleSearch = useCallback(
    async (form) => {
      setSearchBusy(true);
      setError('');
      try {
        const res = await searchGoogleLeads({
          country: form.country.trim(),
          category: form.category.trim(),
          country_code: form.countryCode.trim(),
        });
        const rows = Array.isArray(res?.links) ? res.links : [];
        setDiscoveredLinks(rows);
        setNotice(res?.message || `Found ${rows.length} localized industry lead(s).`);
        return true;
      } catch (err) {
        setDiscoveredLinks([]);
        setError(err?.response?.data?.detail || err?.message || 'Google lead search failed');
        return false;
      } finally {
        setSearchBusy(false);
      }
    },
    [setError, setNotice],
  );

  const loadIntoHunter = useCallback(
    (row, onComposeLead) => {
      const url = String(row?.website_url || '').trim();
      if (!url) return;
      patchForm('websiteUrl', url);
      const label = row.business_name || row.company || 'target';
      setNotice(`Loaded ${label} into Website Link — ready for Run Extract.`);

      if (row.email && onComposeLead) {
        onComposeLead({
          id: row.id,
          company: row.business_name || row.company || label,
          email: row.email,
          website: url,
        });
      }

      if (highlightTimerRef.current) clearTimeout(highlightTimerRef.current);
      setWebsiteHighlight(true);
      highlightTimerRef.current = setTimeout(() => setWebsiteHighlight(false), 2200);

      const node = websiteInputRef.current || document.getElementById('lh-website');
      node?.scrollIntoView?.({ behavior: 'smooth', block: 'center' });
      node?.focus?.({ preventScroll: true });
    },
    [patchForm, setNotice],
  );

  return {
    discoveredLinks,
    searchBusy,
    websiteHighlight,
    websiteInputRef,
    runGoogleSearch,
    loadIntoHunter,
    upsertDiscoveredRows,
  };
}
