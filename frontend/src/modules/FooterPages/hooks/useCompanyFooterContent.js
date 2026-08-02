import { useEffect, useState } from 'react';
import { fetchFooterResourcesByCategory } from '../api/publicFooterResourceApi';
import {
  mapAboutPage,
  mapCareersPage,
  mapContactPage,
  mapLegalPage,
  mapPricingPage,
} from '../utils/companyFooterMappers';

const MAPPERS = {
  'About Us': mapAboutPage,
  Pricing: mapPricingPage,
  Careers: mapCareersPage,
  'Contact Us': mapContactPage,
};

const EMPTY_LEGAL_FALLBACK = [];

export default function useCompanyFooterContent(category, legalFallback = EMPTY_LEGAL_FALLBACK) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setError('');
      try {
        const rows = await fetchFooterResourcesByCategory(category);
        if (cancelled) return;

        let mapped;
        if (category === 'Privacy Policy' || category === 'Terms of Service') {
          mapped = mapLegalPage(rows, legalFallback);
        } else {
          const mapper = MAPPERS[category];
          mapped = mapper ? mapper(rows) : { rows, fromCms: rows.length > 0 };
        }
        setData(mapped);
      } catch (err) {
        if (!cancelled) {
          setError(err?.message || 'Could not load page content.');
          if (category === 'Privacy Policy' || category === 'Terms of Service') {
            setData(mapLegalPage([], legalFallback));
          } else {
            const mapper = MAPPERS[category];
            setData(mapper ? mapper([]) : null);
          }
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [category, legalFallback]);

  return { data, loading, error };
}
