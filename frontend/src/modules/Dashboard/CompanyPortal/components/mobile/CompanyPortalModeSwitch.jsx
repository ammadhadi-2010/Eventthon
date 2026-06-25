import React from 'react';
import CompanyHubSwitch from '../../../Navbar/CompanyHubSwitch';
import '../../../Navbar/hub-switch.css';

export default function CompanyPortalModeSwitch({ compact = false }) {
  return (
    <div className={`cp-portal-mode-switch${compact ? ' cp-portal-mode-switch--compact' : ''}`}>
      <CompanyHubSwitch />
    </div>
  );
}
