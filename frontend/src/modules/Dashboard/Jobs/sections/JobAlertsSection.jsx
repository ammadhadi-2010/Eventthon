import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { FiPlus, FiZap } from 'react-icons/fi';
import JobAlertRow from '../components/JobAlertRow';
import { JobAlertMatchesList } from '../components/JobAlertMatchCard';
import JobsMobileSubViewShell from '../components/JobsMobileSubViewShell';
import { useJobsHub } from '../context/JobsHubContext';
import { getJobCardShade } from '../utils/jobCardShades';
import '../createJobAlert/create-job-alert.css';

export default function JobAlertsSection() {
  const navigate = useNavigate();
  const location = useLocation();
  const { alerts, alertMatches, toggleAlertEmail, quickApplyToJob, platformSettings } = useJobsHub();
  const opportunityAlertsEnabled = platformSettings?.opportunities?.opportunityAlertsEnabled !== false;
  const [notice, setNotice] = useState('');
  const [applyNotice, setApplyNotice] = useState('');

  useEffect(() => {
    if (location.state?.alertCreated) {
      setNotice('Your job alert was created successfully.');
      navigate(location.pathname, { replace: true, state: {} });
    } else if (location.state?.opportunityAlertCreated) {
      setNotice('Your opportunity alert was created successfully.');
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [location, navigate]);

  const handleApply = async (match) => {
    try {
      const created = await quickApplyToJob(match);
      if (created) {
        setApplyNotice(
          match.listingKind === 'opportunity'
            ? 'Joined — track it under My Applications.'
            : 'Applied — track it under My Applications.',
        );
        window.setTimeout(() => setApplyNotice(''), 4200);
        return;
      }
      setApplyNotice('Could not submit. Sign in and try again.');
    } catch (err) {
      if (err?.code === 'AUTH_REQUIRED' || err?.response?.status === 401) {
        setApplyNotice('Sign in to Apply or Join.');
      } else if (err?.response?.status === 409) {
        setApplyNotice('You already applied to this listing.');
      } else {
        setApplyNotice(err?.message || 'Could not submit right now.');
      }
      window.setTimeout(() => setApplyNotice(''), 4200);
    }
  };

  return (
    <JobsMobileSubViewShell title="Job Alerts">
      <section className="jobs-center-feed ja-alerts-hub">
        {notice ? <p className="ja-toast ja-toast--inline" role="status">{notice}</p> : null}
        {applyNotice ? <p className="ja-toast ja-toast--inline" role="status">{applyNotice}</p> : null}
        <div className="gigs-card ja-alerts-panel">
          <header className="ja-alerts-panel__header">
            <div className="ja-alerts-panel__copy">
              <h2>Job Alerts</h2>
              <p>
                Get instant notifications when matching jobs or opportunities are posted — then Apply or Join here.
              </p>
            </div>
            <div className="ja-alerts-panel__actions">
              <button
                type="button"
                className="jobs-alert-btn ja-alerts-panel__create"
                onClick={() => navigate('/jobs/alerts/new')}
              >
                <FiPlus size={14} aria-hidden /> Create Alert
              </button>
              {opportunityAlertsEnabled ? (
                <button
                  type="button"
                  className="jobs-alert-btn jobs-alert-btn--opportunity ja-alerts-panel__create"
                  onClick={() => navigate('/jobs/alerts/opportunity/new')}
                >
                  <FiZap size={14} aria-hidden /> Opportunity Alert
                </button>
              ) : null}
            </div>
          </header>

          <JobAlertMatchesList matches={alertMatches} onApply={handleApply} />

          <div className="ja-alerts-list jh-mobile-card-list">
            <p className="ja-alerts-list__label">Your alert criteria</p>
            {alerts.length ? (
              alerts.map((alert, index) => (
                <JobAlertRow
                  key={alert.id}
                  alert={alert}
                  shade={getJobCardShade(index)}
                  onToggleEmail={toggleAlertEmail}
                />
              ))
            ) : (
              <div className="gigs-card jh-empty-card">
                <p>No alerts yet. Create a Job or Opportunity alert to get started.</p>
              </div>
            )}
          </div>
        </div>
      </section>
    </JobsMobileSubViewShell>
  );
}
