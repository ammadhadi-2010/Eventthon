import React from 'react';
import { FiArrowLeft } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';

export default function CompanyNotificationsPageHead() {
  const navigate = useNavigate();

  return (
    <header className="cp-notifications-page__head">
      <div className="cp-notifications-page__title-row">
        <button
          type="button"
          className="cp-notifications-page__back"
          onClick={() => navigate('/company/dashboard')}
          aria-label="Back to company dashboard"
        >
          <FiArrowLeft size={18} aria-hidden />
        </button>
        <div className="cp-notifications-page__title-copy">
          <h1>Company alerts</h1>
          <p>Employer notifications for jobs, applicants, and platform updates.</p>
        </div>
      </div>
    </header>
  );
}
