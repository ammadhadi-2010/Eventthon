import React from 'react';
import EventThonBadge from '../../../../components/EventThonBadge';
import { rankCodeToBadgeProps } from '../../../../components/badgeTierProps';

export default function ViewFullProfileRightColumn({ draft, userData, verified, rankMeta, gamification }) {
  const badgeProps = rankCodeToBadgeProps(rankMeta.code, { label: rankMeta.label });
  const xpCurrent = Number(gamification?.current_xp ?? userData?.xp_current ?? 0);
  const xpNext = Number(gamification?.next_xp ?? userData?.xp_next ?? 1000);
  const nextRank = gamification?.next_rank || userData?.rank_next_label || 'Specialist';
  const xpPct = xpNext > 0 ? Math.min(100, Math.round((xpCurrent / xpNext) * 100)) : 0;

  return (
    <aside className="vfps-right" aria-label="Profile meta">
      <section className="vfps-card">
        <h2 className="vfps-card-title">Rank & status</h2>
        <div className="vfps-rank-badge-slot">
          <EventThonBadge tier={badgeProps.tier} label={badgeProps.label} variant="profile" />
        </div>
        <p className="vfps-muted" style={{ fontSize: 12, marginBottom: 6 }}>
          Rank progress
        </p>
        <div className="vfps-rankbar">
          <div style={{ width: `${xpPct}%` }} />
        </div>
        <p className="vfps-muted" style={{ fontSize: 12 }}>
          {xpCurrent} / {xpNext} XP · Next: {nextRank}
        </p>
      </section>

      <section className="vfps-card">
        <h2 className="vfps-card-title">Trust & verification</h2>
        {[
          ['Identity', verified ? 'Verified' : 'Pending'],
          ['Email', userData?.email ? 'Verified' : '—'],
          ['Phone', userData?.mobile || userData?.phone ? 'Verified' : '—'],
          ['Admin', verified ? 'Approved' : 'Pending'],
        ].map(([label, status]) => {
          const ok = status === 'Verified' || status === 'Approved';
          return (
            <div key={label} className="vfps-trust-row">
              <span>{label}</span>
              {ok ? (
                <span className="vfps-trust-check">{status}</span>
              ) : (
                <span className="vfps-muted" style={{ fontSize: 12, fontWeight: 700 }}>
                  {status}
                </span>
              )}
            </div>
          );
        })}
      </section>

      <section className="vfps-card">
        <h2 className="vfps-card-title">Connect</h2>
        <div className="vfps-connect">
          {(draft.socialLinks || []).length ? (
            draft.socialLinks.map((l) => (
              <a key={l.id} href={l.url || '#'} target="_blank" rel="noreferrer">
                {l.platform || 'Link'}
                <span>↗</span>
              </a>
            ))
          ) : (
            <p className="vfps-muted">Add social links in Edit profile.</p>
          )}
        </div>
      </section>

      <section className="vfps-card">
        <h2 className="vfps-card-title">Languages</h2>
        {(draft.languages || []).map((lang, i) => (
          <div key={lang} className="vfps-trust-row">
            <span>
              {lang}
              {i === 0 ? ' — Native' : ' — Fluent'}
            </span>
          </div>
        ))}
      </section>

      <section className="vfps-card">
        <h2 className="vfps-card-title">Education</h2>
        {draft.educations?.length ? (
          draft.educations.map((e) => (
            <div key={e.id} style={{ marginBottom: 12 }}>
              <p className="vfps-edu-title">{e.degree || 'Degree'}</p>
              <p className="vfps-edu-sub">
                {[e.institution, [e.startYear, e.endYear].filter(Boolean).join(' – ')].filter(Boolean).join(' · ')}
              </p>
            </div>
          ))
        ) : (
          <p className="vfps-muted">Add education in Edit profile.</p>
        )}
      </section>
    </aside>
  );
}
