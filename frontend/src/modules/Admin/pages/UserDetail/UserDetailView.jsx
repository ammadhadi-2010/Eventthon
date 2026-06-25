import React from 'react';
import { Search } from 'lucide-react';
import UserDetailBreadcrumbs from './UserDetailBreadcrumbs';
import UserDetailTabs from './UserDetailTabs';
import UserDetailLeftCard from './UserDetailLeftCard';
import UserDetailCenterPanel from './UserDetailCenterPanel';
import UserDetailRightPanel from './UserDetailRightPanel';
import UserProfileReviewExperience from '../UserManagement/UserProfileReviewExperience';
import UserProfileReviewAttachments from '../UserManagement/UserProfileReviewAttachments';
import UserDetailPortfolioLinks from './UserDetailPortfolioLinks';

export default function UserDetailView({ user, row, actionKey, loading, onRefetch }) {
  return (
    <div className="ud-view">
      <div className="ud-topbar">
        <UserDetailBreadcrumbs displayName={row?.displayName} />
        <div className="ud-search admin-chip">
          <Search size={15} className="ud-search-icon" aria-hidden />
          <span className="ud-search-placeholder">Search users by name, email or ID…</span>
        </div>
      </div>

      {loading ? <p className="ud-inline-loading">Refreshing full profile data…</p> : null}

      <UserDetailTabs />

      <div className="ud-grid">
        <UserDetailLeftCard user={user} row={row} />
        <div className="ud-center-stack">
          <UserDetailCenterPanel user={user} row={row} />
          <UserDetailPortfolioLinks user={user} />
          <section className="ud-card ud-section ud-section--embedded">
            <UserProfileReviewExperience user={user} />
          </section>
          <section className="ud-card ud-section ud-section--embedded">
            <UserProfileReviewAttachments user={user} loading={false} />
          </section>
        </div>
        <UserDetailRightPanel user={user} row={row} actionKey={actionKey} onAfterAction={onRefetch} />
      </div>
    </div>
  );
}
