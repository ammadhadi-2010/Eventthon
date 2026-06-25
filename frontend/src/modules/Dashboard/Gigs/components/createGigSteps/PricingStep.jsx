import React from 'react';
import { GIG_PACKAGE_TIER_KEYS, TIER_LABELS } from '../createGigData';

const PricingStep = ({
  pricingTiers,
  updatePackageTier,
  updatePackageFeature,
  addonsText,
  setAddonsText,
}) => (
  <div className="create-gig-form-card">
    <p className="create-gig-field-sub create-gig-pricing-hint">
      Set <strong>Basic</strong>, <strong>Standard</strong>, and <strong>Premium</strong> packages — buyers
      see these on your gig detail page (same as gig explorer).
    </p>

    <div className="create-gig-pricing-grid">
      {GIG_PACKAGE_TIER_KEYS.map((key) => {
        const tier = pricingTiers[key];
        return (
          <article key={key} className={`create-gig-pricing-card create-gig-pricing-card--${key}`}>
            <h3>{TIER_LABELS[key]}</h3>
            <label>Price (USD)</label>
            <input
              type="number"
              min="5"
              placeholder="e.g. 120"
              value={tier.price}
              onChange={(event) => updatePackageTier(key, 'price', event.target.value)}
            />
            <label>Delivery (days)</label>
            <input
              type="number"
              min="1"
              placeholder="e.g. 5"
              value={tier.deliveryDays}
              onChange={(event) => updatePackageTier(key, 'deliveryDays', event.target.value)}
            />
            <label>Revisions</label>
            <input
              type="number"
              min="0"
              placeholder="e.g. 2"
              value={tier.revisions}
              onChange={(event) => updatePackageTier(key, 'revisions', event.target.value)}
            />
            <label>Package features</label>
            {tier.features.map((feature, idx) => (
              <input
                key={`${key}-f-${idx}`}
                className="create-gig-pricing-feature"
                value={feature}
                placeholder="Feature included"
                onChange={(event) => updatePackageFeature(key, idx, event.target.value)}
              />
            ))}
          </article>
        );
      })}
    </div>

    <label>Add-ons</label>
    <p className="create-gig-field-sub">Separate add-ons with comma</p>
    <input
      type="text"
      value={addonsText}
      onChange={(event) => setAddonsText(event.target.value)}
      placeholder="Extra fast delivery, source file package"
    />
  </div>
);

export default PricingStep;
