import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiBriefcase, FiHome } from 'react-icons/fi';
import { useCompanyHubAccess } from './useCompanyHubAccess';
import { prefetchCompanyPortalDashboard } from '../../../components/views/company/services/prefetchCompanyPortalDashboard';

export default function CompanyHubSwitch({ user, className = '', compact = false }) {
  const navigate = useNavigate();
  const { onCompanyHub, showSwitchToCompany, companyDashboardPath } = useCompanyHubAccess(user);
  const extra = [compact ? 'et-hub-switch--compact' : '', className].filter(Boolean).join(' ');

  useEffect(() => {
    if (showSwitchToCompany) prefetchCompanyPortalDashboard();
  }, [showSwitchToCompany]);

  if (onCompanyHub) {
    return (
      <button
        type="button"
        className={`et-hub-switch et-hub-switch--member${extra ? ` ${extra}` : ''}`}
        onClick={() => navigate('/dashboard')}
        title="Return to member hub"
      >
        <FiHome size={compact ? 13 : 14} aria-hidden />
        <span className="et-hub-switch__text">{compact ? 'Member Hub' : 'Member Hub'}</span>
      </button>
    );
  }

  if (!showSwitchToCompany) return null;

  return (
    <button
      type="button"
      className={`et-hub-switch et-hub-switch--company${extra ? ` ${extra}` : ''}`}
      onPointerDown={() => prefetchCompanyPortalDashboard()}
      onClick={() => navigate(companyDashboardPath)}
      title="Open company employer dashboard"
    >
      <FiBriefcase size={compact ? 13 : 14} aria-hidden />
      <span className="et-hub-switch__text">{compact ? 'Company' : 'Switch to Company'}</span>
    </button>
  );
}

