import { useCallback, useEffect, useMemo, useState } from 'react';
import { fetchGigEarningsSummary } from '../services/gigsApi';
import { getGigsActorId, hasGigsSession } from '../utils/gigsSession';

const PERIOD_KEYS = ['month', 'week'];

const EMPTY_METRICS = {
  earnings: 0,
  orders: 0,
  completed_orders: 0,
  in_progress_orders: 0,
  pending_orders: 0,
  lifetime_earnings: 0,
  avg_order_value: 0,
};

export default function useGigOverviewMetrics() {
  const [periodKey, setPeriodKey] = useState('month');
  const [metrics, setMetrics] = useState(EMPTY_METRICS);

  const load = useCallback(async () => {
    const sellerId = getGigsActorId();
    if (!hasGigsSession() || !sellerId) {
      setMetrics(EMPTY_METRICS);
      return;
    }
    try {
      const summary = await fetchGigEarningsSummary(sellerId, periodKey);
      if (summary) {
        setMetrics({
          earnings: Number(summary.earnings || 0),
          orders: Number(summary.orders || 0),
          completed_orders: Number(summary.completed_orders || 0),
          in_progress_orders: Number(summary.in_progress_orders || 0),
          pending_orders: Number(summary.pending_orders || 0),
          lifetime_earnings: Number(summary.lifetime_earnings || 0),
          avg_order_value: Number(summary.avg_order_value || 0),
        });
      }
    } catch {
      setMetrics(EMPTY_METRICS);
    }
  }, [periodKey]);

  useEffect(() => {
    load();
  }, [load]);

  const togglePeriod = useCallback(() => {
    setPeriodKey((prev) => {
      const idx = PERIOD_KEYS.indexOf(prev);
      return PERIOD_KEYS[(idx + 1) % PERIOD_KEYS.length];
    });
  }, []);

  const formattedEarnings = useMemo(
    () => `$${Number(metrics.earnings || 0).toLocaleString('en-US')}`,
    [metrics.earnings],
  );

  return { metrics, togglePeriod, formattedEarnings };
}
