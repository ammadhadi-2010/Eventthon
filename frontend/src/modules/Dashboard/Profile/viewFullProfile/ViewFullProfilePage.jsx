import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useScrollDirection } from '../../../../hooks/useScrollDirection';
import { useMobileHub } from '../../../../hooks/useMobileHub';
import { readStoredUserStub } from '../../../../utils/storedUser';
import { buildDraft } from '../editProfile/EditProfileFlowPage';
import { ensureRankMatrixLoaded } from '../../../../services/rankMatrixCache';
import { isVerificationApproved } from '../editProfile/verificationStatus';
import { getRankMeta } from '../../../Admin/pages/UserManagement/userManagementData';
import { buildFeaturedProjects } from './viewFullProfileUtils';
import { isProfileOwner } from './profileOwner';
import ViewFullProfileNav from './ViewFullProfileNav';
import ViewFullProfileHero from './ViewFullProfileHero';
import ViewFullProfileCenterColumn from './ViewFullProfileCenterColumn';
import ViewFullProfileRightColumn from './ViewFullProfileRightColumn';
import HubMobileTopBar from '../../components/mobile/HubMobileTopBar';
import { HUB_MOBILE_SEARCH } from '../../components/mobile/hubMobileSearchPresets';
import './vfph-1.css';
import './vfph-2.css';
import './viewFullProfile.css';
import './viewFullProfile-mobile.css';
import './viewFullProfile-reviews-mobile.css';

const SECTION_SCROLL = [
  ['vfps-section-about', ['about', 'me']],
  ['vfps-section-skills', ['skill', 'performance']],
  ['vfps-section-experience', ['experience', 'work']],
  ['vfps-section-projects', ['project', 'featured']],
  ['vfps-section-reviews', ['review', 'rating']],
];

export default function ViewFullProfilePage({ userData, refreshData }) {
  const isMobile = useMobileHub();
  const scrollDirection = useScrollDirection();
  const [searchQuery, setSearchQuery] = useState('');
  const sessionUser = useMemo(() => readStoredUserStub(), []);
  const owner = useMemo(() => isProfileOwner(userData, sessionUser), [userData, sessionUser]);

  const draft = useMemo(() => buildDraft(userData), [userData]);
  const rankMeta = getRankMeta(userData?.rank || 'frontline');
  const verified = isVerificationApproved(userData);
  const projectCount = Array.isArray(draft.projects)
    ? draft.projects.filter((p) => String(p.title || '').trim()).length
    : 0;
  const featuredProjects = useMemo(() => buildFeaturedProjects(draft.projects), [draft.projects]);
  const gamification = useMemo(
    () => ({
      current_xp: Number(userData?.xp_current ?? 650),
      next_xp: Number(userData?.xp_next ?? 1000),
      next_rank: String(userData?.rank_next_label || 'Specialist'),
    }),
    [userData],
  );

  useEffect(() => {
    ensureRankMatrixLoaded();
  }, []);

  useEffect(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return;
    const hit = SECTION_SCROLL.find(([, terms]) => terms.some((t) => q.includes(t) || t.includes(q)));
    if (hit) {
      document.getElementById(hit[0])?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [searchQuery]);

  return (
    <div className={`vfps-page${isMobile ? ' vfps-mobile-shell' : ''}`}>
      {isMobile ? (
        <HubMobileTopBar
          scrollDirection={scrollDirection}
          searchQuery={searchQuery}
          onSearchQueryChange={setSearchQuery}
          {...HUB_MOBILE_SEARCH.viewProfile}
        />
      ) : null}

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
              isProfileOwner={owner}
            />
            <ViewFullProfileCenterColumn
              draft={draft}
              featuredProjects={featuredProjects}
              projectCount={projectCount}
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
