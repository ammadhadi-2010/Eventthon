import React, { useEffect, useState } from 'react';
import { FiSearch } from 'react-icons/fi';
import { BusinessIcon, BUSINESS_LOTTIE } from '../../../../components/lottie';
import { useJobsHub } from '../context/JobsHubContext';
import { saveJobsBrowseFilters } from '../utils/jobsBrowseSession';
import JobsBrowseFilterRow from './JobsBrowseFilterRow';
import JobsBrowseQuickFilters from './JobsBrowseQuickFilters';
import JobsBrowseMobileActionStrip from './JobsBrowseMobileActionStrip';

const JobsBrowseHero = ({ onOpenLeftDrawer = () => {} }) => {
  const { searchFilters, setSearchFilters } = useJobsHub();
  const [draftQ, setDraftQ] = useState(searchFilters.q || '');

  useEffect(() => {
    setDraftQ(searchFilters.q || '');
  }, [searchFilters.q]);

  const onSearch = () => {
    const next = saveJobsBrowseFilters({ q: draftQ.trim() });
    setSearchFilters(next);
  };

  return (
    <div className="gigs-card gigs-hero-card jobs-hero-card">
      <div className="gigs-hero-header jobs-hero-header">
        <div>
          <h2 className="gigs-hero-title jobs-mobile-section-title">Find remote jobs from global companies</h2>
          <p className="gigs-hero-subtitle">
            Search verified roles, filter by work style, and apply in one click.
          </p>
        </div>
        <div className="jobs-hero-lottie-wrap" aria-hidden="true">
          <BusinessIcon
            src={BUSINESS_LOTTIE.briefcase}
            size={88}
            label="Jobs opportunity briefcase animation"
          />
        </div>
      </div>

      <div className="jobs-mobile-toolbar">
        <JobsBrowseMobileActionStrip onOpenLeftDrawer={onOpenLeftDrawer} />

        <div className="gigs-hero-search-row jobs-hero-search-row">
          <div className="gigs-search-wrap jobs-hero-search-wrap">
            <FiSearch className="gigs-search-icon" aria-hidden />
            <input
              type="search"
              className="gigs-search-input"
              placeholder="Search by role, company, or skill..."
              value={draftQ}
              onChange={(e) => setDraftQ(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && onSearch()}
              aria-label="Search jobs"
            />
            <button
              type="button"
              className="gigs-search-btn-inline"
              aria-label="Search jobs"
              onClick={onSearch}
            >
              <FiSearch size={14} aria-hidden />
            </button>
          </div>
          <button type="button" className="gigs-search-btn gigs-search-btn--desktop" onClick={onSearch}>
            Search Jobs
          </button>
        </div>
      </div>

      <JobsBrowseQuickFilters searchFilters={searchFilters} setSearchFilters={setSearchFilters} />
      <JobsBrowseFilterRow setSearchFilters={setSearchFilters} />
    </div>
  );
};

export default JobsBrowseHero;
