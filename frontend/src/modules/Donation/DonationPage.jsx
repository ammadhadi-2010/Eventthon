import React, { useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  FiCheckCircle,
  FiHeart,
  FiPlay,
  FiRefreshCw,
  FiShield,
} from 'react-icons/fi';
import DonateModal from './components/DonateModal';
import DonationInviteSection from './components/DonationInviteSection';
import DonationHubLayout from './components/DonationHubLayout';
import DonationHubSidebar from './components/DonationHubSidebar';
import {
  resolveCommitments,
  resolveDonationImages,
  resolveHeroFeatures,
  resolveSteps,
} from './donationContent';
import { resolveDonationIcon } from './donationIconMap';
import useDonationConfig from './useDonationConfig';
import { resolveMediaUrl } from '../../components/shared/utils/resolveMediaUrl';
import './styles/donation.css';

function normalizeWebsiteUrl(raw = '') {
  const value = String(raw || '').trim();
  if (!value) return '';
  if (/^https?:\/\//i.test(value)) return value;
  return `https://${value.replace(/^\/+/, '')}`;
}

function resolveOrgLogoUrl(org) {
  const custom = String(org.logoImageUrl || org.logoUrl || '').trim();
  if (custom) return resolveMediaUrl(custom) || custom;
  const website = normalizeWebsiteUrl(org.website);
  if (!website) return '';
  try {
    const host = new URL(website).hostname.replace(/^www\./, '');
    return `https://www.google.com/s2/favicons?domain=${encodeURIComponent(host)}&sz=128`;
  } catch {
    return '';
  }
}

function OrganizationCard({ org, onDonate }) {
  const website = normalizeWebsiteUrl(org.website);
  const logoUrl = resolveOrgLogoUrl(org);
  const [logoBroken, setLogoBroken] = React.useState(false);
  const initials = org.logo || org.name?.slice(0, 2)?.toUpperCase() || 'NG';

  return (
    <article className="donation-org-card">
      <div className="donation-org-card__banner">
        {logoUrl && !logoBroken ? (
          <img
            src={logoUrl}
            alt=""
            className="donation-org-card__logo-img"
            onError={() => setLogoBroken(true)}
          />
        ) : (
          <div className="donation-org-card__logo-fallback" style={{ background: org.color || '#6366f1' }}>
            {initials}
          </div>
        )}
        {org.verified !== false ? (
          <span className="donation-org-card__verified">
            <FiCheckCircle size={12} aria-hidden /> Verified
          </span>
        ) : null}
      </div>
      <div className="donation-org-card__body">
        <h3>{org.name}</h3>
        <p>{org.description}</p>
        {website ? (
          <a href={website} target="_blank" rel="noreferrer noopener" className="donation-org-card__link">
            {website.replace(/^https?:\/\//, '')}
          </a>
        ) : (
          <span className="donation-org-card__link donation-org-card__link--muted">Website coming soon</span>
        )}
        <button
          type="button"
          className="donation-org-card__cta"
          onClick={() => onDonate({ ...org, website: website || org.website })}
          disabled={!website}
          title={website ? `Donate via ${org.name}` : 'No website configured'}
        >
          Donate Now
        </button>
      </div>
    </article>
  );
}

export default function DonationPage({ userData }) {
  const { loading, error, settings, causes, organizations, reload } = useDonationConfig();
  const [activeCause, setActiveCause] = useState('all');
  const [activeStep, setActiveStep] = useState(0);
  const [donateTarget, setDonateTarget] = useState(null);
  const orgsRef = useRef(null);

  const filteredOrgs = useMemo(() => {
    if (activeCause === 'all') return organizations;
    return organizations.filter((org) => (org.causes || []).includes(activeCause));
  }, [activeCause, organizations]);

  const heroFeatures = useMemo(() => resolveHeroFeatures(settings), [settings]);
  const steps = useMemo(() => resolveSteps(settings), [settings]);
  const commitments = useMemo(() => resolveCommitments(settings), [settings]);
  const images = useMemo(() => resolveDonationImages(settings), [settings]);

  const visibleOrgs = filteredOrgs;

  const scrollToOrgs = () => {
    orgsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const activeStepData = steps[activeStep] || steps[0];

  if (loading) {
    return (
      <div className="donation-page donation-page--loading">
        <div className="donation-loading">
          <span className="donation-loading__spinner" aria-hidden />
          <p>Loading donation hub…</p>
        </div>
      </div>
    );
  }

  return (
    <DonationHubLayout
      sidebar={
        <DonationHubSidebar active="donate" profitPercent={settings.profitPledgePercent ?? 12} />
      }
    >
      {error ? (
        <div className="donation-alert" role="alert">
          <span>{error}</span>
          <button type="button" className="donation-alert__btn" onClick={reload}>
            <FiRefreshCw size={14} aria-hidden /> Retry
          </button>
        </div>
      ) : null}

      <main className="donation-main">
        <section className="donation-hero">
          <div className="donation-hero__glow" aria-hidden />
          <div className="donation-hero__copy">
            <span className="donation-hero__eyebrow">EventThon Donate</span>
            <h1>{settings.heroTitle}</h1>
            <p>{settings.heroSubtitle}</p>
            <div className="donation-hero__features">
              {heroFeatures.map(({ Icon, text }) => (
                <span key={text} className="donation-hero__feature">
                  <Icon size={14} aria-hidden /> {text}
                </span>
              ))}
            </div>
            <div className="donation-hero__actions">
              <button type="button" className="donation-btn donation-btn--primary" onClick={scrollToOrgs}>
                Explore Organizations
              </button>
              <Link to="/donate/learn-more" className="donation-btn donation-btn--ghost">
                <FiPlay size={14} aria-hidden /> Learn More
              </Link>
            </div>
          </div>
          <div className="donation-hero__visual">
            <img
              className="donation-hero__image"
              src={images.hero}
              alt="Hands nurturing a growing plant — symbol of giving and impact"
            />
            <blockquote className="donation-hero__quote">
              &ldquo;The example of those who spend in the way of Allah is like a grain that grows seven spikes.&rdquo;
              <cite>Surah Al-Baqarah (2:261)</cite>
            </blockquote>
          </div>
        </section>

        <section id="causes" className="donation-section donation-section--causes">
          <div className="donation-section__head">
            <h2>Causes</h2>
          </div>
          <div className="donation-causes-track">
            {causes.map((cause) => {
              const Icon = resolveDonationIcon(cause.iconKey);
              const active = activeCause === cause.id;
              return (
                <button
                  key={cause.id}
                  type="button"
                  className={`donation-cause${active ? ' is-active' : ''}`}
                  onClick={() => setActiveCause(cause.id)}
                  aria-pressed={active}
                >
                  <span className="donation-cause__icon" style={{ '--cause-color': cause.color }}>
                    <Icon size={32} aria-hidden />
                  </span>
                  <span className="donation-cause__label">{cause.label}</span>
                </button>
              );
            })}
          </div>
        </section>

        <section ref={orgsRef} id="organizations" className="donation-section donation-section--orgs">
          <div className="donation-section__head">
            <h2>Verified Organizations</h2>
          </div>
          {visibleOrgs.length ? (
            <div className="donation-orgs-stack">
              {visibleOrgs.map((org) => (
                <OrganizationCard key={org.id} org={org} onDonate={setDonateTarget} />
              ))}
            </div>
          ) : (
            <div className="donation-empty">
              <p>No organizations match this cause yet.</p>
              <button
                type="button"
                className="donation-btn donation-btn--ghost"
                onClick={() => setActiveCause('all')}
              >
                Show all organizations
              </button>
            </div>
          )}
        </section>

        <section className="donation-section donation-how">
          <div className="donation-section__head">
            <h2>How It Works</h2>
          </div>
          <div className="donation-how-tabs" role="tablist" aria-label="How donation works">
            {steps.map((step, index) => (
              <button
                key={step.title}
                type="button"
                role="tab"
                aria-selected={activeStep === index}
                className={`donation-how-tab${activeStep === index ? ' is-active' : ''}`}
                onClick={() => setActiveStep(index)}
              >
                <span className="donation-how-tab__num">{index + 1}</span>
                <span>{step.title}</span>
              </button>
            ))}
          </div>
          {activeStepData ? (
            <article className="donation-how-panel" role="tabpanel">
              <span className="donation-how-panel__step">Step {activeStep + 1}</span>
              <h3>{activeStepData.title}</h3>
              <p>{activeStepData.text}</p>
              <div className="donation-how-panel__nav">
                <button
                  type="button"
                  className="donation-btn donation-btn--ghost"
                  disabled={activeStep <= 0}
                  onClick={() => setActiveStep((i) => Math.max(0, i - 1))}
                >
                  Previous
                </button>
                <button
                  type="button"
                  className="donation-btn donation-btn--primary"
                  disabled={activeStep >= steps.length - 1}
                  onClick={() => setActiveStep((i) => Math.min(steps.length - 1, i + 1))}
                >
                  Next step
                </button>
              </div>
            </article>
          ) : null}
        </section>

        <section className="donation-commitment-row">
          <div className="donation-commitment">
            <h2>Our Commitment</h2>
            <ul>
              {commitments.map(({ Icon, title, text }) => (
                <li key={title}>
                  <Icon size={24} aria-hidden />
                  <div>
                    <strong>{title}</strong>
                    <p>{text}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
          <div className="donation-reward-card">
            <div className="donation-reward-card__visual">
              <img
                className="donation-reward-card__image"
                src={images.reward}
                alt="Plant growing from coins in a jar"
              />
            </div>
            <div className="donation-reward-card__copy">
              <h3>{settings.rewardTitle}</h3>
              <p>{settings.rewardSubtitle}</p>
            </div>
          </div>
        </section>

        <DonationInviteSection
          userData={userData}
          title={settings.inviteTitle}
          subtitle={settings.inviteSubtitle}
        />

        <footer className="donation-footnotes">
          <div className="donation-footnotes__item">
            <FiShield size={16} aria-hidden />
            <div><strong>Secure &amp; Safe</strong><span>Verified payment partners</span></div>
          </div>
          <div className="donation-footnotes__item">
            <FiCheckCircle size={16} aria-hidden />
            <div><strong>Verified Only</strong><span>Trusted organizations</span></div>
          </div>
          <div className="donation-footnotes__item">
            <FiHeart size={16} aria-hidden />
            <div><strong>Global Impact</strong><span>Communities worldwide</span></div>
          </div>
          <blockquote className="donation-footnotes__quote">
            &ldquo;Charity does not decrease wealth.&rdquo; — Sahih Muslim 2588
          </blockquote>
        </footer>
      </main>

      <DonateModal
        open={Boolean(donateTarget)}
        organization={donateTarget}
        presetAmounts={settings.presetAmounts}
        onClose={() => setDonateTarget(null)}
      />
    </DonationHubLayout>
  );
}
