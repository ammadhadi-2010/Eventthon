import React, { useCallback } from 'react';
import { FiChevronDown } from 'react-icons/fi';
import {
  PRICE_SLIDER_MAX,
  resolvePriceFromDraft,
} from './gigsCategoryProvidersFilterUtils';

const SLIDER_GAP = 12;

const SELLER_FILTER_OPTS = [
  { id: 'top', label: 'Top Rated Seller' },
  { id: 'lvl2', label: 'Level 2 Seller' },
  { id: 'lvl1', label: 'Level 1 Seller' },
  { id: 'new', label: 'New Seller' },
];

const DELIVERY_FILTER_OPTS = [
  { id: '24h', label: 'Up to 24 hours' },
  { id: '3d', label: '2 – 3 days' },
  { id: '7d', label: '4 – 7 days' },
  { id: 'week_plus', label: 'More than a week' },
];

/**
 * Providers page right column: category overview + filter accordion (subs from globalCategories).
 */
const GigsCategoryProvidersRightRail = ({
  category,
  categoryMeta,
  CategoryIcon,
  overviewStats,
  overviewDescription,
  gigTotalRemote,
  facetsLoading = false,
  selectedSubcategory,
  onSelectSubcategory,
  subCountRows,
  sellerRows,
  deliveryRows,
  railDraft,
  setRailDraft,
  onApplyFilters,
  onClearAll,
}) => {
  const toggleBucket = useCallback((id, key) => {
    setRailDraft((d) => {
      const cur = Array.isArray(d[key]) ? d[key] : [];
      const next = cur.includes(id) ? cur.filter((x) => x !== id) : [...cur, id];
      return { ...d, [key]: next };
    });
  }, [setRailDraft]);

  const onSliderMin = useCallback(
    (v) => {
      setRailDraft((d) => {
        const nv = Number(v.target.value);
        return {
          ...d,
          priceSliderMin: Math.min(nv, d.priceSliderMax - SLIDER_GAP),
        };
      });
    },
    [setRailDraft],
  );

  const onSliderMax = useCallback(
    (v) => {
      setRailDraft((d) => {
        const nv = Number(v.target.value);
        return {
          ...d,
          priceSliderMax: Math.max(nv, d.priceSliderMin + SLIDER_GAP),
        };
      });
    },
    [setRailDraft],
  );

  const countFmt = (n) => (facetsLoading ? '…' : n);

  const previewBounds = resolvePriceFromDraft(railDraft);
  const loLabel =
    previewBounds.min != null && Number.isFinite(previewBounds.min) ? `$${previewBounds.min}` : '$0';
  const hiLabel =
    previewBounds.max != null && Number.isFinite(previewBounds.max) ? `$${previewBounds.max}` : '$1000+';

  const subcategories = Array.isArray(categoryMeta?.subcategories) ? categoryMeta.subcategories : [];

  return (
    <aside className="gigs-catbp-right">
      <section className="gigs-card gigs-catbp-rail-block gigs-catbp-rail-overview">
        <h2 className="gigs-catbp-rail-section-title">Category Overview</h2>
        <div className="gigs-catbp-rail-overview-top">
          <div
            className="gigs-catbp-rail-icon gigs-popular-icon gigs-catbp-rail-icon--round"
            style={
              categoryMeta?.iconUi
                ? { '--icon-gradient': categoryMeta.iconUi.gradient, '--icon-glow': categoryMeta.iconUi.glow }
                : {}
            }
          >
            <CategoryIcon size={20} aria-hidden />
          </div>
          <div className="gigs-catbp-rail-overview-copy">
            <p className="gigs-catbp-rail-cat-inline">{category}</p>
            <p className="gigs-catbp-rail-desc">{overviewDescription}</p>
          </div>
        </div>
        <dl className="gigs-catbp-rail-stats">
          <div>
            <dt>Total gigs</dt>
            <dd>{facetsLoading ? '…' : overviewStats.total}</dd>
          </div>
          <div>
            <dt>Avg. rating</dt>
            <dd>
              {facetsLoading ? '…' : overviewStats.avgRating != null ? overviewStats.avgRating : '—'}
            </dd>
          </div>
        </dl>
      </section>

      <section className="gigs-card gigs-catbp-rail-block gigs-catbp-filters-card">
        <div className="gigs-catbp-filter-head">
          <h3 className="gigs-catbp-filter-title">Filter gigs</h3>
          <button type="button" className="gigs-catbp-filter-clear" onClick={onClearAll}>
            Clear all
          </button>
        </div>

        {subcategories.length > 0 ? (
          <details className="gigs-catbp-rail-details" open>
            <summary className="gigs-catbp-rail-acc-summary">
              Service options <FiChevronDown className="gigs-catbp-rail-acc-chev" aria-hidden />
            </summary>
            <div className="gigs-catbp-rail-acc-body">
              <label className="gigs-catbp-check gigs-catbp-check--spread">
                <span className="gigs-catbp-check-main">
                  <input
                    type="checkbox"
                    checked={!selectedSubcategory}
                    onChange={() => onSelectSubcategory('')}
                  />
                  All services
                </span>
                <span className="gigs-catbp-muted gigs-catbp-count-pill">{countFmt(gigTotalRemote)}</span>
              </label>
              {subCountRows.map(({ label, count }) => (
                <label key={label} className="gigs-catbp-check gigs-catbp-check--spread">
                  <span className="gigs-catbp-check-main">
                    <input
                      type="checkbox"
                      checked={selectedSubcategory === label}
                      onChange={() =>
                        selectedSubcategory === label ? onSelectSubcategory('') : onSelectSubcategory(label)
                      }
                    />
                    {label}
                  </span>
                  <span className="gigs-catbp-muted gigs-catbp-count-pill">{countFmt(count)}</span>
                </label>
              ))}
            </div>
          </details>
        ) : null}

        <details className="gigs-catbp-rail-details" open>
          <summary className="gigs-catbp-rail-acc-summary">
            Seller level <FiChevronDown className="gigs-catbp-rail-acc-chev" aria-hidden />
          </summary>
          <div className="gigs-catbp-rail-acc-body">
            {SELLER_FILTER_OPTS.map(({ id, label }) => {
              const row = sellerRows.find((r) => r.id === id);
              const cnt = row?.count ?? 0;
              return (
                <label key={id} className="gigs-catbp-check gigs-catbp-check--spread">
                  <span className="gigs-catbp-check-main">
                    <input
                      type="checkbox"
                      checked={railDraft.sellerLevels.includes(id)}
                      onChange={() => toggleBucket(id, 'sellerLevels')}
                    />
                    {label}
                  </span>
                  <span className="gigs-catbp-muted gigs-catbp-count-pill">{countFmt(cnt)}</span>
                </label>
              );
            })}
          </div>
        </details>

        <details className="gigs-catbp-rail-details" open>
          <summary className="gigs-catbp-rail-acc-summary">
            Price range <FiChevronDown className="gigs-catbp-rail-acc-chev" aria-hidden />
          </summary>
          <div className="gigs-catbp-rail-acc-body">
            <div className="gigs-catbp-dual-range">
              <div className="gigs-catbp-dual-range-track" aria-hidden />
              <input
                className="gigs-catbp-dual-range-input gigs-catbp-dual-range-input--lower"
                type="range"
                min={0}
                max={PRICE_SLIDER_MAX}
                step={10}
                value={railDraft.priceSliderMin}
                onChange={onSliderMin}
                aria-label="Minimum price slider"
              />
              <input
                className="gigs-catbp-dual-range-input gigs-catbp-dual-range-input--upper"
                type="range"
                min={0}
                max={PRICE_SLIDER_MAX}
                step={10}
                value={railDraft.priceSliderMax}
                onChange={onSliderMax}
                aria-label="Maximum price slider"
              />
            </div>
            <div className="gigs-catbp-dual-range-labels">
              <span>{loLabel}</span>
              <span>{hiLabel}</span>
            </div>
            <div className="gigs-catbp-price-range">
              <input
                type="number"
                min={0}
                placeholder="$ Min"
                value={railDraft.priceInputMin}
                onChange={(e) => setRailDraft((d) => ({ ...d, priceInputMin: e.target.value }))}
              />
              <span>—</span>
              <input
                type="number"
                min={0}
                placeholder="$ Max"
                value={railDraft.priceInputMax}
                onChange={(e) => setRailDraft((d) => ({ ...d, priceInputMax: e.target.value }))}
              />
            </div>
          </div>
        </details>

        <details className="gigs-catbp-rail-details" open>
          <summary className="gigs-catbp-rail-acc-summary">
            Delivery time <FiChevronDown className="gigs-catbp-rail-acc-chev" aria-hidden />
          </summary>
          <div className="gigs-catbp-rail-acc-body">
            {DELIVERY_FILTER_OPTS.map(({ id, label }) => {
              const row = deliveryRows.find((r) => r.id === id);
              const cnt = row?.count ?? 0;
              return (
                <label key={id} className="gigs-catbp-check gigs-catbp-check--spread">
                  <span className="gigs-catbp-check-main">
                    <input
                      type="checkbox"
                      checked={railDraft.deliveryBuckets.includes(id)}
                      onChange={() => toggleBucket(id, 'deliveryBuckets')}
                    />
                    {label}
                  </span>
                  <span className="gigs-catbp-muted gigs-catbp-count-pill">{countFmt(cnt)}</span>
                </label>
              );
            })}
          </div>
        </details>

        <button type="button" className="gigs-prov-btn gigs-prov-btn--primary gigs-catbp-apply" onClick={onApplyFilters}>
          Apply filters
        </button>
      </section>
    </aside>
  );
};

export default GigsCategoryProvidersRightRail;
