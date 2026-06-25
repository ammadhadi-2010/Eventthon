import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FiBriefcase, FiHome } from 'react-icons/fi';
import { useCompanyHubAccess } from './useCompanyHubAccess';
import { prefetchCompanyPortalDashboard } from '../../../components/views/company/services/prefetchCompanyPortalDashboard';

export default function CompanyHubSwitch() {
  const navigate = useNavigate();
  const { onCompanyHub, showSwitchToCompany, companyDashboardPath } = useCompanyHubAccess();

  if (onCompanyHub) {
    return (
      <button
        type="button"
        className="et-hub-switch et-hub-switch--member"
        onClick={() => navigate('/dashboard')}
        title="Return to member hub"
      >
        <FiHome size={14} aria-hidden />
        <span>Member Hub</span>
      </button>
    );
  }

  if (!showSwitchToCompany) return null;

  return (
    <button
      type="button"
      className="et-hub-switch et-hub-switch--company"
      onPointerDown={() => prefetchCompanyPortalDashboard()}
      onClick={() => navigate(companyDashboardPath)}
      title="Open company employer dashboard"
    >
      <FiBriefcase size={14} aria-hidden />
      <span>Switch to Company</span>
    </button>
  );
}

