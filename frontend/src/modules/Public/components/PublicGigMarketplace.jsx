import React from 'react';
import { Link } from 'react-router-dom';
import { FiCheckCircle, FiClock, FiStar } from 'react-icons/fi';

export default function PublicGigMarketplace({ data }) {
  const creator = data.creatorBadge || data.seller || {};

  return (
    <article className="public-marketplace" itemScope itemType="https://schema.org/Service">
      <header className="public-marketplace__hero">
        <p className="public-gig-category" itemProp="category">
          {data.professionalRole}
        </p>
        <h1 itemProp="name">{data.gigTitle || data.displayName}</h1>
        <div className="public-gig-meta">
          <span className="public-price" itemProp="offers" itemScope itemType="https://schema.org/Offer">
            <meta itemProp="priceCurrency" content="USD" />
            <span itemProp="price">{data.globalPricing || `$${Number(data.startingPrice || 0).toLocaleString()}`}</span>
          </span>
          <span>
            <FiClock size={12} aria-hidden /> {data.deliveryDuration || '3 Days'}
          </span>
          <span>
            <FiStar size={12} aria-hidden /> {Number(data.rating || 0).toFixed(1)} ({data.orders || 0} orders)
          </span>
        </div>
      </header>

      <section className="public-marketplace__creator" aria-label="Creator">
        <div className="public-creator-badge">
          {creator.avatar ? (
            <img src={creator.avatar} alt="" width={48} height={48} />
          ) : (
            <div className="public-creator-fallback">{creator.displayName?.charAt(0) || 'C'}</div>
          )}
          <div>
            <strong>{creator.displayName || 'Creator'}</strong>
            {creator.verified ? (
              <span className="public-verified-inline">
                <FiCheckCircle size={12} /> Verified Creator
              </span>
            ) : null}
          </div>
        </div>
      </section>

      <section className="public-marketplace__body">
        <h2>Service Description</h2>
        <p itemProp="description">{data.serviceDescription || data.dynamicBio}</p>
      </section>

      {data.skills_tags?.length > 0 && (
        <section className="public-marketplace__tags" aria-label="Skills">
          <h2>Skills &amp; Tags</h2>
          <ul className="public-skills">
            {data.skills_tags.map((tag) => (
              <li key={tag} className="public-skill-pill">
                {tag}
              </li>
            ))}
          </ul>
        </section>
      )}

      <footer className="public-marketplace__cta">
        <p>Sign in to order, message the seller, or submit a proposal.</p>
        <Link to="/auth/login" className="public-cta">
          Sign in to Apply
        </Link>
      </footer>
    </article>
  );
}
