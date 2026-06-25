import { useCallback, useRef, useState } from 'react';
import { searchGoogleLeads } from './leadHunterApi';

export default function useLeadHunterDiscovery(patchForm, setNotice, setError) {
  const [discoveredLinks, setDiscoveredLinks] = useState([]);
  const [searchBusy, setSearchBusy] = useState(false);
  const [websiteHighlight, setWebsiteHighlight] = useState(false);
  const websiteInputRef = useRef(null);
  const highlightTimerRef = useRef(null);

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
        setNotice(res?.message || `Found ${rows.length} industry lead link(s).`);
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
    (row) => {
      const url = String(row?.website_url || '').trim();
      if (!url) return;
      patchForm('websiteUrl', url);
      setNotice(`Loaded ${row.business_name || 'target'} into Website Link — ready for Run Extract.`);

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
  };
}
