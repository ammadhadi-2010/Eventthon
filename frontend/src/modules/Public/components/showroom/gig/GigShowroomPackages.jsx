import React from 'react';
import { Link } from 'react-router-dom';
import { Check } from 'lucide-react';

export default function GigShowroomPackages({ packages, selectedId, onSelect, isGuest }) {
  return (
    <section className="ps-mp-packages-section" aria-label="Package tiers">
      <h2 className="ps-mp-section-label">Choose Your Package</h2>
      <div className="ps-mp-packages flex flex-row overflow-x-auto gap-4 w-full pb-3 flex-nowrap max-lg:px-2 lg:grid lg:grid-cols-3 lg:overflow-visible [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
        {packages.map((pkg) => {
          const selected = pkg.id === selectedId;
          return (
            <article
              key={pkg.id}
              className={`ps-mp-package shrink-0 w-[85vw] max-w-[320px] lg:shrink lg:w-auto lg:max-w-none${selected ? ' is-selected' : ''}${pkg.popular ? ' is-popular' : ''}`}
              onClick={() => onSelect(pkg.id)}
              onKeyDown={(e) => e.key === 'Enter' && onSelect(pkg.id)}
              role="button"
              tabIndex={0}
              aria-pressed={selected}
            >
              {pkg.popular ? <span className="ps-mp-package__badge">Most Popular</span> : null}
              <h3>{pkg.name}</h3>
              <p className="ps-mp-package__price">${pkg.price}</p>
              <p className="ps-mp-package__desc">{pkg.description}</p>
              <ul>
                {pkg.features.map((f) => (
                  <li key={f}>
                    <Check size={13} aria-hidden />
                    {f}
                  </li>
                ))}
              </ul>
              <p className="ps-mp-package__meta">
                {pkg.deliveryDays} Days Delivery · {pkg.revisions} Revision
                {pkg.revisions > 1 ? 's' : ''}
              </p>
              {isGuest ? (
                <Link
                  to="/auth/login"
                  className="ps-btn ps-btn--ghost ps-mp-package__btn"
                  onClick={(e) => e.stopPropagation()}
                >
                  Continue
                </Link>
              ) : (
                <button
                  type="button"
                  className="ps-btn ps-btn--ghost ps-mp-package__btn"
                  onClick={(e) => {
                    e.stopPropagation();
                    onSelect(pkg.id);
                  }}
                >
                  Continue
                </button>
              )}
            </article>
          );
        })}
      </div>
    </section>
  );
}
