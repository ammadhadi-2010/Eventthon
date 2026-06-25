import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FiBriefcase } from 'react-icons/fi';
import { useCompanyHubAccess } from '../../Navbar/useCompanyHubAccess';
import { prefetchCompanyPortalDashboard } from '../../../../components/views/company/services/prefetchCompanyPortalDashboard';
import '../../Navbar/hub-switch.css';
import './member-hub-company-switch.css';

/**
 * Mobile member-hub chip: returns employer users to the company dashboard.
 * Hidden on company workspace routes and for non-employer accounts.
 */
export default function MemberHubCompanySwitch({ variant = 'default', className = '' }) {
  const navigate = useNavigate();
  const { showSwitchToCompany, companyDashboardPath } = useCompanyHubAccess();

  if (!showSwitchToCompany) return null;

  const compact = variant === 'compact';
  const label = compact ? 'Company' : 'Switch to Company';

  return (
    <button
      type="button"
      className={[
        'et-hub-switch',
        'et-hub-switch--company',
        compact ? 'et-hub-switch--compact' : '',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      onPointerDown={() => prefetchCompanyPortalDashboard()}
      onClick={() => navigate(companyDashboardPath)}
      title="Open company employer dashboard"
      aria-label="Switch to company dashboard"
    >
      <FiBriefcase size={compact ? 13 : 14} aria-hidden />
      <span className="et-hub-switch__text">{label}</span>
    </button>
  );
}
