import React, { useEffect, useState } from 'react';
import useShowroomAuth from '../../../../hooks/useShowroomAuth';
import { fetchPublicJobsBoard } from '../../../../services/publicApi';
import JobBoardSearchHeader from './JobBoardSearchHeader';
import JobBoardStats from './JobBoardStats';
import JobBoardListings from './JobBoardListings';
import JobBoardSidebar from './JobBoardSidebar';
import JobBoardCtaBanner from './JobBoardCtaBanner';
import { BOARD_TRUST_BADGES } from './jobBoardUtils';
import '../../../../styles/showroom-premium.css';
import '../../../../styles/showroom-marketplace.css';
import '../../../../styles/showroom-job-board-mobile.css';
import '../../../../styles/showroom-job-board-inline.css';

export default function JobBoardView({ forceGuest = true, embedded = false }) {
  const { isGuest } = useShowroomAuth(forceGuest);
  const [query, setQuery] = useState('');
  const [board, setBoard] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    setLoading(true);
    fetchPublicJobsBoard(query)
      .then((payload) => {
        if (active) setBoard(payload);
      })
      .catch(() => {
        if (active) setBoard(null);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [query]);

  const jobs = board?.jobs || [];
  const stats = board?.stats;
  const filters = board?.filters;
  const trustBadges = board?.trustBadges || BOARD_TRUST_BADGES;

  return (
    <div className={`ps-page ps-page--marketplace ps-jb-page ps-jb-board-shell${embedded ? ' ps-jb-page--embedded' : ''}`}>
      {!embedded ? (
        <nav className="ps-breadcrumb" aria-label="Breadcrumb">
          <span>Jobs</span>
          <span aria-hidden>›</span>
          <span>Remote Board</span>
        </nav>
      ) : null}

      <JobBoardSearchHeader query={query} onQueryChange={setQuery} filters={filters} />
      <JobBoardStats stats={stats} />

      {loading ? (
        <p className="public-state">Loading jobs…</p>
      ) : (
        <div className="ps-mp-grid ps-jb-grid ps-jb-board-layout">
          <JobBoardListings jobs={jobs} isGuest={isGuest} />
          <JobBoardSidebar
            isGuest={isGuest}
            jobCount={board?.summary?.jobsFound ?? jobs.length}
            avgSalary={board?.summary?.avgSalary}
            remoteBenefits={board?.remoteBenefits}
            applicationFlow={board?.applicationFlow}
          />
        </div>
      )}

      <JobBoardCtaBanner />

      <div className="ps-mp-trust-banner ps-jb-trust" aria-label="Trust badges">
        {trustBadges.map((label) => (
          <span key={label} className="ps-mp-trust-pill">
            {label}
          </span>
        ))}
      </div>
    </div>
  );
}
