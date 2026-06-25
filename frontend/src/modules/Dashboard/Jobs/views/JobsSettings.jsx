import React, { useState } from 'react';
import JobsHubHeader from '../components/JobsHubHeader';
import JobsMobileSubViewShell from '../components/JobsMobileSubViewShell';

export default function JobsSettings() {
  const [emailAlerts, setEmailAlerts] = useState(true);
  const [remoteOnly, setRemoteOnly] = useState(false);
  const [profileVisible, setProfileVisible] = useState(true);

  return (
    <JobsMobileSubViewShell title="Settings">
      <section className="jh-view">
        <JobsHubHeader
          title="Settings"
          subtitle="Control your jobs profile, preferences, and notifications."
        />
        <div className="gigs-card jh-settings-card">
        <h3>Notifications</h3>
        <label className="jh-settings-row">
          <span>Email me when new jobs match my alerts</span>
          <input
            type="checkbox"
            checked={emailAlerts}
            onChange={(e) => setEmailAlerts(e.target.checked)}
          />
        </label>
      </div>
      <div className="gigs-card jh-settings-card">
        <h3>Job Preferences</h3>
        <label className="jh-settings-row">
          <span>Show remote jobs only</span>
          <input
            type="checkbox"
            checked={remoteOnly}
            onChange={(e) => setRemoteOnly(e.target.checked)}
          />
        </label>
      </div>
      <div className="gigs-card jh-settings-card">
        <h3>Profile Visibility</h3>
        <label className="jh-settings-row">
          <span>Allow recruiters to view my profile</span>
          <input
            type="checkbox"
            checked={profileVisible}
            onChange={(e) => setProfileVisible(e.target.checked)}
          />
        </label>
        </div>
      </section>
    </JobsMobileSubViewShell>
  );
}
