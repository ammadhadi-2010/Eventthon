import React from 'react';
import { Link, NavLink } from 'react-router-dom';
import {
  FiAlertCircle, FiBriefcase, FiCreditCard, FiFileText, FiFlag, FiFolder,
  FiHeart, FiHelpCircle, FiHome, FiLock, FiSettings, FiShield, FiTarget,
  FiUser, FiUsers, FiZap,
} from 'react-icons/fi';
import { FOOTER_NAV } from '../../../components/Footer/footerData';

const CAT_ICONS = {
  zap: FiZap, user: FiUser, users: FiUsers, briefcase: FiBriefcase, target: FiTarget,
  folder: FiFolder, building: FiHome, wallet: FiCreditCard, card: FiCreditCard,
  shield: FiShield, lock: FiLock, flag: FiFlag, heart: FiHeart, settings: FiSettings,
  file: FiFileText, bug: FiAlertCircle, bulb: FiZap,
};

function CatIcon({ name }) {
  const Icon = CAT_ICONS[name] || FiHelpCircle;
  return <Icon size={14} />;
}

export default function HelpCenterLeftNav({
  categories = [],
  activeId = '',
  searching = false,
  onSelect,
}) {
  const resourceLinks = (FOOTER_NAV.find((c) => c.id === 'resources')?.links || [])
    .filter((l) => l.to)
    .slice(0, 6);

  return (
    <nav className="hc-left" aria-label="Help Center navigation">
      <div className="hc-left__block">
        <p className="hc-left__label">Categories</p>
        <ul className="hc-left__list">
          {categories.map((cat) => (
            <li key={cat.id}>
              <button
                type="button"
                className={activeId === cat.id && !searching ? 'is-active' : ''}
                onClick={() => onSelect?.(cat)}
              >
                <span className="hc-left__ico" aria-hidden><CatIcon name={cat.icon} /></span>
                {cat.label}
              </button>
            </li>
          ))}
        </ul>
      </div>

      {resourceLinks.length ? (
        <div className="hc-left__block">
          <p className="hc-left__label">Resources</p>
          <ul className="hc-left__list hc-left__list--links">
            {resourceLinks.map((link) => (
              <li key={`${link.to}-${link.label}`}>
                <NavLink to={link.to} className={({ isActive }) => (isActive ? 'is-active' : '')}>
                  {link.label}
                </NavLink>
              </li>
            ))}
            {!resourceLinks.some((l) => l.to === '/donate') ? (
              <li><Link to="/donate">Donate</Link></li>
            ) : null}
          </ul>
        </div>
      ) : null}
    </nav>
  );
}
