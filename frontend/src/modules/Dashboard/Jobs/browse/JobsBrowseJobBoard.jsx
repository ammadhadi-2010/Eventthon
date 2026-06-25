import React, { useMemo, useState } from 'react';
import { useJobsHub } from '../context/JobsHubContext';
import { JOBS_FEED_TABS, filterJobsByTab } from '../data/jobsBrowseData';
import JobApplyModal from '../components/JobApplyModal';
import JobDetailsDrawer from '../components/JobDetailsDrawer';
import JobsBrowseJobCard from './JobsBrowseJobCard';
import JobsBrowseLoadMore from './JobsBrowseLoadMore';

export default function JobsBrowseJobBoard() {
  const {
    savedJobIds,
    toggleSavedJob,
    jobListings,
    listingsLoading,
    submitApplication,
    quickApplyToJob,
  } = useJobsHub();
  const [activeTab, setActiveTab] = useState(JOBS_FEED_TABS[0]);
  const [visibleCount, setVisibleCount] = useState(10);
  const [applyJob, setApplyJob] = useState(null);
  const [detailJob, setDetailJob] = useState(null);

  const filtered = useMemo(
    () => filterJobsByTab(jobListings, activeTab),
    [jobListings, activeTab],
  );
  const visible = filtered.slice(0, visibleCount);

  return (
    <>
      <div className="gigs-card gigs-jobs-board jobs-job-board">
        <div className="jobs-feed-tabs" role="tablist" aria-label="Job feed">
          {JOBS_FEED_TABS.map((tab) => (
            <button
              key={tab}
              type="button"
              role="tab"
              aria-selected={activeTab === tab}
              className={`jobs-feed-tab${activeTab === tab ? ' is-active' : ''}`}
              onClick={() => {
                setActiveTab(tab);
                setVisibleCount(10);
              }}
            >
              {tab}
            </button>
          ))}
        </div>
        <div className="gigs-job-list jobs-job-list-grid">
          {listingsLoading ? (
            <p className="jobs-feed-end">Loading jobs…</p>
          ) : visible.length ? (
            visible.map((job) => (
              <JobsBrowseJobCard
                key={job.id}
                job={job}
                saved={savedJobIds.has(job.id)}
                isSelected={detailJob?.id === job.id}
                onSelect={setDetailJob}
                onToggleSave={toggleSavedJob}
                onApply={async (row) => {
                  try {
                    await quickApplyToJob(row);
                  } catch {
                    setDetailJob(row);
                  }
                }}
              />
            ))
          ) : (
            <p className="jobs-feed-end">No jobs match your filters. Try adjusting search criteria.</p>
          )}
        </div>
        {!listingsLoading && visibleCount < filtered.length ? (
          <JobsBrowseLoadMore onClick={() => setVisibleCount((n) => n + 10)} />
        ) : null}
      </div>
      <JobDetailsDrawer
        job={detailJob}
        open={Boolean(detailJob)}
        saved={detailJob ? savedJobIds.has(detailJob.id) : false}
        onClose={() => setDetailJob(null)}
        onApply={quickApplyToJob}
        onToggleSave={toggleSavedJob}
        onApplyWithResume={(job) => {
          setDetailJob(null);
          setApplyJob(job);
        }}
      />
      <JobApplyModal
        job={applyJob}
        open={Boolean(applyJob)}
        onClose={() => setApplyJob(null)}
        onSubmit={submitApplication}
      />
    </>
  );
}
