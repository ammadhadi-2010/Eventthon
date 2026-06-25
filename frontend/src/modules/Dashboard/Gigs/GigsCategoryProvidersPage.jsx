import React from 'react';
import { FiArrowLeft, FiHeart, FiStar } from 'react-icons/fi';
import { GLOBAL_SERVICE_CATEGORY_OPTIONS } from '../../../data/globalCategories';
import './styles/GigsDashboard.css';
import GigsCategoryProvidersCenter from './GigsCategoryProvidersCenter';
import GigsCategoryProvidersRightRail from './GigsCategoryProvidersRightRail';
import { GIGS_CATBP_SORT_OPTIONS, useGigsCategoryProviders } from './hooks/useGigsCategoryProviders';
import { gigsCategoryIcons, GigsCategoryIconFallback } from './utils/gigsBrowseCategoryIcons';

const THUMB_FALLBACK_ROTATE = ['seo', 'react', 'ai', 'content'];

const GigsCategoryProvidersPage = () => {
  const hub = useGigsCategoryProviders();

  if (!hub.category) {
    return (
      <div className="gigs-page gigs-catbp-page">
        <div className="gigs-catbp-inner gigs-card gigs-catbp-fallback-card">
          <button type="button" className="gigs-prov-back" onClick={() => hub.navigate('/gigs')}>
            <FiArrowLeft size={14} /> Back to gigs hub
          </button>
          <p className="gigs-prov-error">Pick a category or open /gigs/providers?category=…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="gigs-page gigs-catbp-page">
      <div className="gigs-catbp-inner">
        <button type="button" className="gigs-catbp-back-muted" onClick={() => hub.navigate('/gigs')}>
          <FiArrowLeft size={14} /> Dashboard / Gigs hub
        </button>

        <div className="gigs-catbp-shell">
          <aside className="gigs-catbp-left gigs-card">
            <h2 className="gigs-catbp-left-title">Browse categories</h2>
            <nav className="gigs-catbp-cat-nav" aria-label="Categories">
              {GLOBAL_SERVICE_CATEGORY_OPTIONS.map((opt) => {
                const Icon = gigsCategoryIcons[opt.iconKey] || GigsCategoryIconFallback;
                const active = opt.name === hub.category;
                return (
                  <button
                    key={opt.name}
                    type="button"
                    className={`gigs-catbp-cat-row${active ? ' is-active' : ''}`}
                    onClick={() => hub.pickCategory(opt.name)}
                  >
                    <span
                      className={`gigs-catbp-cat-icon gigs-popular-icon gigs-popular-${opt.tone}`}
                      style={{
                        '--icon-gradient': opt.iconUi?.gradient,
                        '--icon-glow': opt.iconUi?.glow,
                      }}
                    >
                      <Icon size={14} aria-hidden />
                    </span>
                    <span className="gigs-catbp-cat-label">{opt.name}</span>
                  </button>
                );
              })}
            </nav>
          </aside>

          <GigsCategoryProvidersCenter
            category={hub.category}
            categoryMeta={hub.categoryMeta}
            CategoryIcon={hub.CategoryIcon}
            gigTotalRemote={hub.gigTotalRemote}
            toolbarListCount={hub.gigTotalRemote}
            shownFrom={hub.shownFrom}
            shownTo={hub.shownTo}
            sortLabel={hub.sortLabel}
            onSortChange={hub.setSortLabel}
            sortOptions={GIGS_CATBP_SORT_OPTIONS}
            selectedSubcategory={hub.selectedSubcategory}
            onSelectSubcategory={hub.onSelectSubcategory}
            onShareCategory={hub.shareCategory}
          >
            {hub.loadError ? <p className="gigs-prov-error">{hub.loadError}</p> : null}
            {hub.loadingGigs ? (
              <ul className="gigs-catbp-gig-list" aria-busy="true">
                {[0, 1, 2, 3].map((i) => (
                  <li key={i} className="gigs-catbp-gig-card gigs-catbp-gig-card--skeleton" />
                ))}
              </ul>
            ) : null}

            {!hub.loadingGigs && !hub.gigSource.length ? (
              <div className="gigs-catbp-empty">
                <p>No gigs match this view — widen filters or open Explorer.</p>
                <button
                  type="button"
                  className="gigs-prov-btn gigs-prov-btn--primary"
                  onClick={hub.browseCategoryExplorer}
                >
                  Open Explorer
                </button>
              </div>
            ) : null}

            {!hub.loadingGigs && hub.gigSource.length > 0 ? (
              <ul className="gigs-catbp-gig-list">
                {hub.gigSource.map((gig, idx) => {
                  const thumbUrl = gig.images?.[0] || '';
                  const fb = THUMB_FALLBACK_ROTATE[idx % THUMB_FALLBACK_ROTATE.length];
                  const ratingLabel = gig.rating;
                  const numericRev = gig.reviews;
                  return (
                    <li key={gig.id}>
                      <article
                        className="gigs-catbp-gig-card"
                        role="button"
                        tabIndex={0}
                        onClick={() => hub.openGigDetail(gig.id)}
                        onKeyDown={(ev) => {
                          if (ev.key === 'Enter' || ev.key === ' ') hub.openGigDetail(gig.id);
                        }}
                      >
                        <button
                          type="button"
                          className="gigs-catbp-gig-fav"
                          aria-label="Save gig"
                          tabIndex={-1}
                          onClick={(e) => e.stopPropagation()}
                        >
                          <FiHeart size={16} />
                        </button>
                        <div className="gigs-catbp-gig-thumb">
                          {thumbUrl ? (
                            <img src={thumbUrl} alt="" className="gigs-catbp-gig-thumb-img" />
                          ) : (
                            <div className={`gigs-feature-thumb ${fb}`} aria-hidden />
                          )}
                        </div>
                        <div className="gigs-catbp-gig-body">
                          <h3 className="gigs-catbp-gig-title">{gig.title}</h3>
                          <div className="gigs-catbp-gig-seller">
                            <span className="gigs-catbp-gig-avatar">{gig.sellerAvatarInitial}</span>
                            <span>{gig.sellerName}</span>
                            <span className="gigs-catbp-gig-badge">{gig.sellerLevel}</span>
                          </div>
                          <div className="gigs-catbp-gig-tags">
                            {(gig.tags || []).slice(0, 4).map((t) => (
                              <span key={t}>{t}</span>
                            ))}
                          </div>
                        </div>
                        <div className="gigs-catbp-gig-aside">
                          <p className="gigs-catbp-gig-price">
                            From <strong>${Number(gig.price) || 0}</strong>
                          </p>
                          <p className="gigs-catbp-gig-delivery">{gig.deliveryDays} days delivery</p>
                          <p className="gigs-catbp-gig-rate">
                            <FiStar size={12} aria-hidden /> {ratingLabel}{' '}
                            <span className="gigs-catbp-gig-reviews">({numericRev})</span>
                          </p>
                        </div>
                      </article>
                    </li>
                  );
                })}
              </ul>
            ) : null}
          </GigsCategoryProvidersCenter>

          <GigsCategoryProvidersRightRail
            category={hub.category}
            categoryMeta={hub.categoryMeta}
            CategoryIcon={hub.CategoryIcon}
            overviewStats={hub.overviewStats}
            overviewDescription={
              hub.categoryMeta?.overviewSummary ||
              `Explore published ${hub.category} gigs and freelancers on EventThon.`
            }
            gigTotalRemote={hub.facetCategoryTotal}
            facetsLoading={hub.loadingFacets}
            selectedSubcategory={hub.selectedSubcategory}
            onSelectSubcategory={hub.onSelectSubcategory}
            subCountRows={hub.subCountRows}
            sellerRows={hub.sellerRows}
            deliveryRows={hub.deliveryRows}
            railDraft={hub.railDraft}
            setRailDraft={hub.setRailDraft}
            onApplyFilters={hub.applyRailFilters}
            onClearAll={hub.clearAllFilters}
          />
        </div>
      </div>
    </div>
  );
};

export default GigsCategoryProvidersPage;
