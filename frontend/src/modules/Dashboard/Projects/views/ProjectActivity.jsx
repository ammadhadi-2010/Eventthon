import React, { useMemo, useState } from 'react';
import { FiUpload } from 'react-icons/fi';
import ActivityFeedList from '../components/activity/ActivityFeedList';
import ActivityFeedPagination from '../components/activity/ActivityFeedPagination';
import ActivityFeedTabs from '../components/activity/ActivityFeedTabs';
import ActivityFeedToolbar from '../components/activity/ActivityFeedToolbar';
import ProjectsViewHeader from '../components/shared/ProjectsViewHeader';
import useProjectActivityApi from '../hooks/useProjectActivityApi';
import { ACTIVITY_PAGE_SIZE } from '../data/projectActivityData';

export default function ProjectActivity() {
  const { feed, tabs, typeFilters, projectFilters, loading, error } = useProjectActivityApi();
  const [activeTab, setActiveTab] = useState('all');
  const [query, setQuery] = useState('');
  const [projectFilter, setProjectFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [page, setPage] = useState(1);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return feed.filter((item) => {
      if (activeTab !== 'all' && item.type !== activeTab) return false;
      if (typeFilter !== 'all' && item.type !== typeFilter) return false;
      if (projectFilter !== 'all' && item.projectId !== projectFilter) return false;
      if (!q) return true;
      const hay = `${item.project} ${item.action} ${item.detail || ''}`.toLowerCase();
      return hay.includes(q);
    });
  }, [feed, activeTab, typeFilter, projectFilter, query]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / ACTIVITY_PAGE_SIZE));
  const pageItems = useMemo(() => {
    const safePage = Math.min(page, totalPages);
    const start = (safePage - 1) * ACTIVITY_PAGE_SIZE;
    return filtered.slice(start, start + ACTIVITY_PAGE_SIZE);
  }, [filtered, page, totalPages]);

  const handleExport = () => {
    const lines = [
      ['Project', 'Action', 'Detail', 'Time'].join('\t'),
      ...filtered.map((r) => [r.project, r.action, r.detail || '', r.time].join('\t')),
    ];
    const blob = new Blob([lines.join('\n')], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'project-activity.txt';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="ph-center-stack ph-activity-view">
      <ProjectsViewHeader
        title="Project Activity"
        subtitle="Track all the latest activities across your projects."
        action={
          <button type="button" className="ph-btn ph-btn--ghost ph-act-export" onClick={handleExport}>
            <FiUpload size={14} aria-hidden />
            Export
          </button>
        }
      />
      {error ? <p className="ph-api-banner">{error}</p> : null}
      {loading ? <p className="ph-act-loading">Loading activity…</p> : null}
      <ActivityFeedTabs activeTab={activeTab} onChange={(tabId) => { setActiveTab(tabId); setPage(1); }} tabs={tabs} />
      <ActivityFeedToolbar
        query={query}
        onQueryChange={(v) => { setQuery(v); setPage(1); }}
        projectFilter={projectFilter}
        onProjectFilterChange={(v) => { setProjectFilter(v); setPage(1); }}
        typeFilter={typeFilter}
        onTypeFilterChange={(v) => { setTypeFilter(v); setPage(1); }}
        projectOptions={projectFilters}
        typeOptions={typeFilters}
      />
      <div className="ph-card ph-act-feed-card">
        <ActivityFeedList items={pageItems} />
        <ActivityFeedPagination page={Math.min(page, totalPages)} totalPages={totalPages} onPageChange={setPage} />
      </div>
    </div>
  );
}
