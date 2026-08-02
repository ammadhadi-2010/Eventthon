import React from 'react';
import { Link } from 'react-router-dom';
import { FiMail, FiShield } from 'react-icons/fi';
import FooterPageShell from '../components/FooterPageShell';
import useCompanyFooterContent from '../hooks/useCompanyFooterContent';
import {
  PRIVACY_INTRO,
  PRIVACY_LAST_UPDATED,
  PRIVACY_SECTIONS,
} from '../data/privacyData';
import { normalizePrivacyCard } from '../utils/privacyCmsUtils';
import '../styles/privacy-policy.css';

function PrivacyCard({ card, index }) {
  const n = index + 1;
  return (
    <article className={`pp-card${card.kind !== 'bullets' ? ` pp-card--${card.kind}` : ''}`}>
      <div className="pp-card__head">
        <span className="pp-card__num">{n}</span>
        <h2 className="pp-card__title">{card.label}</h2>
      </div>

      {card.kind === 'paragraph' ? (
        <p className="pp-card__body">{card.body}</p>
      ) : null}

      {card.kind === 'contact' ? (
        <div className="pp-contact">
          <p className="pp-contact__lead">{card.lead}</p>
          <a
            className="pp-contact__email"
            href={`mailto:${String(card.email || '').replace(/^email:\s*/i, '').trim()}`}
            onClick={(e) => {
              const addr = String(card.email || '').replace(/^email:\s*/i, '').trim();
              if (!addr) return;
              e.preventDefault();
              window.location.href = `mailto:${addr}`;
            }}
          >
            <FiMail size={16} aria-hidden />
            <span>Email: {card.email}</span>
          </a>
          <div className="pp-contact__links">
            {card.links.map((link) =>
              String(link.href).startsWith('http') ? (
                <a key={link.label} href={link.href} target="_blank" rel="noreferrer" className="pp-contact__link">
                  {link.label}
                </a>
              ) : (
                <Link key={link.label} to={link.href} className="pp-contact__link">
                  {link.label}
                </Link>
              ),
            )}
          </div>
        </div>
      ) : null}

      {card.kind === 'bullets' ? (
        <ul className="pp-card__list">
          {card.bullets.map((item, i) => (
            <li key={`${card.id}-${i}`}>{item}</li>
          ))}
        </ul>
      ) : null}
    </article>
  );
}

export default function PrivacyPolicy() {
  const { data, loading } = useCompanyFooterContent('Privacy Policy', PRIVACY_SECTIONS);
  const lastUpdated = data?.lastUpdated || PRIVACY_LAST_UPDATED;
  const source = data?.sections?.length ? data.sections : PRIVACY_SECTIONS;
  const cards = source.map((section, index) => normalizePrivacyCard(section, index));
  const intro = data?.intro || PRIVACY_INTRO;

  return (
    <FooterPageShell variant="company">
      <div className="pp-page">
        <header className="pp-hero">
          <div className="pp-hero__title-row">
            <span className="pp-hero__shield" aria-hidden>
              <FiShield size={28} />
            </span>
            <h1 className="pp-hero__title">Privacy Policy</h1>
          </div>
          <p className="pp-hero__updated">Last updated: {lastUpdated}</p>
          <p className="pp-hero__intro">{intro}</p>
        </header>

        {loading ? <p className="pp-loading">Loading privacy policy…</p> : null}

        <div className="pp-grid">
          {cards.map((card, index) => (
            <PrivacyCard key={card.id} card={card} index={index} />
          ))}
        </div>

        <footer className="pp-banner">
          <div className="pp-banner__left">
            <FiShield size={22} aria-hidden />
            <strong>Your privacy. Our priority.</strong>
          </div>
          <p className="pp-banner__mid">
            EventThon is committed to protecting your data across squads, gigs, jobs, wallet, and donations.
          </p>
          <span className="pp-banner__brand">EVENTTHON NETWORK</span>
        </footer>
      </div>
    </FooterPageShell>
  );
}
