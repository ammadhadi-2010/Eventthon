import React, { useMemo } from 'react';
import { useCompanyPortal } from './hooks/useCompanyPortal';
import CompanyHero from './components/CompanyHero';
import CompanyOpenJobs from './components/CompanyOpenJobs';
import CompanyAppsInsights from './components/CompanyAppsInsights';
import CompanyRecentApplicants from './components/CompanyRecentApplicants';
import CompanyAnalytics from './components/CompanyAnalytics';
import CompanyRegistrationPanel from './components/CompanyRegistrationPanel';
import { mergeCompanyDashboardData } from './utils/mergeDashboardPayload';
import './styles/company-dashboard-premium.css';
import './styles/company-dashboard-mobile.css';

export default function CompanyDashboard() {
  const { data, loading, error, reload } = useCompanyPortal();
  const viewData = useMemo(() => mergeCompanyDashboardData(data), [data]);

  if (loading && !viewData) {
    return <p className="cp-page-loading">Loading company dashboard…</p>;
  }

  if ((error || !viewData) && !data) {
    return (
      <div className="cp-page-error cp-glass">
        <h2>Company profile not linked</h2>
        <p>
          {error ||
            'Ask an administrator to set owner_user_id on your company record or company_id on your user profile.'}
        </p>
        <button type="button" className="cp-retry-btn" onClick={reload}>
          Retry
        </button>
      </div>
    );
  }

  const status = String(viewData.company?.status || 'draft').toLowerCase();
  const needsRegistration = status === 'draft';
  const isPending = status === 'pending';
  const lockMessage =
    viewData.company?.reviewMessage ||
    'Your company profile is under review. Features unlock after admin verification.';

  return (
    <div className="cp-dashboard">
      {needsRegistration ? (
        <CompanyRegistrationPanel company={viewData.company} onSubmitted={reload} />
      ) : null}
      {isPending ? (
        <div className="cp-gate-overlay" role="status">
          <p>{lockMessage}</p>
        </div>
      ) : null}
      <div className={isPending ? 'cp-locked-content' : ''}>
        <CompanyHero company={viewData.company} />
        <CompanyOpenJobs jobs={viewData.openJobs} />
        <CompanyAppsInsights
          metrics={viewData.applicationMetrics}
          skills={viewData.topSkills}
        />
        <div className="cp-bottom-row">
          <CompanyRecentApplicants rows={viewData.recentApplications} />
          <CompanyAnalytics analytics={viewData.analytics} />
        </div>
      </div>
    </div>
  );
}
