import React from 'react';
import { Link } from 'react-router-dom';
import { FiLayers, FiUsers, FiStar, FiClock, FiChevronRight } from 'react-icons/fi';
import { GIGS_HUB_PATH, resolveGigCategoryHref, truncateBreadcrumbTitle } from './gigExplorerBreadcrumbs';import { DETAIL_TABS, FAQ_ITEMS } from './constants';
import GigExplorerOverviewTab from './GigExplorerOverviewTab';
import GigExplorerAboutSellerTab from './GigExplorerAboutSellerTab';
import GigExplorerReviewsTab from './GigExplorerReviewsTab';
import GigExplorerFaqTab from './GigExplorerFaqTab';
import GigExplorerMobileListTrigger from './GigExplorerMobileListTrigger';

const CHIP = 'text-xs px-2.5 py-1 rounded-lg bg-slate-800/60 text-zinc-200 font-medium inline-flex items-center gap-1.5';

const GigExplorerMainColumn = ({
  selectedGig,
  detailTab,
  setTab,
  mediaItems,
  activeMedia,
  setActiveMedia,
  reviewRows,
  followingSeller,
  onToggleFollow,
  buyerId,
  isOwnGig,
  onOpenListDrawer,
}) => (
  <section className="gigx-main">

    {/* Breadcrumbs */}
    <nav className="gigx-breadcrumbs flex flex-wrap items-center gap-1 text-xs text-zinc-400 mb-3 w-full" aria-label="Breadcrumb">
      <Link to={GIGS_HUB_PATH} className="gigx-breadcrumbs__link">
        Gigs
      </Link>
      <FiChevronRight size={12} aria-hidden />
      <Link
        to={resolveGigCategoryHref(selectedGig.category)}
        className="gigx-breadcrumbs__link"
      >
        {selectedGig.category || 'Browse'}
      </Link>
      <FiChevronRight size={12} aria-hidden />
      <span className="gigx-breadcrumbs__current" aria-current="page">
        {truncateBreadcrumbTitle(selectedGig.title)}
      </span>
    </nav>
    {/* Title Row */}
    <div className="gigx-main-head">
      <div className="gigx-main-head__title-row flex flex-row items-start justify-between gap-3 w-full">
        <h2 className="flex-1 min-w-0 text-xl lg:text-2xl font-extrabold text-white leading-snug m-0">
          {selectedGig.title}
        </h2>
        <GigExplorerMobileListTrigger onOpen={onOpenListDrawer} />
      </div>

      {/* Seller Row */}
      <div className="gigx-seller-row">
        <div className="gigx-avatar">{selectedGig.sellerAvatarInitial}</div>
        <p>{selectedGig.sellerName}</p>
        <span>{selectedGig.sellerLevel}</span>
        <strong>
          <FiStar size={11} /> {selectedGig.rating} ({selectedGig.reviews} orders)
        </strong>
        <button
          type="button"
          disabled={isOwnGig || !String(selectedGig.sellerUserId || '').trim()}
          title={selectedGig.sellerUserId ? '' : 'Follow becomes available once the gig is linked to a seller account'}
          onClick={onToggleFollow}
        >
          {followingSeller ? 'Following' : 'Follow'}
        </button>
      </div>
    </div>

    {/* Meta Bar */}
    <div className="gigx-meta-bar flex flex-wrap items-center gap-2 w-full mt-4 bg-slate-900/30 p-2.5 rounded-xl border border-slate-800/40 lg:mt-[14px] lg:gap-[10px] lg:p-0 lg:rounded-none lg:border-0 lg:bg-transparent">
      <span className={`gigx-status-pill is-${String(selectedGig.status || '').toLowerCase().replace(/\s+/g, '-')} ${CHIP}`}>
        {selectedGig.status || 'Draft'}
      </span>
      <span className={`gigx-meta-chip ${CHIP}`}>
        <FiLayers size={13} aria-hidden /> {selectedGig.serviceType || 'General'}
      </span>
      {selectedGig.ownerType === 'squad' ? (
        <span className={`gigx-meta-chip gigx-meta-squad ${CHIP}`}>
          <FiUsers size={13} aria-hidden /> {selectedGig.squadName || 'Squad gig'}
        </span>
      ) : (
        <span className={`gigx-meta-chip ${CHIP}`}>Personal gig</span>
      )}
      <span className={`gigx-meta-chip ${CHIP}`}>
        <FiClock size={13} aria-hidden /> {selectedGig.deliveryTime || `${selectedGig.deliveryDays} days`}
        <span className="gigx-meta-muted">listed</span>
      </span>
      <span className={`gigx-meta-chip ${CHIP}`}>
        <FiClock size={13} aria-hidden /> {selectedGig.deliveryDays}d package SLA
      </span>
      {!buyerId ? (
        <span className={`gigx-meta-chip gigx-meta-muted ${CHIP}`}>Log in to follow or save</span>
      ) : null}
    </div>

    {/* Tabs */}
    <div
      className="gigx-tabs flex flex-row overflow-x-auto gap-2 w-full border-b border-slate-800 pb-px flex-nowrap mt-4 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
      role="tablist"
      aria-label="Gig sections"
    >
      {DETAIL_TABS.map((tab) => (
        <button
          key={tab.id}
          type="button"
          role="tab"
          aria-selected={detailTab === tab.id}
          onClick={() => setTab(tab.id)}
          className={`shrink-0 whitespace-nowrap text-xs font-semibold px-4 py-2.5 transition-all active:scale-95 border-b-2 ${
            detailTab === tab.id
              ? 'text-white border-blue-600 font-bold bg-blue-600/5'
              : 'text-zinc-400 border-transparent'
          }`}
        >
          {tab.label}
        </button>
      ))}
    </div>

    {/* Tab Panels */}
    <div className="gigx-tab-panels">
      {detailTab === 'overview' ? (
        <GigExplorerOverviewTab
          selectedGig={selectedGig}
          mediaItems={mediaItems}
          activeMedia={activeMedia}
          setActiveMedia={setActiveMedia}
        />
      ) : null}
      {detailTab === 'aboutSeller' ? <GigExplorerAboutSellerTab selectedGig={selectedGig} /> : null}
      {detailTab === 'reviews' ? <GigExplorerReviewsTab selectedGig={selectedGig} reviewRows={reviewRows} /> : null}
      {detailTab === 'faq' ? <GigExplorerFaqTab faqItems={FAQ_ITEMS} /> : null}
    </div>

  </section>
);

export default GigExplorerMainColumn;