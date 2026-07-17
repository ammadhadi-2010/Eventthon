import { useEffect, useState } from 'react';
import { fetchOutreachActivity } from '../../services/emailOutreachApi';
import { mapActivityRow } from './outreachActivityMapper';
import { OUTREACH_ACTIVITY_ITEMS } from './outreachActivityData';

const FALLBACK = OUTREACH_ACTIVITY_ITEMS;

export default function useOutreachActivity(refreshKey = 0) {
  const [rows, setRows] = useState(FALLBACK);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;
    setLoading(true);
    fetchOutreachActivity()
      .then((data) => {
        if (!alive) return;
        const list = (data?.rows || []).map(mapActivityRow);
        setRows(list.length ? list : FALLBACK);
      })
      .catch(() => {
        if (alive) setRows(FALLBACK);
      })
      .finally(() => {
        if (alive) setLoading(false);
      });
    return () => {
      alive = false;
    };
  }, [refreshKey]);

  return { rows, loading };
}
