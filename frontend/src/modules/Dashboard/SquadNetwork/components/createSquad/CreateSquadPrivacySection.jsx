import React from 'react';
import { Check, Globe, Lock } from 'lucide-react';

export default function CreateSquadPrivacySection({ form, onChange }) {
  const options = [
    {
      id: 'public',
      title: 'Public',
      subtitle: 'Anyone can discover and join',
      icon: Globe,
    },
    {
      id: 'private',
      title: 'Private',
      subtitle: 'Only invited members can join',
      icon: Lock,
    },
  ];

  return (
    <section className="cs-section">
      <header className="cs-section__head">
        <span className="cs-section__num">2</span>
        <div>
          <h3>Privacy Settings</h3>
          <p>Control squad visibility and SEO discovery.</p>
        </div>
      </header>

      <div className="cs-privacy-grid">
        {options.map((opt) => {
          const active = form.privacy === opt.id;
          const Icon = opt.icon;
          return (
            <button
              key={opt.id}
              type="button"
              className={`cs-privacy-card${active ? ' is-active' : ''}`}
              onClick={() => onChange('privacy', opt.id)}
            >
              {active ? (
                <span className="cs-privacy-card__check" aria-hidden>
                  <Check size={12} />
                </span>
              ) : null}
              <Icon size={22} aria-hidden />
              <strong>{opt.title}</strong>
              <span>{opt.subtitle}</span>
              {opt.id === 'public' ? (
                <em className="cs-privacy-card__seo">Listed in public squad discovery</em>
              ) : null}
            </button>
          );
        })}
      </div>
    </section>
  );
}
