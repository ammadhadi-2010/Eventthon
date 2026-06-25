import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiBriefcase, FiLogOut, FiSettings, FiUser } from 'react-icons/fi';
import { resolvePortalImageurl } from '../../../components/views/company/utils/portalImage';

export default function CompanyNavMenu({ company, user, onClose }) {
  const navigate = useNavigate();
  const [logoSrc, setLogoSrc] = useState(() =>
    resolvePortalImageurl(company?.imageurl, company?.name),
  );

  const go = (path) => {
    onClose();
    navigate(path);
  };

  const signOut = () => {
    onClose();
    localStorage.clear();
    window.location.href = '/auth/login';
  };

  const companyName = company?.name || 'Company';
  const status = String(company?.status || 'draft');

  return (
    <div className="cn-menu" role="menu" onClick={(e) => e.stopPropagation()}>
      <div className="cn-menu__header">
        <img
          src={logoSrc}
          alt=""
          className="cn-menu__logo"
          onError={() => setLogoSrc(resolvePortalImageurl('', companyName))}
        />
        <div>
          <h4 className="cn-menu__name">{companyName}</h4>
          <p className="cn-menu__meta">Status: {status}</p>
          {user?.email ? <p className="cn-menu__meta">{user.email}</p> : null}
        </div>
      </div>
      <button type="button" className="cn-menu__item" onClick={() => go('/company/dashboard/settings')}>
        <FiSettings size={16} aria-hidden /> Company settings
      </button>
      <button type="button" className="cn-menu__item" onClick={() => go('/company/dashboard/profile')}>
        <FiUser size={16} aria-hidden /> Public profile
      </button>
      <button type="button" className="cn-menu__item" onClick={() => go('/dashboard')}>
        <FiBriefcase size={16} aria-hidden /> Switch to member hub
      </button>
      <hr className="cn-menu__divider" />
      <button type="button" className="cn-menu__item cn-menu__item--danger" onClick={signOut}>
        <FiLogOut size={16} aria-hidden /> Sign out
      </button>
    </div>
  );
}
