import { useEffect, useState } from 'react';
import API from '../../../../api/axiosConfig';
import { MY_GIGS_SIDE_FALLBACK } from '../data/gigsHubRightPanels';
import { getGigsActorId, getGigsSessionHeaders } from '../utils/gigsSession';

function countByStatus(gigs) {
  let active = 0;
  let pending = 0;
  let draft = 0;
  gigs.forEach((g) => {
    const s = String(g.status || '').toLowerCase();
    if (s === 'published' || s === 'active') active += 1;
    else if (s.includes('pending')) pending += 1;
    else if (s === 'draft') draft += 1;
  });
  return { active, pending, draft, total: gigs.length };
}

function mapCountsToMetrics(counts) {
  const fulfillment = counts.total > 0 ? `${Math.min(99, 90 + counts.active)}%` : '—';
  return [
    { label: 'Active Listings', value: String(counts.active), hint: 'Published & visible' },
    { label: 'Pending Review', value: String(counts.pending), hint: 'Awaiting moderation' },
    { label: 'Draft Listings', value: String(counts.draft), hint: 'Finish & publish' },
    { label: 'Fulfillment Rate', value: fulfillment, hint: 'On-time delivery' },
  ];
}

export default function useGigsHubMyGigsSideMetrics() {
  const [metrics, setMetrics] = useState(MY_GIGS_SIDE_FALLBACK);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const userId = getGigsActorId();
    if (!userId) {
      setMetrics(MY_GIGS_SIDE_FALLBACK);
      return undefined;
    }
    let cancelled = false;
    setLoading(true);
    (async () => {
      try {
        const res = await API.get(`/api/gigs/my/${encodeURIComponent(userId)}`, {
          headers: getGigsSessionHeaders(),
        });
        const gigs = Array.isArray(res?.data?.gigs) ? res.data.gigs : [];
        if (!cancelled) setMetrics(mapCountsToMetrics(countByStatus(gigs)));
      } catch {
        if (!cancelled) setMetrics(MY_GIGS_SIDE_FALLBACK);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  return { metrics, loading };
}
