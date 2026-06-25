import React from 'react';
import { FiArrowLeft } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import MemberHubCompanySwitch from '../../../components/mobile/MemberHubCompanySwitch';

export default function JobAlertMobileHeader({ title, subtitle }) {
  const navigate = useNavigate();

  return (
    <header className="ja-mobile-header" aria-label={title}>
      <button
        type="button"
        className="ja-mobile-header__back"
        onClick={() => navigate(-1)}
        aria-label="Go back"
      >
        <FiArrowLeft size={18} aria-hidden />
      </button>
      <div className="ja-mobile-header__copy">
        <h1 className="ja-mobile-header__title">{title}</h1>
        {subtitle ? <p className="ja-mobile-header__sub">{subtitle}</p> : null}
      </div>
      <MemberHubCompanySwitch />
    </header>
  );
}
