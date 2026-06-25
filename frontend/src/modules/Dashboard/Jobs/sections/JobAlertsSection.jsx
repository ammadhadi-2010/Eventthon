import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { FiPlus } from 'react-icons/fi';
import JobAlertRow from '../components/JobAlertRow';
import JobsMobileSubViewShell from '../components/JobsMobileSubViewShell';
import { useJobsHub } from '../context/JobsHubContext';
import '../createJobAlert/create-job-alert.css';

export default function JobAlertsSection() {
  const navigate = useNavigate();
  const location = useLocation();
  const { alerts, toggleAlertEmail } = useJobsHub();
  const [notice, setNotice] = useState('');

  useEffect(() => {
    if (location.state?.alertCreated) {
      setNotice('Your job alert was created successfully.');
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [location, navigate]);

  return (
    <JobsMobileSubViewShell title="Job Alerts">
      <section className="jobs-center-feed ja-alerts-hub">
        {notice ? <p className="ja-toast ja-toast--inline" role="status">{notice}</p> : null}
        <div className="gigs-card ja-alerts-panel">
        <header className="ja-alerts-panel__header">
          <div className="ja-alerts-panel__copy">
            <h2>Job Alerts</h2>
            <p>Create and manage alerts for new job opportunities.</p>
          </div>
          <button
            type="button"
            className="jobs-alert-btn ja-alerts-panel__create"
            onClick={() => navigate('/jobs/alerts/new')}
          >
            <FiPlus size={14} aria-hidden /> Create Alert
          </button>
        </header>

        <div className="ja-alerts-list jh-mobile-card-list">
          {alerts.map((alert) => (
            <JobAlertRow key={alert.id} alert={alert} onToggleEmail={toggleAlertEmail} />
          ))}
        </div>
        </div>
      </section>
    </JobsMobileSubViewShell>
  );
}
