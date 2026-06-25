import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { GLOBAL_SERVICE_CATEGORY_OPTIONS } from '../../../../data/globalCategories';
import {
  appliedFiltersFromRailDraft,
  buildCategoryGigsQueryParams,
  createEmptyAppliedFilters,
  createEmptyRailDraft,
  fetchCategoryBrowseFacets,
  fetchCategoryGigsList,
} from '../gigsCategoryProvidersFilterUtils';
import { gigsCategoryIcons, GigsCategoryIconFallback } from '../utils/gigsBrowseCategoryIcons';
import { loadBrowseFilters } from '../utils/gigsBrowseSession';

export const GIGS_CATBP_SORT_OPTIONS = ['Best Match', 'Newest First', 'Top Rated Seller', 'Fastest Delivery'];

export function useGigsCategoryProviders() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const category = String(searchParams.get('category') || '').trim();

  const categoryMeta = useMemo(
    () => GLOBAL_SERVICE_CATEGORY_OPTIONS.find((o) => o.name === category) || null,
    [category],
  );

  const subFromUrl = String(searchParams.get('sub') || '').trim();

  const selectedSubcategory = useMemo(() => {
    const subs = categoryMeta?.subcategories || [];
    if (!subFromUrl) return '';
    const hit = subs.find((s) => s.toLowerCase() === subFromUrl.toLowerCase());
    return hit || '';
  }, [categoryMeta, subFromUrl]);

  useEffect(() => {
    if (!category || !categoryMeta || !subFromUrl) return;
    const subs = categoryMeta.subcategories || [];
    const valid = subs.some((s) => s.toLowerCase() === subFromUrl.toLowerCase());
    if (subFromUrl && !valid) {
      navigate(`/gigs/providers?category=${encodeURIComponent(category)}`, { replace: true });
    }
  }, [category, categoryMeta, navigate, subFromUrl]);

  const CategoryIcon = categoryMeta
    ? (gigsCategoryIcons[categoryMeta.iconKey] || GigsCategoryIconFallback)
    : GigsCategoryIconFallback;

  const [sortLabel, setSortLabel] = useState('Best Match');

  const [gigSource, setGigSource] = useState([]);
  const [gigTotalRemote, setGigTotalRemote] = useState(0);
  const [loadingGigs, setLoadingGigs] = useState(true);
  const [loadError, setLoadError] = useState('');

  const [facetData, setFacetData] = useState(null);
  const [loadingFacets, setLoadingFacets] = useState(false);

  const [railDraft, setRailDraft] = useState(createEmptyRailDraft);
  const [appliedFilters, setAppliedFilters] = useState(createEmptyAppliedFilters);

  useEffect(() => {
    let cancelled = false;
    if (!category) {
      setGigSource([]);
      setGigTotalRemote(0);
      setLoadingGigs(false);
      setLoadError('Missing category — use /gigs/providers?category=…');
      return () => {
        cancelled = true;
      };
    }

    setLoadingGigs(true);
    setLoadError('');

    (async () => {
      try {
        const query = buildCategoryGigsQueryParams({
          category,
          sortLabel,
          selectedSubcategory,
          appliedFilters,
        });
        const { gigs, total } = await fetchCategoryGigsList(query);
        if (cancelled) return;
        setGigSource(gigs);
        setGigTotalRemote(total);
      } catch {
        if (!cancelled) {
          setGigSource([]);
          setGigTotalRemote(0);
          setLoadError('Could not load gigs — check network or backend.');
        }
      } finally {
        if (!cancelled) setLoadingGigs(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [category, sortLabel, selectedSubcategory, appliedFilters]);

  useEffect(() => {
    setRailDraft(createEmptyRailDraft());
    setAppliedFilters(createEmptyAppliedFilters());
  }, [category]);

  useEffect(() => {
    if (!category) {
      setFacetData(null);
      return undefined;
    }
    let cancelled = false;
    const subs = categoryMeta?.subcategories || [];
    setLoadingFacets(true);
    (async () => {
      try {
        const data = await fetchCategoryBrowseFacets(category, subs);
        if (!cancelled) setFacetData(data);
      } catch {
        if (!cancelled) setFacetData(null);
      } finally {
        if (!cancelled) setLoadingFacets(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [category, categoryMeta]);

  const onSelectSubcategory = useCallback(
    (sub) => {
      const p = new URLSearchParams();
      p.set('category', category);
      if (sub) p.set('sub', sub);
      navigate(`/gigs/providers?${p.toString()}`, { replace: true });
    },
    [category, navigate],
  );

  const subCountRows = facetData?.subcategories ?? [];
  const sellerRows = facetData?.seller_levels ?? [];
  const deliveryRows = facetData?.delivery_buckets ?? [];

  const overviewStats = useMemo(
    () => ({
      total: facetData?.total ?? 0,
      avgRating: facetData?.avg_rating ?? null,
    }),
    [facetData],
  );

  const facetCategoryTotal = facetData?.total ?? 0;

  const pickCategory = useCallback(
    (name) => {
      navigate(`/gigs/providers?category=${encodeURIComponent(name)}`);
    },
    [navigate],
  );

  const browseCategoryExplorer = useCallback(() => {
    navigate('/gigs/explorer', {
      state: {
        gigFilters: { ...loadBrowseFilters(), category, seller_user_id: '' },
        browseIntent: 'market',
      },
    });
  }, [navigate, category]);

  const openGigDetail = useCallback(
    (gigId) => {
      navigate(`/gigs/explorer?gig=${encodeURIComponent(gigId)}`, {
        state: {
          gigFilters: { ...loadBrowseFilters(), category, seller_user_id: '' },
        },
      });
    },
    [navigate, category],
  );

  const shareCategory = useCallback(async () => {
    const url = `${window.location.origin}/gigs/providers?category=${encodeURIComponent(category)}`;
    try {
      await navigator.clipboard.writeText(url);
    } catch {
      window.prompt('Copy link:', url);
    }
  }, [category]);

  const applyRailFilters = useCallback(() => {
    setAppliedFilters(appliedFiltersFromRailDraft(railDraft));
  }, [railDraft]);

  const clearAllFilters = useCallback(() => {
    setRailDraft(createEmptyRailDraft());
    setAppliedFilters(createEmptyAppliedFilters());
    onSelectSubcategory('');
  }, [onSelectSubcategory]);

  const shownFrom = gigSource.length ? 1 : 0;
  const shownTo = gigSource.length;

  return {
    navigate,
    category,
    categoryMeta,
    CategoryIcon,
    sortLabel,
    setSortLabel,
    gigSource,
    gigTotalRemote,
    loadingGigs,
    loadError,
    loadingFacets,
    railDraft,
    setRailDraft,
    selectedSubcategory,
    onSelectSubcategory,
    subCountRows,
    sellerRows,
    deliveryRows,
    overviewStats,
    facetCategoryTotal,
    pickCategory,
    browseCategoryExplorer,
    openGigDetail,
    shareCategory,
    applyRailFilters,
    clearAllFilters,
    shownFrom,
    shownTo,
  };
}
