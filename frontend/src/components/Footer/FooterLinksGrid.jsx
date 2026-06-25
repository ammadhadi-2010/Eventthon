import React from 'react';
import { Link } from 'react-router-dom';
import EventThonLogo from '../brand/EventThonLogo';
import {
  FaDiscord,
  FaFacebookF,
  FaLinkedinIn,
  FaXTwitter,
  FaYoutube,
} from 'react-icons/fa6';
import { FiCheck, FiSend } from 'react-icons/fi';
import {
  FOOTER_DESCRIPTION,
  FOOTER_NAV,
  FOOTER_NEWSLETTER_CHECKS,
  FOOTER_NEWSLETTER_ICON,
  FOOTER_SOCIAL,
  FOOTER_TAGLINE,
} from './footerData';

const SOCIAL_ICONS = {
  facebook: FaFacebookF,
  x: FaXTwitter,
  linkedin: FaLinkedinIn,
  discord: FaDiscord,
  youtube: FaYoutube,
};

const SCROLL_NAV_IDS = new Set(['resources', 'company']);

function scrollPageToTop() {
  window.scrollTo({ top: 0, behavior: 'smooth' });
  const root = document.querySelector('main.et-main-scroll');
  if (root) root.scrollTo({ top: 0, behavior: 'smooth' });
}

function SocialLinks() {
  return (
    <div className="et-footer__social">
      {FOOTER_SOCIAL.map((item) => {
        const Icon = SOCIAL_ICONS[item.id];
        return (
          <a
            key={item.id}
            href={item.href}
            className="et-footer__social-btn"
            aria-label={item.label}
            target="_blank"
            rel="noreferrer"
          >
            {Icon ? <Icon size={14} aria-hidden /> : null}
          </a>
        );
      })}
    </div>
  );
}

function NavColumn({ col, onRankMatrixOpen }) {
  const ColIcon = col.icon;
  const scrollOnClick = SCROLL_NAV_IDS.has(col.id);
  return (
    <div className="et-footer__nav-col">
      <h3 className="et-footer__nav-title">
        {ColIcon ? <ColIcon size={14} aria-hidden /> : null}
        {col.title}
      </h3>
      <ul className="et-footer__nav-list">
        {col.links.map((link) => (
          <li key={link.label}>
            {link.action === 'rank-matrix' ? (
              <button
                type="button"
                className="et-footer__nav-link et-footer__nav-link--button"
                onClick={onRankMatrixOpen}
              >
                {link.label}
              </button>
            ) : (
              <Link
                to={link.to}
                className="et-footer__nav-link"
                onClick={scrollOnClick ? scrollPageToTop : undefined}
              >
                {link.label}
              </Link>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}

function BrandColumn() {
  return (
    <div className="et-footer__brand-col">
      <div className="et-footer__brand-head">
        <EventThonLogo variant="footer" />
        <h2 className="et-footer__brand-name">EventThon</h2>
      </div>
      <p className="et-footer__tagline">{FOOTER_TAGLINE}</p>
      <p className="et-footer__desc">{FOOTER_DESCRIPTION}</p>
      <SocialLinks />
    </div>
  );
}

function NewsletterCard() {
  const MailIcon = FOOTER_NEWSLETTER_ICON;
  const onSubmit = (e) => {
    e.preventDefault();
    const email = e.currentTarget.email?.value?.trim();
    if (!email) return;
    window.alert('Thanks for subscribing! We will send updates to ' + email);
    e.currentTarget.reset();
  };

  return (
    <div className="et-footer__newsletter">
      <h3 className="et-footer__newsletter-title">
        <MailIcon size={16} aria-hidden />
        Stay in the Loop
      </h3>
      <p className="et-footer__newsletter-desc">
        Subscribe to our newsletter and get the latest updates, tips and offers.
      </p>
      <form className="et-footer__newsletter-form" onSubmit={onSubmit}>
        <input type="email" name="email" placeholder="Enter your email" required aria-label="Email address" />
        <button type="submit" className="et-footer__newsletter-submit" aria-label="Subscribe">
          <FiSend size={16} aria-hidden />
        </button>
      </form>
      <ul className="et-footer__checks">
        {FOOTER_NEWSLETTER_CHECKS.map((text) => (
          <li key={text}>
            <FiCheck size={14} aria-hidden />
            {text}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default function FooterLinksGrid({ onRankMatrixOpen }) {
  return (
    <div className="et-footer__links-grid">
      <BrandColumn />
      {FOOTER_NAV.map((col) => (
        <NavColumn key={col.id} col={col} onRankMatrixOpen={onRankMatrixOpen} />
      ))}
      <NewsletterCard />
    </div>
  );
}
