import React from 'react';
import { FiStar } from 'react-icons/fi';

const GigExplorerLeftList = ({ rows, selectedGig, selectGigRow, drawerOpen = false, onCloseDrawer }) => (
  <aside className={`gigx-left${drawerOpen ? ' is-drawer-open' : ''}`}>
    <div className="gigx-left-head">
      <div className="gigx-left-head__row">
        <div>
          <h3>Browse Gigs</h3>
          <p>{rows.length} results found</p>
        </div>
        <button type="button" className="gigx-left-drawer-close" aria-label="Close gigs list" onClick={onCloseDrawer}>
          ×
        </button>
      </div>
    </div>
    {rows.length === 0 ? (
      <p className="gigx-left-empty">
        No published gigs matched. Adjust your search or open Browse Gigs without filters.
      </p>
    ) : (
      rows.map((gig) => (
        <article
          key={gig.id}
          className={`gigx-left-row${selectedGig?.id === gig.id ? ' is-active' : ''}`}
          onClick={() => selectGigRow(gig.id)}
          role="button"
          tabIndex={0}
          onKeyDown={(event) => {
            if (event.key === 'Enter' || event.key === ' ') selectGigRow(gig.id);
          }}
        >
          <div className="gigx-left-thumb">{(gig.category || '--').slice(0, 2).toUpperCase()}</div>
          <div>
            <h4>{gig.title}</h4>
            <p>{gig.sellerName} • {gig.sellerLevel}</p>
            <small>
              <FiStar size={11} /> {gig.rating} ({gig.reviews})
              {gig.ownerType === 'squad' ? <span className="gigx-left-squad">Squad</span> : null}
            </small>
          </div>
          <strong>From ${gig.price || 0}</strong>
        </article>
      ))
    )}
  </aside>
);

export default GigExplorerLeftList;
