import React from 'react';
import { FiCheck, FiClock } from 'react-icons/fi';

const GigExplorerPackagesTab = ({
  packageTiers,
  selectedGig,
  activePackage,
  setActivePackage,
}) => (
  <div className="gigx-packages-compare">
    {packageTiers.map((tier) => (
      <article key={tier.key} className={`gigx-packages-col${activePackage === tier.key ? ' is-highlight' : ''}`}>
        <h4>{tier.label}</h4>
        <p className="gigx-packages-price">${tier.price}</p>
        <p className="gigx-packages-meta"><FiClock size={12} /> {tier.delivery} days · {tier.revisions} revisions</p>
        <ul>
          {(selectedGig.packageFeatures.length ? selectedGig.packageFeatures : ['Service Delivery', 'Quality Output']).slice(0, 4).map((feature) => (
            <li key={`${tier.key}-${feature}`}><FiCheck size={12} /> {feature}</li>
          ))}
        </ul>
        <button type="button" className="gigx-packages-select" onClick={() => setActivePackage(tier.key)}>
          Select {tier.label}
        </button>
        {selectedGig.addons.length ? (
          <p className="gigx-packages-addons-note">
            Add-ons: {selectedGig.addons.join(', ')}
          </p>
        ) : null}
      </article>
    ))}
  </div>
);

export default GigExplorerPackagesTab;
