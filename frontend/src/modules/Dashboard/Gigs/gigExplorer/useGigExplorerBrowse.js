import { useCallback, useEffect, useMemo, useState } from 'react';
import { useLocation } from 'react-router-dom';
import API from '../../../../api/axiosConfig';
import { fetchGigsList } from '../services/gigsApi';
import { getGigsSessionHeaders } from '../utils/gigsSession';
import { mergeBrowseFromLocation, hasBrowseFiltersApplied } from '../utils/gigsBrowseMerge';
import { buildGigsListAxiosParams } from '../utils/gigsBrowseParams';
import { unwrapGigArrays, normalizeGig, staticSeed } from './model';

/** Refetch gigs only when route “meaning” changes — not when only ?gig= selection changes (avoids refetch churn). */
export default function useGigExplorerBrowse(gigSlugFromUrl, setSearchParams) {
  const location = useLocation();
  const [loading, setLoading] = useState(true);
  const [rows, setRows] = useState([]);
  const [selectedId, setSelectedId] = useState('');
  const [listSearchDraft, setListSearchDraft] = useState('');

  const locationStateSig = useMemo(
    () => JSON.stringify(location.state ?? null),
    [location.state],
  );
  /** Do not tie list reload to location.key — updating ?gig= would bump key/refetch forever. Path + routed state only. */
  const browseReloadKey = `${location.pathname}|${locationStateSig}`;

  useEffect(() => {
    const m = mergeBrowseFromLocation(location);
    setListSearchDraft(String(m.search || '').trim());
  }, [browseReloadKey]); // eslint-disable-line react-hooks/exhaustive-deps -- draft sync follows browseReloadKey when filters/state change

  const selectGigRow = useCallback(
    (id) => {
      if (!id) return;
      setSelectedId(id);
      setSearchParams(
        (prev) => {
          const next = new URLSearchParams(prev);
          next.set('gig', id);
          return next;
        },
        { replace: true },
      );
    },
    [setSearchParams],
  );

  const runExplorerSearch = useCallback(async () => {
    const merged = mergeBrowseFromLocation(location);
    const queryMerged = { ...merged, search: listSearchDraft.trim() };
    setLoading(true);
    try {
      const params = {
        ...buildGigsListAxiosParams(queryMerged, { marketplacePublished: true }),
        limit: 100,
      };
      const { gigs: list } = await fetchGigsList(params);
      const normalized = list.map(normalizeGig);
      const usable = normalized.length ? normalized : staticSeed();
      setRows(usable);
      const firstId = usable[0]?.id || '';
      setSelectedId(firstId);
      setSearchParams(
        (prev) => {
          const next = new URLSearchParams(prev);
          if (firstId) next.set('gig', firstId);
          else next.delete('gig');
          return next;
        },
        { replace: true },
      );
    } catch {
      const fb = staticSeed();
      setRows(fb);
      const fid = fb[0]?.id || '';
      setSelectedId(fid);
      setSearchParams(
        (prev) => {
          const next = new URLSearchParams(prev);
          if (fid) next.set('gig', fid);
          else next.delete('gig');
          return next;
        },
        { replace: true },
      );
    } finally {
      setLoading(false);
    }
  }, [listSearchDraft, setSearchParams, location]);

  useEffect(() => {
    const mergedBase = mergeBrowseFromLocation(location);
    const preselectTitle = location.state?.preselectTitle;
    const wantsMarketListing =
      location.state?.browseIntent === 'market' || hasBrowseFiltersApplied(mergedBase);

    let cancelled = false;

    const load = async () => {
      setLoading(true);
      try {
        let rawList = [];

        if (wantsMarketListing) {
          const params = {
            ...buildGigsListAxiosParams(mergedBase, { marketplacePublished: true }),
            limit: 100,
          };
          const { gigs: list } = await fetchGigsList(params);
          rawList = list;
        } else {
          const userId = typeof window !== 'undefined' ? (localStorage.getItem('userId') || '').trim() : '';
          const [allRes, myRes] = await Promise.allSettled([
            fetchGigsList({ limit: 100 }),
            userId
              ? API.get(`/api/gigs/my/${encodeURIComponent(userId)}`, {
                  headers: getGigsSessionHeaders(),
                })
              : Promise.resolve({ data: { gigs: [] } }),
          ]);

          const allRows = allRes.status === 'fulfilled' ? allRes.value.gigs || [] : [];
          const myRows = myRes.status === 'fulfilled' ? unwrapGigArrays(myRes.value) : [];

          const mergedRaw = [...myRows, ...allRows];
          const dedup = new Map();
          mergedRaw.forEach((item) => {
            const id = item?._id || item?.id;
            if (id && !dedup.has(id)) dedup.set(id, item);
          });
          rawList = [...dedup.values()];
        }

        let mergedRows = rawList.map(normalizeGig);

        /** Deep link to one Mongo gig when filtered list is empty (still show that gig’s detail). */
        const slug = String(gigSlugFromUrl || '').trim();
        if (mergedRows.length === 0 && /^[a-f\d]{24}$/i.test(slug)) {
          try {
            const one = await API.get(`/api/gigs/${slug}`);
            const doc = one?.data?.gig;
            if (doc) mergedRows = [normalizeGig(doc)];
          } catch {
            mergedRows = [];
          }
        }

        /** Demo Featured/Recent rows — non‑market hybrid list, and universal fallback when API returns 0 (filters / empty DB). */
        if (!wantsMarketListing && mergedRows.length > 0) {
          const seeds = staticSeed();
          const seen = new Set(mergedRows.map((r) => r.id));
          seeds.forEach((s) => {
            if (!seen.has(s.id)) {
              seen.add(s.id);
              mergedRows.push(s);
            }
          });
        }

        const finalRows = mergedRows.length > 0 ? mergedRows : staticSeed();

        if (cancelled) return;
        setRows(finalRows);

        const preselected = preselectTitle
          ? finalRows.find((gig) => gig.title.toLowerCase() === String(preselectTitle).toLowerCase())
          : null;
        const slugMatch = gigSlugFromUrl ? finalRows.find((gig) => gig.id === gigSlugFromUrl) : null;
        const chosenId = slugMatch?.id || preselected?.id || finalRows[0]?.id || '';
        setSelectedId(chosenId);
        // Never call setSearchParams here — it can change router location key/ref and retrigger this load in a tight loop.
      } catch {
        if (cancelled) return;
        const fallback = staticSeed();
        setRows(fallback);
        const preselectedCatch = preselectTitle
          ? fallback.find((gig) => gig.title.toLowerCase() === String(preselectTitle).toLowerCase())
          : null;
        const slugMatch = gigSlugFromUrl ? fallback.find((gig) => gig.id === gigSlugFromUrl) : null;
        const chosenCatch = slugMatch?.id || preselectedCatch?.id || fallback[0]?.id || '';
        setSelectedId(chosenCatch);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    // Omit gigSlugFromUrl from effect deps: ?gig= tracks selection only; including it would refetch the whole list on each gig click.
    load();
    return () => {
      cancelled = true;
    };
  }, [browseReloadKey]); // eslint-disable-line react-hooks/exhaustive-deps -- browseReloadKey = navigation + state; slug sync in next effect

  useEffect(() => {
    if (!gigSlugFromUrl || rows.length === 0) return;
    const exists = rows.some((g) => g.id === gigSlugFromUrl);
    if (exists) {
      setSelectedId((prev) => (prev === gigSlugFromUrl ? prev : gigSlugFromUrl));
    }
  }, [gigSlugFromUrl, rows]);

  return {
    loading,
    rows,
    selectedId,
    listSearchDraft,
    setListSearchDraft,
    selectGigRow,
    runExplorerSearch,
    setSelectedId,
  };
}
