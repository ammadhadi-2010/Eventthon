import { useEffect, useState } from 'react';
import { fetchFooterResourcesByCategory } from '../api/publicFooterResourceApi';
import { mapFooterBrandPage } from '../utils/footerBrandCmsUtils';

export default function useFooterBrand() {
  const [data, setData] = useState(() => mapFooterBrandPage([]));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const rows = await fetchFooterResourcesByCategory('Footer Brand');
        if (!cancelled) setData(mapFooterBrandPage(rows));
      } catch {
        if (!cancelled) setData(mapFooterBrandPage([]));
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  return { data, loading };
}
