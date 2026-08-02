import React from 'react';
import {
  fetchAdminOpportunitySettings,
  saveAdminOpportunitySettings,
} from '../../../../services/adminJobHubSettingsService';
import AdminHubSettingsForm from './AdminHubSettingsForm';
import {
  DEFAULT_OPPORTUNITY_SETTINGS,
  OPPORTUNITY_SETTING_ROWS,
} from './opportunitySettingsData';

export default function OpportunitySettingsPage() {
  return (
    <AdminHubSettingsForm
      title="Opportunity Settings"
      rows={OPPORTUNITY_SETTING_ROWS}
      defaults={DEFAULT_OPPORTUNITY_SETTINGS}
      loadSettings={fetchAdminOpportunitySettings}
      saveSettings={saveAdminOpportunitySettings}
    />
  );
}
