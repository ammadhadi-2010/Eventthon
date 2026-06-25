import React from 'react';
import { EVENTTHON_E_MARK_URL, EVENTTHON_LOGO_ALT } from '../../constants/brandAssets';
import './EventThonLogo.css';

const VARIANT_CLASS = {
  sidebar: 'et-logo--sidebar',
  header: 'et-logo--header',
  auth: 'et-logo--auth',
  authBrand: 'et-logo--auth-brand',
  footer: 'et-logo--footer',
  feed: 'et-logo--feed',
};

export default function EventThonLogo({ variant = 'sidebar', className = '', style, title }) {
  const sizeClass = VARIANT_CLASS[variant] || VARIANT_CLASS.sidebar;

  return (
    <span
      className={`et-logo-wrap ${sizeClass}${className ? ` ${className}` : ''}`}
      style={style}
      title={title || EVENTTHON_LOGO_ALT}
    >
      <img
        src={EVENTTHON_E_MARK_URL}
        alt=""
        className="et-logo-img"
        decoding="async"
        aria-hidden
      />
    </span>
  );
}
