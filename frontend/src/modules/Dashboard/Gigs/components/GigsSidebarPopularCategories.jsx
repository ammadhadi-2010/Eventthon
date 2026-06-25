import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { GLOBAL_SERVICE_CATEGORY_OPTIONS } from '../../../../data/globalCategories';
import { gigsCategoryIcons, GigsCategoryIconFallback } from '../utils/gigsBrowseCategoryIcons';
import { fetchGigsList } from '../services/gigsApi';

/** Compact category list for the left hub rail (below Create Gig). */
const GigsSidebarPopularCategories = () => {
  const navigate = useNavigate();
  const popular = useMemo(() => GLOBAL_SERVICE_CATEGORY_OPTIONS.slice(0, 6), []);
  const [totals, setTotals] = useState({});

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const entries = await Promise.all(
        popular.map(async (cat) => {
          try {
            const { total } = await fetchGigsList({
              status: 'Published',
              category: cat.name,
              limit: 1,
            });
            return [cat.name, total];
          } catch {
            return [cat.name, 0];
          }
        }),
      );
      if (!cancelled) setTotals(Object.fromEntries(entries));
    })();
    return () => {
      cancelled = true;
    };
  }, [popular]);

  return (
    <div className="gigs-sidebar-cats">
      <div className="gigs-sidebar-cats__head">
        <span>Popular Categories</span>
        <button type="button" onClick={() => navigate('/gigs/categories')}>
          View all
        </button>
      </div>
      <div className="gigs-sidebar-cats__list">
        {popular.map((item) => {
          const Icon = gigsCategoryIcons[item.iconKey] || GigsCategoryIconFallback;
          const count = totals[item.name];
          return (
            <button
              key={item.name}
              type="button"
              className="gigs-sidebar-cats__item"
              onClick={() => navigate(`/gigs/providers?category=${encodeURIComponent(item.name)}`)}
            >
              <span className={`gigs-sidebar-cats__icon gigs-popular-${item.tone}`}>
                <Icon size={14} aria-hidden />
              </span>
              <span className="gigs-sidebar-cats__copy">
                <strong>{item.name}</strong>
                <small>{typeof count === 'number' ? `${count} gigs` : '…'}</small>
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default GigsSidebarPopularCategories;
