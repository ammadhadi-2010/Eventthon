import { useEffect, useState } from 'react';
import API from '../../../../api/axiosConfig';
import { ORDERS_SIDE_FALLBACK } from '../data/gigsHubRightPanels';

function mapStatsToMetrics(stats) {
  if (!stats) return ORDERS_SIDE_FALLBACK;
  const pending = Number(stats.pending_orders ?? 0);
  const completed = Number(stats.completed_orders ?? 0);
  const total = Number(stats.total_orders ?? pending + completed);
  const inProgress = Number(stats.in_progress_orders ?? 0);
  const disputes = Number(stats.disputed_orders ?? stats.open_disputes ?? 0);
  return [
    { label: 'Total Orders', value: String(total), hint: 'All time' },
    { label: 'In Progress', value: String(inProgress || pending), hint: 'Active fulfillment (incl. beta)' },
    { label: 'Completed', value: String(completed), hint: 'Successfully closed' },
    {
      label: 'Dispute Watch',
      value: String(disputes),
      hint: disputes > 0 ? 'Review recommended' : 'All clear',
    },
  ];
}

export default function useGigsHubOrdersSideMetrics() {
  const [metrics, setMetrics] = useState(ORDERS_SIDE_FALLBACK);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const userId = (localStorage.getItem('userId') || '').trim();
    if (!userId) {
      setMetrics(ORDERS_SIDE_FALLBACK);
      return undefined;
    }
    let cancelled = false;
    setLoading(true);
    (async () => {
      try {
        const res = await API.get('/api/gigs/orders/stats', { params: { seller_user_id: userId } });
        if (!cancelled) setMetrics(mapStatsToMetrics(res?.data?.stats));
      } catch {
        if (!cancelled) setMetrics(ORDERS_SIDE_FALLBACK);
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
