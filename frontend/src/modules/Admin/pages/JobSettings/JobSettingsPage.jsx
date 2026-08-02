import React from 'react';
import {
  fetchAdminJobSettings,
  saveAdminJobSettings,
} from '../../../../services/adminJobHubSettingsService';
import AdminHubSettingsForm from './AdminHubSettingsForm';
import { DEFAULT_JOB_SETTINGS, JOB_SETTING_ROWS } from './jobSettingsData';

export default function JobSettingsPage() {
  return (
    <AdminHubSettingsForm
      title="Job Settings"
      rows={JOB_SETTING_ROWS}
      defaults={DEFAULT_JOB_SETTINGS}
      loadSettings={fetchAdminJobSettings}
      saveSettings={saveAdminJobSettings}
    />
  );
}
