import React, { useEffect, useMemo, useState } from 'react';
import { FiArrowLeft, FiCalendar, FiUpload } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import { useMobileHub } from '../../../../hooks/useMobileHub';
import ActivityFeedPagination from '../components/activity/ActivityFeedPagination';
import ActivityFilterDropdown from '../components/activity/ActivityFilterDropdown';
import CollaboratorsTable from '../components/collaborators/CollaboratorsTable';
import CollaboratorsTabs from '../components/collaborators/CollaboratorsTabs';
import ProjectsViewHeader from '../components/shared/ProjectsViewHeader';
import useTopCollaboratorsApi from '../hooks/useTopCollaboratorsApi';
import { COLLABORATORS_PAGE_SIZE } from '../data/topCollaboratorsData';

export default function TopCollaborators({ searchQuery = '' }) {
  const navigate = useNavigate();
  const isMobile = useMobileHub();
  const { rows, tabs, periodFilters, loading, error } = useTopCollaboratorsApi();
  const [activeTab, setActiveTab] = useState('all');
  const [period, setPeriod] = useState('month');
  const [page, setPage] = useState(1);

  const filtered = useMemo(() => {
    let list = activeTab === 'all' ? [...rows] : rows.filter((row) => row.group === activeTab);
    const q = searchQuery.trim().toLowerCase();
    if (q) {
      list = list.filter((row) => `${row.name} ${row.title}`.toLowerCase().includes(q));
    }
    return list;
  }, [rows, activeTab, searchQuery]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / COLLABORATORS_PAGE_SIZE));
  const pageItems = useMemo(() => {
    const safePage = Math.min(page, totalPages);
    const start = (safePage - 1) * COLLABORATORS_PAGE_SIZE;
    return filtered.slice(start, start + COLLABORATORS_PAGE_SIZE);
  }, [filtered, page, totalPages]);

  const startRank = (Math.min(page, totalPages) - 1) * COLLABORATORS_PAGE_SIZE + 1;

  useEffect(() => {
    setPage(1);
  }, [searchQuery, activeTab]);

  const handleExport = () => {
    const lines = [
      ['Rank', 'Name', 'Title', 'Projects', 'Contributions', 'Impact', 'Rating'].join('\t'),
      ...filtered.map((r, i) =>
        [i + 1, r.name, r.title, r.projects, r.contributions, `${r.impact}%`, r.rating].join('\t'),
      ),
    ];
    const blob = new Blob([lines.join('\n')], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'top-collaborators.txt';
    a.click();
    URL.revokeObjectURL(url);
  };

  const headerActions = (
    <div className="ph-col-header-actions">
      <button type="button" className="ph-btn ph-btn--ghost ph-col-export" onClick={handleExport}>
        <FiUpload size={14} aria-hidden />
        Export
      </button>
      <ActivityFilterDropdown
        icon={FiCalendar}
        value={period}
        options={periodFilters}
        onChange={setPeriod}
        ariaLabel="Time period"
      />
    </div>
  );

  return (
    <div className="ph-center-stack ph-collaborators-view">
      {isMobile ? (
        <header className="ph-col-mobile-head">
          <div className="ph-col-mobile-title-row">
            <button
              type="button"
              className="ph-col-mobile-back"
              onClick={() => navigate('/projects')}
              aria-label="Back to projects hub"
            >
              <FiArrowLeft size={20} aria-hidden />
            </button>
            <div className="ph-col-mobile-title-copy">
              <h1 className="ph-hero-title">Top Collaborators</h1>
              <p className="ph-hero-sub">
                Meet the most active and impactful collaborators in the community.
              </p>
            </div>
          </div>
          {headerActions}
        </header>
      ) : (
        <ProjectsViewHeader
          title="Top Collaborators"
          subtitle="Meet the most active and impactful collaborators in the community."
          action={headerActions}
        />
      )}
      {error ? <p className="ph-api-banner">{error}</p> : null}
      {loading ? <p className="ph-col-loading">Loading collaborators…</p> : null}
      <CollaboratorsTabs
        activeTab={activeTab}
        tabs={tabs}
        onChange={(tabId) => {
          setActiveTab(tabId);
          setPage(1);
        }}
      />
      <div className="ph-card ph-col-feed-card">
        <CollaboratorsTable rows={pageItems} startRank={startRank} />
        <ActivityFeedPagination
          page={Math.min(page, totalPages)}
          totalPages={totalPages}
          onPageChange={setPage}
        />
      </div>
    </div>
  );
}
