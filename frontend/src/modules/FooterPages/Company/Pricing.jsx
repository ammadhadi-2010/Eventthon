import React, { useState } from 'react';
import { FiCheck } from 'react-icons/fi';
import FooterPageShell from '../components/FooterPageShell';
import PageHero from '../components/PageHero';

const TIERS = [
  { id: 'free', name: 'Free', price: { monthly: 0, yearly: 0 }, features: ['Basic squads', '5 projects', 'Community support'] },
  { id: 'pro', name: 'Pro Dev', price: { monthly: 29, yearly: 290 }, featured: true, features: ['Unlimited projects', 'Gig analytics', 'Priority support', 'API access'] },
  { id: 'ent', name: 'Enterprise Squad', price: { monthly: 99, yearly: 990 }, features: ['SSO', 'Dedicated success', 'Custom contracts', 'Audit logs'] },
];

export default function Pricing() {
  const [yearly, setYearly] = useState(false);

  return (
    <FooterPageShell variant="company">
      <PageHero title="Pricing" subtitle="Plans for solo creators, pro developers, and enterprise squads." />
      <div className="fp-pricing-toggle">
        <button type="button" className={!yearly ? 'is-active' : ''} onClick={() => setYearly(false)}>Monthly</button>
        <button type="button" className={yearly ? 'is-active' : ''} onClick={() => setYearly(true)}>Yearly</button>
      </div>
      <div className="fp-grid-3">
        {TIERS.map((tier) => (
          <article key={tier.id} className={`fp-card fp-tier${tier.featured ? ' is-featured' : ''}`}>
            <h3 style={{ margin: '0 0 8px', color: '#f8fafc' }}>{tier.name}</h3>
            <p className="fp-metric" style={{ fontSize: 32 }}>${yearly ? tier.price.yearly : tier.price.monthly}</p>
            <p style={{ fontSize: 12, color: '#64748b', marginBottom: 16 }}>{yearly ? 'per year' : 'per month'}</p>
            <ul style={{ listStyle: 'none', margin: 0, padding: 0 }}>
              {tier.features.map((f) => (
                <li key={f} style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 8, fontSize: 13, color: '#cbd5e1' }}>
                  <FiCheck color="#8b5cf6" /> {f}
                </li>
              ))}
            </ul>
          </article>
        ))}
      </div>
    </FooterPageShell>
  );
}
