import React from 'react';
import { Link } from 'react-router-dom';
import {
  FiAlertTriangle, FiAward, FiBriefcase, FiCheckSquare, FiCloud, FiCreditCard,
  FiDollarSign, FiFileText, FiHeart, FiImage, FiLock, FiMail, FiRefreshCw, FiShield,
  FiShoppingCart, FiUser, FiUsers, FiUserX,
} from 'react-icons/fi';
import FooterPageShell from '../components/FooterPageShell';
import useCompanyFooterContent from '../hooks/useCompanyFooterContent';
import {
  TERMS_COMMITMENT, TERMS_INTRO, TERMS_LAST_UPDATED, TERMS_SECTIONS,
} from '../data/termsData';
import { normalizeTermsCard } from '../utils/termsCmsUtils';
import '../styles/terms-of-service.css';

const ICONS = {
  check: FiCheckSquare, user: FiUser, lock: FiLock, image: FiImage, users: FiUsers,
  briefcase: FiBriefcase, cart: FiShoppingCart, wallet: FiDollarSign, card: FiCreditCard,
  heart: FiHeart, copyright: FiAward, cloud: FiCloud, ban: FiUserX, alert: FiAlertTriangle,
  scale: FiShield, refresh: FiRefreshCw, gavel: FiFileText, mail: FiMail,
};

function openMail(email) {
  const addr = String(email || '').replace(/^email:\s*/i, '').trim();
  if (addr) window.location.href = `mailto:${addr}`;
}

function TermsCard({ card, index }) {
  const Icon = ICONS[card.icon] || FiFileText;
  return (
    <article className={`tos-card${card.kind === 'contact' ? ' tos-card--contact' : ''}`}>
      <div className="tos-card__head">
        <span className="tos-card__num">{index + 1}</span>
        <span className="tos-card__icon" aria-hidden><Icon size={18} /></span>
      </div>
      <h2 className="tos-card__title">{card.label}</h2>
      {card.kind === 'paragraph' ? <p className="tos-card__body">{card.body}</p> : null}
      {card.kind === 'contact' ? (
        <div className="tos-contact">
          {card.lead ? <p className="tos-contact__lead">{card.lead}</p> : null}
          <a
            className="tos-contact__email"
            href={`mailto:${String(card.email || '').replace(/^email:\s*/i, '').trim()}`}
            onClick={(e) => { e.preventDefault(); openMail(card.email); }}
          >
            <FiMail size={16} aria-hidden />
            <span>Email: {card.email}</span>
          </a>
          <div className="tos-contact__links">
            {card.links.map((link) =>
              String(link.href).startsWith('http') ? (
                <a key={link.label} href={link.href} target="_blank" rel="noreferrer" className="tos-contact__link">{link.label}</a>
              ) : (
                <Link key={link.label} to={link.href} className="tos-contact__link">{link.label}</Link>
              ),
            )}
          </div>
        </div>
      ) : null}
    </article>
  );
}

export default function TermsOfService() {
  const { data, loading } = useCompanyFooterContent('Terms of Service', TERMS_SECTIONS);
  const lastUpdated = data?.lastUpdated || TERMS_LAST_UPDATED;
  const cards = (data?.sections?.length ? data.sections : TERMS_SECTIONS).map(normalizeTermsCard);
  const intro = data?.intro || TERMS_INTRO;
  const commitment = data?.commitment || TERMS_COMMITMENT;
  const main = cards.slice(0, 16);
  const bottom = cards.slice(16);

  return (
    <FooterPageShell variant="company">
      <div className="tos-page">
        <header className="tos-hero">
          <div className="tos-hero__title-row">
            <span className="tos-hero__doc" aria-hidden><FiFileText size={26} /></span>
            <h1 className="tos-hero__title">Terms <span>of Service</span></h1>
          </div>
          <p className="tos-hero__updated">Last updated: {lastUpdated}</p>
          <p className="tos-hero__intro">{intro}</p>
        </header>
        {loading ? <p className="tos-loading">Loading terms…</p> : null}
        <div className="tos-grid">{main.map((card, i) => <TermsCard key={card.id} card={card} index={i} />)}</div>
        {bottom.length ? (
          <div className="tos-grid tos-grid--wide">
            {bottom.map((card, i) => <TermsCard key={card.id} card={card} index={16 + i} />)}
          </div>
        ) : null}
        <footer className="tos-banner">
          <div className="tos-banner__left">
            <FiShield size={22} aria-hidden />
            <div>
              <strong>Our Commitment</strong>
              <p>{commitment}</p>
            </div>
          </div>
          <span className="tos-banner__brand">EVENTTHON NETWORK</span>
        </footer>
      </div>
    </FooterPageShell>
  );
}
