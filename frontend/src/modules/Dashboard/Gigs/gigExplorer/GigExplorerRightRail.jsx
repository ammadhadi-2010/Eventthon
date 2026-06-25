import React from 'react';
import { FiMessageCircle, FiHeart, FiCheck, FiClock, FiZap } from 'react-icons/fi';

const GigExplorerRightRail = ({
  sidebarToast,
  selectedGig,
  isSidebarSaved,
  toggleSaveSidebar,
  reportSending,
  openReportModal,
  buyerId,
  isOwnGig,
  copyShareLink,
  activePackage,
  onPackagePick,
  sidebarTier,
  sidebarPackageFeatures,
  inquireSending,
  isLiveGig,
  isDemoGig,
  startBetaInquire,
}) => {
  const canInquire = Boolean(buyerId && !isOwnGig && isLiveGig && !isDemoGig);
  const busy = inquireSending;

  return (
    <aside className="gigx-right">
      {sidebarToast ? (
        <div className="gigx-sidebar-toast" role="status">
          {sidebarToast}
        </div>
      ) : null}
      <div className="gigx-actions">
        <button type="button" onClick={copyShareLink}>Share</button>
        <button type="button" className={isSidebarSaved ? 'is-saved' : ''} onClick={toggleSaveSidebar}>
          <FiHeart size={12} /> {isSidebarSaved ? 'Saved' : 'Save'}
        </button>
        <button type="button" disabled={reportSending} onClick={openReportModal}>
          Report
        </button>
      </div>

      <div className="gigx-package-card">
        <div className="gigx-package-tabs">
          {['basic', 'standard', 'premium'].map((key) => (
            <button
              key={key}
              type="button"
              className={activePackage === key ? 'is-active' : ''}
              disabled={busy || !canInquire}
              onClick={() => onPackagePick(key)}
            >
              {key.charAt(0).toUpperCase() + key.slice(1)}
            </button>
          ))}
        </div>
        <div className="gigx-package-body">
          <div className="gigx-package-price">
            <h4>{sidebarTier ? `${sidebarTier.label} Package` : 'Package'}</h4>
            <strong>${sidebarTier?.price ?? selectedGig.price ?? 0}</strong>
            <span className="gigx-beta-price-note">Quote only · no checkout in beta</span>
          </div>
          <p>I will deliver {selectedGig.category.toLowerCase()} service with quality output.</p>
          <p className="gigx-package-meta">
            <FiClock size={12} /> {sidebarTier?.delivery ?? selectedGig.deliveryDays} Days Delivery •{' '}
            {sidebarTier?.revisions ?? selectedGig.revisions} Revisions
          </p>
          <ul>
            {sidebarPackageFeatures.map((feature) => (
              <li key={feature}><FiCheck size={12} /> {feature}</li>
            ))}
          </ul>
          <button
            type="button"
            className="gigx-continue-btn"
            disabled={busy || !canInquire}
            onClick={() => startBetaInquire()}
          >
            {busy
              ? 'Opening chat…'
              : !buyerId
                ? 'Log in to inquire'
                : isOwnGig
                  ? 'Your gig'
                  : !isLiveGig || isDemoGig
                    ? 'Select a live gig'
                    : 'Inquire & Chat'}
          </button>
        </div>
      </div>

      {selectedGig.addons.length ? (
        <div className="gigx-mini-card">
          <h4>Optional add-ons</h4>
          <ul className="gigx-addon-sidebar-list">
            {selectedGig.addons.map((addon) => (
              <li key={addon}>{addon}</li>
            ))}
          </ul>
        </div>
      ) : null}

      <div className="gigx-mini-card gigx-beta-card">
        <h4><FiZap size={13} /> Global beta</h4>
        <p>No payment gateway — we create a free in-progress order and open Messages so you can negotiate directly.</p>
      </div>

      <div className="gigx-mini-card">
        <h4>Have a question?</h4>
        <p>Start the same chat flow — no forms or checkout screens.</p>
        <button type="button" className="gigx-contact-btn" disabled={busy || !canInquire} onClick={() => startBetaInquire()}>
          <FiMessageCircle size={12} /> Message Seller
        </button>
      </div>
    </aside>
  );
};

export default GigExplorerRightRail;
