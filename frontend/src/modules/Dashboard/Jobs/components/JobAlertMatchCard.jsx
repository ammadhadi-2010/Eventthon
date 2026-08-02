import React, { useState } from 'react';
import JobCompanyLogo from './JobCompanyLogo';
import { getJobCardShade } from '../utils/jobCardShades';

export default function JobAlertMatchCard({ match, shade = 'electric', onApply }) {
  const [busy, setBusy] = useState(false);
  const isOpportunity = match.listingKind === 'opportunity';
  const cta = match.ctaLabel || (isOpportunity ? 'Join' : 'Apply');

  const handleCta = async () => {
    if (busy) return;
    setBusy(true);
    try {
      await onApply?.(match);
    } finally {
      setBusy(false);
    }
  };

  return (
    <article className={`gigs-card ja-match-card jh-job-row jh-job-row--${shade}`}>
      <JobCompanyLogo
        imageurl={match.imageurl}
        company={match.company}
        logoText={match.logoText}
        logoClass={match.logoClass}
        listingKind={match.listingKind}
        shade={shade}
      />
      <div className="ja-match-card__body">
        <div className="ja-match-card__title-row">
          <h3>{match.role || match.title}</h3>
          <span className={`ja-alert-kind-badge ja-alert-kind-badge--${isOpportunity ? 'opportunity' : 'job'}`}>
            {isOpportunity ? 'Opportunity' : 'Job'}
          </span>
        </div>
        <p className="ja-match-card__meta">
          {match.company}
          {match.matchPercent ? ` · ${match.matchPercent}% match` : ''}
          {match.type ? ` · ${match.type}` : ''}
        </p>
      </div>
      <button
        type="button"
        className={`ja-match-card__cta${isOpportunity ? ' ja-match-card__cta--join' : ''}`}
        disabled={busy}
        onClick={handleCta}
      >
        {busy ? '…' : cta}
      </button>
    </article>
  );
}

export function JobAlertMatchesList({ matches, onApply }) {
  if (!matches?.length) return null;
  return (
    <div className="ja-matches-block">
      <header className="ja-matches-block__header">
        <h3>New matches</h3>
        <p>Instant picks from your Job and Opportunity alerts — Apply or Join right away.</p>
      </header>
      <div className="ja-matches-list">
        {matches.map((match, index) => (
          <JobAlertMatchCard
            key={match.matchId || match.id || index}
            match={match}
            shade={getJobCardShade(index)}
            onApply={onApply}
          />
        ))}
      </div>
    </div>
  );
}
