import { useEffect, useState } from 'react';
import { fetchFooterResourcesByCategory } from '../api/publicFooterResourceApi';
import { mapAboutPage } from '../utils/companyFooterMappers';

export default function useAboutFeedContent() {
  const [data, setData] = useState(null);

  useEffect(() => {
    let cancelled = false;

    fetchFooterResourcesByCategory('About Us')
      .then((rows) => {
        if (!cancelled) setData(mapAboutPage(rows));
      })
      .catch(() => {
        if (!cancelled) setData(mapAboutPage([]));
      });

    return () => {
      cancelled = true;
    };
  }, []);

  return data;
}
