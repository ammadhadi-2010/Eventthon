import React from 'react';
import { Link } from 'react-router-dom';
import { FiArrowLeft, FiHeart, FiPlay, FiRefreshCw } from 'react-icons/fi';
import DonationHubLayout from './components/DonationHubLayout';
import DonationHubSidebar from './components/DonationHubSidebar';
import { resolveDonationImages, resolveLearnMoreContent } from './donationContent';
import useDonationConfig from './useDonationConfig';
import './styles/donation.css';

export default function DonationLearnMorePage() {
  const { loading, error, settings, reload } = useDonationConfig();
  const content = resolveLearnMoreContent(settings);
  const images = resolveDonationImages(settings);
  void images;

  if (loading) {
    return (
      <div className="donation-page donation-page--loading">
        <div className="donation-loading">
          <span className="donation-loading__spinner" aria-hidden />
          <p>Loading…</p>
        </div>
      </div>
    );
  }

  return (
    <DonationHubLayout
      sidebar={
        <DonationHubSidebar active="learn-more" profitPercent={settings.profitPledgePercent ?? 12} />
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
        <Link to="/donate" className="donation-learn-back">
          <FiArrowLeft size={16} aria-hidden /> Back to Donation Hub
        </Link>

        <section className="donation-learn-hero">
          <div className="donation-learn-hero__glow" aria-hidden />
          <div className="donation-learn-hero__copy">
            <span className="donation-learn-hero__eyebrow">Learn More</span>
            <h1>{content.title}</h1>
            <p className="donation-learn-hero__subtitle">{content.subtitle}</p>
            <p className="donation-learn-hero__intro">{content.intro}</p>
            <div className="donation-hero__actions">
              <Link to="/donate" className="donation-btn donation-btn--primary">
                <FiHeart size={14} aria-hidden /> Explore Organizations
              </Link>
              <Link to="/donate#causes" className="donation-btn donation-btn--ghost">
                <FiPlay size={14} aria-hidden /> View Causes
              </Link>
            </div>
          </div>
          {content.imageUrl ? (
            <div className="donation-learn-hero__visual">
              <img src={content.imageUrl} alt="" className="donation-learn-hero__image" />
            </div>
          ) : null}
        </section>

        <section className="donation-section donation-learn-sections">
          <h2>What you should know</h2>
          <div className="donation-learn-grid">
            {content.sections.map((row) => (
              <article key={row.title} className="donation-learn-card">
                <h3>{row.title}</h3>
                <p>{row.text}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="donation-learn-cta">
          <div>
            <h2>Ready to give?</h2>
            <p>Choose a verified organization and donate securely through EventThon.</p>
          </div>
          <Link to="/donate" className="donation-btn donation-btn--primary">
            Go to Donation Hub
          </Link>
        </section>
      </main>
    </DonationHubLayout>
  );
}
