import React from 'react';
import { Link } from 'react-router-dom';
import { FiAlertCircle, FiBookOpen, FiHeadphones, FiHelpCircle, FiShield } from 'react-icons/fi';
import { SUPPORT_MAILTO, TIP_RESOURCES } from '../../data/gigsRightSidebarData';

const TIP_ICONS = {
  'tip-hire': FiHelpCircle,
  'tip-req': FiBookOpen,
  'tip-price': FiAlertCircle,
  'tip-dispute': FiShield,
};

export default function GigsTipsHelpSection({ onOpenOrders }) {
  return (
    <>
      <div className="gigs-card gigs-right-list-card">
        <div className="gigs-right-section-head">
          <h3>Tips &amp; Resources</h3>
        </div>
        <div className="gigs-right-tips-list">
          {TIP_RESOURCES.map((item) => {
            const Icon = TIP_ICONS[item.id] || FiHelpCircle;
            if (item.id === 'tip-dispute') {
              return (
                <button
                  key={item.id}
                  type="button"
                  className="gigs-right-tip-row is-link"
                  onClick={onOpenOrders}
                >
                  <Icon size={13} aria-hidden />
                  <div>
                    <h4>{item.title}</h4>
                    <p>{item.sub}</p>
                  </div>
                </button>
              );
            }
            return (
              <Link key={item.id} to={item.path} className="gigs-right-tip-row is-link">
                <Icon size={13} aria-hidden />
                <div>
                  <h4>{item.title}</h4>
                  <p>{item.sub}</p>
                </div>
              </Link>
            );
          })}
        </div>
      </div>

      <div className="gigs-card gigs-right-help-card">
        <h3>Need Help?</h3>
        <p>Our support team is here to assist you.</p>
        <a href={SUPPORT_MAILTO} className="gigs-right-help-link">
          <FiHeadphones size={13} aria-hidden /> Contact Support
        </a>
      </div>
    </>
  );
}
