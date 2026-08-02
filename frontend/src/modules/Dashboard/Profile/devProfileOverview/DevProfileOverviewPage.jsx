import React from 'react';
import DevProfileOverviewLayout from './DevProfileOverviewLayout';
import '../viewFullProfile/vfph-1.css';
import '../viewFullProfile/vfph-2.css';
import './devProfileOverview.css';
import './devProfileOverview-mobile.css';

/**
 * Profile home: body uses devProfileOverview shell; hero + stats reuse ViewFullProfileHero + buildDraft.
 * Mobile keeps the global EventThon navbar (same as donation hub).
 */
export default function DevProfileOverviewPage({ userData, refreshData }) {
  return (
    <div className="dpo-root dpo-mobile-shell hub-inner-mobile-shell">
      <DevProfileOverviewLayout userData={userData} refreshData={refreshData} />
    </div>
  );
}
