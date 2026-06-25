import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../../../../api/axiosConfig';
import { GLOBAL_SERVICE_CATEGORY_OPTIONS } from '../../../../data/globalCategories';
import { gigsCategoryIcons, GigsCategoryIconFallback } from '../utils/gigsBrowseCategoryIcons';

/** Popular Categories — enlarged tiles + live Published gig totals from `/api/gigs`. */
const GigsBrowsePopularCategoriesSection = () => {
  const navigate = useNavigate();
  const popular = useMemo(() => GLOBAL_SERVICE_CATEGORY_OPTIONS.slice(0, 8), []);
  const [gigTotals, setGigTotals] = useState({});
  const [countsLoading, setCountsLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setCountsLoading(true);
    (async () => {
      const entries = await Promise.all(
        popular.map(async (cat) => {
          try {
            const res = await API.get('/api/gigs', {
              params: { status: 'Published', category: cat.name, limit: 1, skip: 0 },
            });
            const total = Number(res?.data?.total);
            return [cat.name, Number.isFinite(total) ? total : 0];
          } catch {
            return [cat.name, 0];
          }
        }),
      );
      if (!cancelled) {
        setGigTotals(Object.fromEntries(entries));
        setCountsLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [popular]);

  const openCategoryProviders = (name) => {
    navigate(`/gigs/providers?category=${encodeURIComponent(name.trim())}`);
  };

  return (
    <div className="gigs-card gigs-jobs-board gigs-popular-cats-wrap">
      <div className="gigs-section-head">
        <h3>Popular Categories</h3>
        <button type="button" onClick={() => navigate('/gigs/categories')}>View All</button>
      </div>
      <div className="gigs-popular-grid gigs-popular-grid--enhanced">
        {popular.map((item) => {
          const Icon = gigsCategoryIcons[item.iconKey] || GigsCategoryIconFallback;
          const n = gigTotals[item.name];
          const countLabel = countsLoading ? '…' : `${typeof n === 'number' ? n : 0} gigs`;

          return (
            <div
              key={item.name}
              className="gigs-popular-card gigs-popular-card--prominent"
              role="button"
              tabIndex={0}
              onClick={() => openCategoryProviders(item.name)}
              onKeyDown={(event) => {
                if (event.key === 'Enter' || event.key === ' ') openCategoryProviders(item.name);
              }}
            >
              <div className="gigs-popular-promo-row">
                <div
                  className={`gigs-popular-icon gigs-popular-icon--lg gigs-popular-${item.tone}`}
                  style={{
                    '--icon-gradient': item.iconUi?.gradient,
                    '--icon-glow': item.iconUi?.glow,
                  }}
                >
                  <Icon size={22} aria-hidden />
                </div>
                <div className="gigs-popular-promo-copy">
                  <h4>{item.name}</h4>
                  <p className="gigs-popular-gig-count">{countLabel}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default GigsBrowsePopularCategoriesSection;
