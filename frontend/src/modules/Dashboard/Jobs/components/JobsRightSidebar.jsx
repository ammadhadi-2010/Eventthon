import React, { useMemo } from 'react';
import { FiArrowUpRight } from 'react-icons/fi';
import JobApplicationFlow from '../../../Public/components/showroom/job/JobApplicationFlow';
import { useJobsHub } from '../context/JobsHubContext';
import { useJobsSidebarAnalytics } from '../hooks/useJobsSidebarAnalytics';
import JobsSidebarInsights from './JobsSidebarInsights';
import JobsSidebarActivity from './JobsSidebarActivity';

const JobsRightSidebar = ({ activeSection }) => {
  const { selectedApplication, applications } = useJobsHub();
  const { market, activity, loading } = useJobsSidebarAnalytics(applications.length);

  const flowApplication = useMemo(() => {
    if (selectedApplication?.flowSteps?.length) return selectedApplication;
    return applications.find((row) => row.flowSteps?.length) || null;
  }, [applications, selectedApplication]);

  return (
    <aside className="gigs-right-stack">
      <JobsSidebarInsights market={market} loading={loading} />

      {flowApplication ? (
        <div className="gigs-card gigs-side-card jh-side-flow">
          <h3>Application Flow</h3>
          <p className="jh-side-flow__meta">
            {flowApplication.role} · {flowApplication.company}
          </p>
          <JobApplicationFlow steps={flowApplication.flowSteps} />
        </div>
      ) : activeSection === 'applications' ? (
        <JobsSidebarActivity activity={activity} loading={loading} />
      ) : (
        <JobsSidebarActivity activity={activity} loading={loading} />
      )}

      <div className="gigs-card gigs-side-card gigs-upgrade-card">
        <h3>Stand Out From The Crowd</h3>
        <p>Get your profile noticed by top companies and recruiters.</p>
        <button type="button" className="gigs-upgrade-btn">
          Upgrade Profile
          <FiArrowUpRight size={14} />
        </button>
      </div>
    </aside>
  );
};

export default JobsRightSidebar;
