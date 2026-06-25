import React, { useMemo, useState, useCallback, useEffect } from 'react';
import { buildDraft } from '../editProfile/EditProfileFlowPage';
import { isVerificationApproved } from '../editProfile/verificationStatus';
import { getRankMeta } from '../../../Admin/pages/UserManagement/userManagementData';
import { ensureRankMatrixLoaded } from '../../../../services/rankMatrixCache';
import ViewFullProfileHero from '../viewFullProfile/ViewFullProfileHero';
import DevProfileOverviewTabs from './DevProfileOverviewTabs';
import DevProfileOverviewMainColumn from './DevProfileOverviewMainColumn';
import DevProfileOverviewSidebar from './DevProfileOverviewSidebar';
import DevProfileOverviewFooter from './DevProfileOverviewFooter';
import DevProfileOverviewStatStrip from './DevProfileOverviewStatStrip';
import DevProfileOverviewActions from './DevProfileOverviewActions';
import { useProfileOverviewData } from './useProfileOverviewData';

const TAB_IDS = [
  'overview',
  'projects',
  'skills',
  'reviews',
  'activity',
  'squads',
  'connections',
  'followers',
];

const TAB_LABELS = {
  overview: 'Overview',
  projects: 'Projects',
  skills: 'Skills & Niche',
  reviews: 'Reviews',
  activity: 'Activity',
  squads: 'Squads',
  connections: 'Connections',
  followers: 'Followers',
};

export default function DevProfileOverviewLayout({ userData, refreshData, searchQuery = '' }) {
  const [activeTab, setActiveTab] = useState('overview');
  const { bundle, loading, error, refetch, identifier } = useProfileOverviewData(userData);

  const draft = useMemo(() => buildDraft(userData), [userData]);
  const rankMeta = getRankMeta(userData?.rank || 'frontline');
  const verified = isVerificationApproved(userData);
  const projectCount = Array.isArray(draft.projects)
    ? draft.projects.filter((p) => String(p.title || '').trim()).length
    : 0;

  const onHint = useCallback(() => {
    window.alert(
      'Visitors use Follow / Connect on your public profile. Use Quick connect in the sidebar to follow other members.',
    );
  }, []);

  useEffect(() => {
    ensureRankMatrixLoaded();
  }, []);

  useEffect(() => {
    const q = (searchQuery || '').trim().toLowerCase();
    if (!q) return;
    const match = TAB_IDS.find((id) => (TAB_LABELS[id] || id).toLowerCase().includes(q));
    if (match) setActiveTab(match);
  }, [searchQuery]);

  return (
    <div className="dpo-shell">
      {loading ? <p className="dpo-inline-status">Loading profile data…</p> : null}
      {error ? (
        <p className="dpo-inline-status dpo-inline-status--err" role="alert">
          {error}
        </p>
      ) : null}

      <div className="dpo-hero-slot">
        <ViewFullProfileHero
          draft={draft}
          userData={userData}
          verified={verified}
          rankMeta={rankMeta}
          projectCount={projectCount}
          hideStatStrip
          isProfileOwner
        />
      </div>

      <DevProfileOverviewActions onFollowHint={onHint} onConnectHint={onHint} />

      <DevProfileOverviewStatStrip stats={bundle?.stats} />

      <DevProfileOverviewTabs activeTab={activeTab} onChange={setActiveTab} tabIds={TAB_IDS} />

      <div className="dpo-grid">
        <DevProfileOverviewMainColumn
          activeTab={activeTab}
          userData={userData}
          draft={draft}
          bundle={bundle}
          refreshData={refreshData}
        />
        <DevProfileOverviewSidebar bundle={bundle} identifier={identifier} onAfterFollow={refetch} />
      </div>

      <DevProfileOverviewFooter displayName={userData?.name || userData?.first_name || 'Developer'} />
    </div>
  );
}
