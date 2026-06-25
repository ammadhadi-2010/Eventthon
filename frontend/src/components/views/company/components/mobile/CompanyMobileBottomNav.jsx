import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { COMPANY_MOBILE_NAV, isCompanyMobileNavActive } from './companyMobileNavConfig';

export default function CompanyMobileBottomNav({ isVisible = true }) {
  const navigate = useNavigate();
  const { pathname } = useLocation();

  return (
    <nav
      className={`cp-mobile-chrome cp-mobile-chrome--bottom cp-mobile-bottom-nav${
        isVisible ? '' : ' cp-mobile-chrome--hidden'
      }`}
      aria-label="Company mobile navigation"
    >
      {COMPANY_MOBILE_NAV.map(({ key, label, path, Icon }) => {
        const active = isCompanyMobileNavActive(pathname, path);
        return (
          <button
            key={key}
            type="button"
            data-nav={key}
            className={`cp-mobile-bottom-nav__item${active ? ' cp-mobile-bottom-nav__item--active' : ''}`}
            onClick={() => navigate(path)}
            aria-current={active ? 'page' : undefined}
          >
            <Icon size={18} aria-hidden />
            <span>{label}</span>
          </button>
        );
      })}
    </nav>
  );
}
