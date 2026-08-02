import React from 'react';
import { NavLink } from 'react-router-dom';
import { FiAward } from 'react-icons/fi';
import { COMPANY_HUB_MENU_SECTIONS } from '../companyPortalMenu';
import { useCompanyPortal } from '../hooks/useCompanyPortal';

export default function CompanyPortalSidebar() {
  const { data } = useCompanyPortal();
  const planName = data?.company?.planName || 'Business';
  const planRenewal = data?.company?.planRenewal;

  return (
    <aside className="cp-sidebar cp-glass">
      <div className="cp-sidebar__brand">
        <span className="cp-sidebar__brand-mark" aria-hidden>
          E
        </span>
        <div>
          <strong>EVENTTHON</strong>
          <span>Company Hub</span>
        </div>
      </div>

      <nav className="cp-nav" aria-label="Company hub">
        {COMPANY_HUB_MENU_SECTIONS.map((section) => (
          <div key={section.id} className="cp-nav__section">
            <p className="cp-nav__section-label">{section.label}</p>
            {section.items.map((item) => {
              const Icon = item.icon;
              const showVerified =
                item.verifiedBadge && Boolean(data?.company?.isVerified);
              return (
                <NavLink
                  key={item.id}
                  to={item.to}
                  end={Boolean(item.end)}
                  className={({ isActive }) =>
                    `cp-nav__item${isActive ? ' cp-nav__item--active' : ''}`
                  }
                >
                  <span className="cp-nav__item-main">
                    {Icon ? <Icon size={15} aria-hidden /> : null}
                    <span>{item.label}</span>
                  </span>
                  {showVerified ? <em className="cp-nav__verified">Verified</em> : null}
                  {item.comingSoon ? <em className="cp-nav__soon">Soon</em> : null}
                  {item.badge ? <em className="cp-nav__badge">{item.badge}</em> : null}
                </NavLink>
              );
            })}
          </div>
        ))}
      </nav>

      <div className="cp-plan-card">
        <div className="cp-plan-card__head">
          <FiAward size={16} aria-hidden />
          <span>Current Plan</span>
        </div>
        <strong>{planName}</strong>
        <p>{planRenewal ? `Renews ${planRenewal}` : 'Upgrade for advanced hiring tools.'}</p>
        <button type="button" className="cp-plan-card__btn">
          Upgrade Plan
        </button>
      </div>
    </aside>
  );
}
