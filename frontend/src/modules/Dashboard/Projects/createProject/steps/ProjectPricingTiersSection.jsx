import React from 'react';
import FormField from '../shared/FormField';
import { PACKAGE_TIER_KEYS, normalizeWizardPricingTiers } from '../data/createProjectWizardData';
import { useCreateProjectWizard } from '../context/CreateProjectWizardContext';

const TIER_LABELS = { basic: 'Basic', standard: 'Standard', premium: 'Premium' };

export default function ProjectPricingTiersSection() {
  const { wizardData, updatePackageTier, updatePackageFeature } = useCreateProjectWizard();
  const tiers = normalizeWizardPricingTiers(wizardData?.pricingTiers);

  return (
    <div className="cp-pricing-section">
      <h3 className="cp-pricing-title">Collaboration packages</h3>
      <p className="cp-pricing-sub">Set Basic, Standard, and Premium pricing like gig packages.</p>
      <div className="cp-pricing-grid">
        {PACKAGE_TIER_KEYS.map((key) => {
          const tier = tiers[key];
          return (
            <article key={key} className={`cp-pricing-card cp-pricing-card--${key}`}>
              <h4>{TIER_LABELS[key]}</h4>
              <FormField label="Price (USD)">
                <input
                  type="number"
                  className="cp-input"
                  min={0}
                  value={tier.price}
                  onChange={(e) => updatePackageTier(key, 'price', e.target.value)}
                />
              </FormField>
              <FormField label="Delivery (days)">
                <input
                  type="number"
                  className="cp-input"
                  min={1}
                  value={tier.deliveryDays}
                  onChange={(e) => updatePackageTier(key, 'deliveryDays', e.target.value)}
                />
              </FormField>
              <FormField label="Revisions">
                <input
                  type="number"
                  className="cp-input"
                  min={0}
                  value={tier.revisions}
                  onChange={(e) => updatePackageTier(key, 'revisions', e.target.value)}
                />
              </FormField>
              <p className="cp-field__label">Features</p>
              {(tier.features || []).map((feature, idx) => (
                <input
                  key={`${key}-f-${idx}`}
                  className="cp-input cp-pricing-feature"
                  value={feature}
                  onChange={(e) => updatePackageFeature(key, idx, e.target.value)}
                />
              ))}
            </article>
          );
        })}
      </div>
    </div>
  );
}
