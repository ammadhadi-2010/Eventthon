import { useCallback, useState } from 'react';
import { fetchGigsList } from '../services/gigsApi';
import { normalizeGig } from '../gigExplorer/model';
import { buildGigsListAxiosParams } from '../utils/gigsBrowseParams';
import { loadBrowseFilters, saveBrowseFilters } from '../utils/gigsBrowseSession';

export function mapGigToHubRow(gig) {
  return {
    id: gig.id,
    title: gig.title,
    seller: gig.sellerName,
    sellerLevel: gig.sellerLevel || 'Seller',
    tags: (gig.tags || []).slice(0, 4),
    rating: gig.rating,
    reviews: gig.reviews,
    price: `$${Number(gig.price || 0).toLocaleString()}`,
    eta: gig.deliveryTime || `${gig.deliveryDays || 3} days`,
    logoText: (gig.sellerAvatarInitial || gig.title || 'G').charAt(0).toUpperCase(),
    logoClass: 'gigs-recent-logo--violet',
    isLive: /^[a-f\d]{24}$/i.test(String(gig.id)),
  };
}

export default function useGigsHubSearch() {
  const [searchTerm, setSearchTerm] = useState('');
  const [hasSearched, setHasSearched] = useState(false);
  const [searching, setSearching] = useState(false);
  const [rows, setRows] = useState([]);
  const [total, setTotal] = useState(0);

  const runHubSearch = useCallback(async (termOverride) => {
    const q = String(termOverride ?? searchTerm).trim();
    setSearching(true);
    setHasSearched(true);
    try {
      const merged = saveBrowseFilters({ ...loadBrowseFilters(), search: q }) || loadBrowseFilters();
      const params = buildGigsListAxiosParams(merged, { marketplacePublished: true });
      const { gigs, total: count } = await fetchGigsList({ ...params, limit: 12 });
      const normalized = gigs.map(normalizeGig).map(mapGigToHubRow);
      setRows(normalized);
      setTotal(count);
    } catch {
      setRows([]);
      setTotal(0);
    } finally {
      setSearching(false);
    }
  }, [searchTerm]);

  const refreshWithFilters = useCallback(() => {
    if (hasSearched) runHubSearch();
  }, [hasSearched, runHubSearch]);

  return {
    searchTerm,
    setSearchTerm,
    hasSearched,
    searching,
    rows,
    total,
    runHubSearch,
    refreshWithFilters,
  };
}
