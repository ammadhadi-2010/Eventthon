import React, { useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import '../styles/GigsDashboard.css';
import useSavedGigs from '../hooks/useSavedGigs';
import { buildReviewRows, derivePackageTiers } from './constants';
import GigExplorerLeftList from './GigExplorerLeftList';
import GigExplorerMainColumn from './GigExplorerMainColumn';
import GigExplorerModals from './GigExplorerModals';
import GigExplorerRightRail from './GigExplorerRightRail';
import GigExplorerSearchBar from './GigExplorerSearchBar';
import useGigExplorerBrowse from './useGigExplorerBrowse';
import useGigExplorerCommerce from './useGigExplorerCommerce';
import useGigExplorerUiState from './useGigExplorerUiState';
import '../styles/gigs-explorer-mobile.css';

const GigExplorerPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const gigSlugFromUrl = searchParams.get('gig') || '';
  const browse = useGigExplorerBrowse(gigSlugFromUrl, setSearchParams);
  const ui = useGigExplorerUiState(browse.selectedId);
  const { savedRows, toggleSaved } = useSavedGigs();

  const selectedGig = useMemo(
    () => browse.rows.find((row) => row.id === browse.selectedId) || browse.rows[0],
    [browse.rows, browse.selectedId],
  );

  const mediaItems = useMemo(() => {
    if (!selectedGig) return [];
    if (selectedGig.images.length) return selectedGig.images;
    return ['placeholder-one', 'placeholder-two', 'placeholder-three'];
  }, [selectedGig]);

  const packageTiers = useMemo(() => (selectedGig ? derivePackageTiers(selectedGig) : []), [selectedGig]);
  const tierByKey = useMemo(() => Object.fromEntries(packageTiers.map((t) => [t.key, t])), [packageTiers]);
  const reviewRows = useMemo(() => (selectedGig ? buildReviewRows(selectedGig) : []), [selectedGig]);
  const sidebarTier = tierByKey[ui.activePackage] || packageTiers[0];
  const sidebarPackageFeatures = selectedGig?.packageFeatures?.length
    ? selectedGig.packageFeatures
    : ['Service included', 'Client support', 'Detailed delivery'];

  const commerce = useGigExplorerCommerce(selectedGig, savedRows, toggleSaved, ui.activePackage);

  const handlePackagePick = (tierKey) => {
    ui.setActivePackage(tierKey);
    commerce.startBetaInquire(tierKey);
  };

  const handleSelectGig = (id) => {
    browse.selectGigRow(id);
    ui.closeListDrawer();
  };

  if (browse.loading) {
    return (
      <div className="gigs-page">
        <section className="gigx-shell gigs-card">
          <p>Loading gigs...</p>
        </section>
      </div>
    );
  }

  return (
    <div className="gigs-page">
      <section className="gigx-shell gigs-card">
        <GigExplorerSearchBar
          listSearchDraft={browse.listSearchDraft}
          setListSearchDraft={browse.setListSearchDraft}
          runExplorerSearch={browse.runExplorerSearch}
        />
        <div className={`gigx-grid${ui.listDrawerOpen ? ' gigx-grid--list-open' : ''}`}>
          {ui.listDrawerOpen ? (
            <button
              type="button"
              className="gigx-drawer-backdrop"
              aria-label="Close gigs list"
              onClick={ui.closeListDrawer}
            />
          ) : null}
          <GigExplorerLeftList
            rows={browse.rows}
            selectedGig={selectedGig}
            selectGigRow={handleSelectGig}
            drawerOpen={ui.listDrawerOpen}
            onCloseDrawer={ui.closeListDrawer}
          />
          {selectedGig ? (
            <>
              <GigExplorerMainColumn
                buyerId={commerce.buyerId}
                detailTab={ui.detailTab}
                followingSeller={commerce.followingSeller}
                activeMedia={ui.activeMedia}
                isOwnGig={commerce.isOwnGig}
                mediaItems={mediaItems}
                onToggleFollow={commerce.toggleFollowSeller}
                reviewRows={reviewRows}
                selectedGig={selectedGig}
                setActiveMedia={ui.setActiveMedia}
                setTab={ui.setTab}
                onOpenListDrawer={ui.openListDrawer}
              />
              <GigExplorerRightRail
                activePackage={ui.activePackage}
                buyerId={commerce.buyerId}
                copyShareLink={commerce.copyShareLink}
                isDemoGig={commerce.isDemoGig}
                isLiveGig={commerce.isLiveGig}
                isOwnGig={commerce.isOwnGig}
                isSidebarSaved={commerce.isSidebarSaved}
                inquireSending={commerce.inquireSending}
                onPackagePick={handlePackagePick}
                openReportModal={commerce.openReportModal}
                reportSending={commerce.reportSending}
                selectedGig={selectedGig}
                sidebarPackageFeatures={sidebarPackageFeatures}
                sidebarTier={sidebarTier}
                sidebarToast={commerce.sidebarToast}
                startBetaInquire={commerce.startBetaInquire}
                toggleSaveSidebar={commerce.toggleSaveSidebar}
              />
            </>
          ) : (
            <section className="gigx-main">
              <p>No gig found.</p>
            </section>
          )}
        </div>
      </section>

      <GigExplorerModals
        reportDraft={commerce.reportDraft}
        reportModalOpen={commerce.reportModalOpen}
        reportSending={commerce.reportSending}
        setReportDraft={commerce.setReportDraft}
        setReportModalOpen={commerce.setReportModalOpen}
        submitReportFromModal={commerce.submitReportFromModal}
      />
    </div>
  );
};

export default GigExplorerPage;
