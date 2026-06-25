import React, { useMemo, useState } from 'react';
import ApplicationMobileCard from '../components/ApplicationMobileCard';
import ApplicationRow from '../components/ApplicationRow';
import JobsHubHeader from '../components/JobsHubHeader';
import JobsMobileSubViewShell from '../components/JobsMobileSubViewShell';
import JobsStatusTabs from '../components/JobsStatusTabs';
import { useJobsHub } from '../context/JobsHubContext';
import { APPLICATION_STATUS_KEYS, tabCounts } from '../utils/applicationStatus';

export default function MyApplications() {
  const { applications, setSelectedApplicationId, loading } = useJobsHub();
  const [activeTab, setActiveTab] = useState(APPLICATION_STATUS_KEYS.ALL);

  const tabs = useMemo(() => tabCounts(applications), [applications]);

  const filtered = useMemo(() => {
    if (activeTab === APPLICATION_STATUS_KEYS.ALL) return applications;
    return applications.filter((item) => item.status === activeTab);
  }, [applications, activeTab]);

  return (
    <JobsMobileSubViewShell title="My Applications">
      <section className="jh-view jh-view--applications">
        <JobsHubHeader
          title="My Applications"
          subtitle="Track and manage your job applications."
        />
        <JobsStatusTabs tabs={tabs} activeId={activeTab} onChange={setActiveTab} />
        <div className="jh-app-list jh-app-mobile-stack">
          {loading ? (
            <div className="gigs-card jh-empty-card">
              <p>Loading applications…</p>
            </div>
          ) : filtered.length ? (
            filtered.map((application) => (
              <React.Fragment key={application.id}>
                <ApplicationRow
                  application={application}
                  onOpen={(row) => setSelectedApplicationId(row.id)}
                />
                <ApplicationMobileCard
                  application={application}
                  onOpen={(row) => setSelectedApplicationId(row.id)}
                />
              </React.Fragment>
            ))
          ) : (
            <div className="gigs-card jh-empty-card">
              <p>No applications in this stage yet.</p>
            </div>
          )}
        </div>
      </section>
    </JobsMobileSubViewShell>
  );
}
