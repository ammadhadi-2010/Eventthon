import React from 'react';
import { Link } from 'react-router-dom';

const AVATARS = ['SK', 'JC', 'ER', 'DP', 'AM'];

export default function JobBoardCtaBanner() {
  return (
    <section className="ps-jb-cta-banner">
      <div className="ps-jb-cta-banner__copy">
        <div className="ps-jb-avatar-stack" aria-hidden>
          {AVATARS.map((initials) => (
            <span key={initials}>{initials}</span>
          ))}
        </div>
        <div>
          <h2>Get hired by top global companies</h2>
          <p>Build your EventThon profile and apply to verified remote roles worldwide.</p>
        </div>
      </div>
      <Link to="/auth/register" className="ps-btn ps-btn--primary">
        Create Profile Now
      </Link>
    </section>
  );
}
