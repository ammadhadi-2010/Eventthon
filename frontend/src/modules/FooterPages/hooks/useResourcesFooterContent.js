import { useEffect, useState } from 'react';
import { fetchFooterResourcesByCategory } from '../api/publicFooterResourceApi';
import {
  mapBlogPage,
  mapCaseStudiesPage,
  mapCommunityPage,
  mapDocumentationPage,
  mapGuidesPage,
  mapHelpCenterPage,
  mapTutorialsPage,
} from '../utils/resourcesFooterMappers';

const MAPPERS = {
  Documentation: mapDocumentationPage,
  Guides: mapGuidesPage,
  Tutorials: mapTutorialsPage,
  Blog: mapBlogPage,
  'Case Studies': mapCaseStudiesPage,
  'Help Center': mapHelpCenterPage,
  Community: mapCommunityPage,
};

export default function useResourcesFooterContent(category) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;
    const mapper = MAPPERS[category];

    async function load() {
      setLoading(true);
      setError('');
      try {
        const rows = await fetchFooterResourcesByCategory(category);
        if (cancelled) return;
        setData(mapper ? mapper(rows) : { rows, fromCms: rows.length > 0 });
      } catch (err) {
        if (!cancelled) {
          setError(err?.message || 'Could not load page content.');
          setData(mapper ? mapper([]) : null);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    if (mapper) load();
    return () => {
      cancelled = true;
    };
  }, [category]);

  return { data, loading, error };
}
