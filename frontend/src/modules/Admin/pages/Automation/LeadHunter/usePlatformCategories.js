import { useEffect, useState } from 'react';
import { GLOBAL_SERVICE_CATEGORIES } from '../../../../../data/globalCategories';
import { fetchLeadHunterCategories } from './leadHunterApi';

export default function usePlatformCategories() {
  const [categories, setCategories] = useState(GLOBAL_SERVICE_CATEGORIES);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;
    fetchLeadHunterCategories()
      .then((rows) => {
        if (alive && rows.length) setCategories(rows);
      })
      .catch(() => {
        if (alive) setCategories(GLOBAL_SERVICE_CATEGORIES);
      })
      .finally(() => {
        if (alive) setLoading(false);
      });
    return () => {
      alive = false;
    };
  }, []);

  return { categories, loading };
}
