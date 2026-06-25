import React from 'react';
import { Link } from 'react-router-dom';

export default function ShowroomPrimaryCta({
  isGuest,
  guestLabel = 'Sign in to Continue',
  signedLabel = 'Continue',
  signedTo = '/auth/login',
  className = '',
}) {
  const cls = `ps-btn ps-btn--primary ps-btn--wide ps-mp-cta ${className}`.trim();
  if (isGuest) {
    return (
      <Link to="/auth/login" className={cls}>
        {guestLabel}
      </Link>
    );
  }
  return (
    <Link to={signedTo} className={cls}>
      {signedLabel}
    </Link>
  );
}
