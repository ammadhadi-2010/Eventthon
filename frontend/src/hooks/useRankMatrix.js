import { useEffect, useState } from 'react';
import { ensureRankMatrixLoaded, getCachedRankMatrix } from '../services/rankMatrixCache';

export default function useRankMatrix() {
  const [rows, setRows] = useState(getCachedRankMatrix());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    ensureRankMatrixLoaded()
      .then((data) => {
        if (active) setRows(data);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  return { rows, loading };
}
