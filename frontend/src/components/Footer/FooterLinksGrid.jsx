import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import EventThonLogo from '../brand/EventThonLogo';
import {
  FaDiscord,
  FaFacebookF,
  FaInstagram,
  FaLinkedinIn,
  FaXTwitter,
  FaYoutube,
} from 'react-icons/fa6';
import { FiCheck, FiSend } from 'react-icons/fi';
import {
  FOOTER_NAV,
  FOOTER_NEWSLETTER_ICON,
} from './footerData';
import { subscribeNewsletter } from '../../modules/FooterPages/api/newsletterApi';

const SOCIAL_ICONS = {
  facebook: FaFacebookF,
  x: FaXTwitter,
  linkedin: FaLinkedinIn,
  discord: FaDiscord,
  youtube: FaYoutube,
  instagram: FaInstagram,
};

const SCROLL_NAV_IDS = new Set(['resources', 'company']);

function scrollPageToTop() {
  window.scrollTo({ top: 0, behavior: 'smooth' });
  const root = document.querySelector('main.et-main-scroll');
  if (root) root.scrollTo({ top: 0, behavior: 'smooth' });
}

function SocialLinks({ social }) {
  return (
    <div className="et-footer__social">
      {(social || []).map((item) => {
        const Icon = SOCIAL_ICONS[item.id];
        return (
          <a
            key={`${item.id}-${item.href}`}
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

function BrandColumn({ brand }) {
  return (
    <div className="et-footer__brand-col">
      <Link to="/" className="et-footer__brand-head" onClick={scrollPageToTop}>
        <EventThonLogo variant="footer" />
        <h2 className="et-footer__brand-name">{brand.brandName}</h2>
      </Link>
      <p className="et-footer__tagline">{brand.tagline}</p>
      <p className="et-footer__desc">{brand.description}</p>
      <SocialLinks social={brand.social} />
    </div>
  );
}

function NewsletterCard({ newsletter }) {
  const MailIcon = FOOTER_NEWSLETTER_ICON;
  const [status, setStatus] = useState('');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const onSubmit = async (e) => {
    e.preventDefault();
    const email = e.currentTarget.email?.value?.trim();
    if (!email) return;
    setSaving(true);
    setStatus('');
    setError('');
    try {
      const result = await subscribeNewsletter(email);
      setStatus(result?.message || 'Thanks for subscribing!');
      e.currentTarget.reset();
    } catch (err) {
      const detail = err?.response?.data?.detail;
      const msg = typeof detail === 'string'
        ? detail
        : Array.isArray(detail)
          ? detail.map((d) => d?.msg || d).join(' ')
          : err?.message || 'Could not subscribe. Try again.';
      setError(msg);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="et-footer__newsletter">
      <h3 className="et-footer__newsletter-title">
        <MailIcon size={16} aria-hidden />
        {newsletter?.title || 'Stay in the Loop'}
      </h3>
      <p className="et-footer__newsletter-desc">
        {newsletter?.desc || 'Subscribe to our newsletter and get the latest updates, tips and offers.'}
      </p>
      <form className="et-footer__newsletter-form" onSubmit={onSubmit}>
        <input
          type="email"
          name="email"
          placeholder="Enter your email"
          required
          disabled={saving}
          aria-label="Email address"
        />
        <button
          type="submit"
          className="et-footer__newsletter-submit"
          aria-label="Subscribe"
          disabled={saving}
        >
          <FiSend size={16} aria-hidden />
        </button>
      </form>
      {status ? <p className="et-footer__newsletter-status">{status}</p> : null}
      {error ? <p className="et-footer__newsletter-error">{error}</p> : null}
      <ul className="et-footer__checks">
        {(newsletter?.checks || []).map((text) => (
          <li key={text}>
            <FiCheck size={14} aria-hidden />
            {text}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default function FooterLinksGrid({ brand, onRankMatrixOpen }) {
  return (
    <div className="et-footer__links-grid">
      <BrandColumn brand={brand} />
      {FOOTER_NAV.map((col) => (
        <NavColumn key={col.id} col={col} onRankMatrixOpen={onRankMatrixOpen} />
      ))}
      <NewsletterCard newsletter={brand.newsletter} />
    </div>
  );
}
