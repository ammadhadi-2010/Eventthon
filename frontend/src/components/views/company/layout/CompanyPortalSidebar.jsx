import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { ChevronDown } from 'lucide-react';
import { FiAward } from 'react-icons/fi';
import { COMPANY_HUB_MENU } from '../companyPortalMenu';

export default function CompanyPortalSidebar() {
  const [jobsOpen, setJobsOpen] = useState(true);

  return (
    <aside className="cp-sidebar cp-glass">
      <p className="cp-sidebar__label">COMPANY PANEL</p>
      <nav className="cp-nav">
        {COMPANY_HUB_MENU.map((item) => {
          if (item.children) {
            return (
              <div key={item.id} className="cp-nav__group">
                <button
                  type="button"
                  className="cp-nav__item cp-nav__item--parent"
                  onClick={() => setJobsOpen((o) => !o)}
                >
                  <span>{item.label}</span>
                  <ChevronDown size={14} className={jobsOpen ? 'cp-nav__chev--open' : ''} />
                </button>
                {jobsOpen ? (
                  <div className="cp-nav__children">
                    {item.children.map((child) => (
                      <NavLink
                        key={child.id}
                        to={child.to}
                        className={({ isActive }) =>
                          `cp-nav__child${isActive ? ' cp-nav__child--active' : ''}`
                        }
                      >
                        {child.label}
                      </NavLink>
                    ))}
                  </div>
                ) : null}
              </div>
            );
          }
          return (
            <NavLink
              key={item.id}
              to={item.to}
              end={item.to === '/company/dashboard'}
              className={({ isActive }) => `cp-nav__item${isActive ? ' cp-nav__item--active' : ''}`}
            >
              <span>{item.label}</span>
              {item.comingSoon ? <em className="cp-nav__soon">Soon</em> : null}
              {item.badge ? <em className="cp-nav__badge">{item.badge}</em> : null}
            </NavLink>
          );
        })}
      </nav>
      <div className="cp-premium">
        <div className="cp-premium__icon" aria-hidden>
          <FiAward size={18} />
        </div>
        <h4>Get More with Premium</h4>
        <p>Unlock advanced hiring tools and analytics.</p>
        <button type="button" className="cp-premium__btn">
          Upgrade Now
        </button>
      </div>
    </aside>
  );
}
