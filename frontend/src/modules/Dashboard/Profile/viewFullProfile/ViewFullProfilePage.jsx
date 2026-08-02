import React, { useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useMobileHub } from '../../../../hooks/useMobileHub';
import { readStoredUserStub } from '../../../../utils/storedUser';
import { buildDraft } from '../editProfile/EditProfileFlowPage';
import { ensureRankMatrixLoaded } from '../../../../services/rankMatrixCache';
import { isVerificationApproved } from '../editProfile/verificationStatus';
import { getRankMeta } from '../../../Admin/pages/UserManagement/userManagementData';
import { useProfileOverviewData } from '../devProfileOverview/useProfileOverviewData';
import { buildFeaturedProjects } from './viewFullProfileUtils';
import { isProfileOwner } from './profileOwner';
import ViewFullProfileNav from './ViewFullProfileNav';
import ViewFullProfileHero from './ViewFullProfileHero';
import ViewFullProfileCenterColumn from './ViewFullProfileCenterColumn';
import ViewFullProfileRightColumn from './ViewFullProfileRightColumn';
import './vfph-1.css';
import './vfph-2.css';
import './viewFullProfile.css';
import './viewFullProfile-mobile.css';
import './viewFullProfile-reviews-mobile.css';

export default function ViewFullProfilePage({ userData, refreshData }) {
  const isMobile = useMobileHub();
  const sessionUser = useMemo(() => readStoredUserStub(), []);
  const owner = useMemo(() => isProfileOwner(userData, sessionUser), [userData, sessionUser]);
  const { bundle } = useProfileOverviewData(userData);

  const draft = useMemo(() => buildDraft(userData), [userData]);
  const rankMeta = getRankMeta(userData?.rank || 'frontline');
  const verified = isVerificationApproved(userData);
  const projectCount = Array.isArray(draft.projects)
    ? draft.projects.filter((p) => String(p.title || '').trim()).length
    : 0;
  const featuredProjects = useMemo(() => buildFeaturedProjects(draft.projects), [draft.projects]);

  const overviewGamification = bundle?.gamification;
  const gamification = useMemo(
    () => ({
      current_xp: Number(overviewGamification?.current_xp ?? userData?.xp_current ?? 0),
      next_xp: Number(overviewGamification?.next_xp ?? userData?.xp_next ?? 1000),
      next_rank: String(overviewGamification?.next_rank || userData?.rank_next_label || ''),
      progress_pct: Number(overviewGamification?.progress_pct ?? userData?.progress_pct ?? 0),
      rank_label: String(overviewGamification?.rank_label || rankMeta?.label || ''),
    }),
    [overviewGamification, userData, rankMeta?.label],
  );

  const heroStats = useMemo(() => {
    const s = bundle?.stats || {};
    return {
      profile_views: s.profile_views,
      connections: s.connections,
      squads: s.squads,
      projects: s.projects ?? projectCount,
      success_score: s.success_score,
      impressions: s.impressions,
    };
  }, [bundle?.stats, projectCount]);

  useEffect(() => {
    ensureRankMatrixLoaded();
  }, []);

  return (
    <div className={`vfps-page${isMobile ? ' vfps-mobile-shell' : ''}`}>
      <div className="vfps-toolbar vfps-toolbar--desktop">
        <Link to="/profile">← Profile home</Link>
        <button type="button" onClick={() => refreshData?.()}>
          Refresh
        </button>
        {owner ? (
          <Link to="/profile/edit" className="vfps-accent">
            Edit profile
          </Link>
        ) : null}
      </div>

      <div className="vfps-layout">
        <ViewFullProfileNav />

        <div className="vfps-center">
          <div className="vfps-shell">
            <ViewFullProfileHero
              draft={draft}
              userData={userData}
              verified={verified}
              rankMeta={rankMeta}
              projectCount={projectCount}
              gamification={gamification}
              stats={heroStats}
              isProfileOwner={owner}
            />
            <ViewFullProfileCenterColumn
              draft={draft}
              featuredProjects={featuredProjects}
              projectCount={projectCount}
              stats={heroStats}
            />
          </div>
        </div>

        <ViewFullProfileRightColumn
          draft={draft}
          userData={userData}
          verified={verified}
          rankMeta={rankMeta}
          gamification={gamification}
        />
      </div>
    </div>
  );
}
