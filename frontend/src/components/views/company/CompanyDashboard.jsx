import React, { useMemo } from 'react';
import { useCompanyPortal } from './hooks/useCompanyPortal';
import CompanyHero from './components/CompanyHero';
import CompanyHeroStatsStrip from './components/CompanyHeroStatsStrip';
import CompanyTalentPipeline from './components/CompanyTalentPipeline';
import CompanyOpenJobs from './components/CompanyOpenJobs';
import CompanyAppsInsights from './components/CompanyAppsInsights';
import CompanyRecentApplicants from './components/CompanyRecentApplicants';
import CompanyAnalytics from './components/CompanyAnalytics';
import CompanyTopSkills from './components/CompanyTopSkills';
import CompanyHubRightRail from './components/CompanyHubRightRail';
import CompanyRegistrationPanel from './components/CompanyRegistrationPanel';
import { mergeCompanyDashboardData } from './utils/mergeDashboardPayload';
import { readCompanyWorkspaceCache } from './utils/companyWorkspaceCache';
import './styles/company-dashboard-premium.css';
import './styles/company-dashboard-mobile.css';
import './styles/company-kpi.css';
import './styles/company-pipeline.css';
import './styles/company-recent-jobs.css';
import './styles/company-recent-apps.css';
import './styles/company-right-rail.css';
import './styles/company-hub-dashboard.css';
import './styles/company-jobs-pages.css';

export default function CompanyDashboard() {
  const { data, loading, error, reload } = useCompanyPortal();
  const cached = useMemo(() => readCompanyWorkspaceCache(), []);
  // Prefer live API payload over stale session cache (pending banners linger otherwise).
  const viewData = useMemo(
    () => mergeCompanyDashboardData(data || (!loading ? cached : null) || cached),
    [data, cached, loading],
  );

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
  const isVerified = Boolean(viewData.company?.isVerified) || status === 'active' || status === 'verified';
  const needsRegistration = status === 'draft' && !isVerified;
  // Banner only while waiting for admin — hide as soon as company is OK'd.
  const isPending = !isVerified && (status === 'pending' || status === 'submitted');
  const lockMessage =
    viewData.company?.reviewMessage ||
    'Your company profile is under review. Features unlock after admin verification.';

  return (
    <div className="cp-dashboard-layout">
      <div className="cp-dashboard cp-dashboard--stack">
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
          <CompanyHeroStatsStrip company={viewData.company} analytics={viewData.analytics} />
          <CompanyTalentPipeline pipeline={viewData.talentPipeline} onMoved={reload} />
          <CompanyOpenJobs jobs={viewData.openJobs} />
          <CompanyRecentApplicants rows={viewData.recentApplications} />
          <CompanyAppsInsights metrics={viewData.applicationMetrics} />
          <CompanyTopSkills skills={viewData.topSkills} />
          <CompanyAnalytics analytics={viewData.analytics} />
        </div>
      </div>
      <CompanyHubRightRail company={viewData.company} />
    </div>
  );
}
