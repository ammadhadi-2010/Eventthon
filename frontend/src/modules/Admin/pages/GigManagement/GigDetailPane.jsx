import React from 'react';
import { ArrowLeft, Briefcase, Calendar, Clock, Globe, Tag } from 'lucide-react';
import {
  GIG_STATUS_CLASS,
  displayPosterHandle,
  displayPosterName,
  posterAvatarUrl,
  resolveGigImageurl,
} from './gigData';

function GigMetaRow({ icon: Icon, label, value }) {
  return (
    <div className="gd-meta-row">
      <dt>
        <Icon size={13} aria-hidden />
        {label}
      </dt>
      <dd>{value}</dd>
    </div>
  );
}

function GigKpi({ label, value }) {
  return (
    <article className="gd-kpi">
      <span>{label}</span>
      <strong>{value}</strong>
    </article>
  );
}

export default function GigDetailPane({ gig, loading = false, onClose }) {
  if (!gig) return null;

  const proposalCount = Array.isArray(gig.proposals) ? gig.proposals.length : 0;
  const milestoneCount = Array.isArray(gig.milestones) ? gig.milestones.length : 0;

  return (
    <section className={`um-card gd-pane${loading ? ' gd-pane--loading' : ''}`}>
      <button type="button" className="sd-pane__back" onClick={onClose}>
        <ArrowLeft size={16} aria-hidden />
        Back to Gigs
      </button>

      <header className="gd-hero">
        <div className="gd-hero__main">
          <img src={resolveGigImageurl(gig)} alt="" className="gd-pane__thumb" />
          <div className="gd-hero__copy">
            <p className="sd-pane__eyebrow">Gig drill-down</p>
            <div className="gd-hero__title-row">
              <h2>{gig.title}</h2>
              <span className={`um-status-chip ${GIG_STATUS_CLASS[gig.status]}`}>{gig.status}</span>
            </div>
            <p>{gig.category} · {gig.subCategory}</p>
          </div>
          <div className="gd-budget">
            <strong>{gig.budget}</strong>
            <span>Budget range</span>
          </div>
        </div>
        <p className="gd-desc gd-desc--hero">{gig.description}</p>
      </header>

      <div className="gd-kpis">
        <GigKpi label="Delivery" value={gig.deliveryTime} />
        <GigKpi label="Experience" value={gig.experienceLevel} />
        <GigKpi label="Proposals" value={String(proposalCount)} />
        <GigKpi label="Milestones" value={String(milestoneCount)} />
      </div>

      <div className="gd-grid">
        <article className="gd-panel">
          <h3>Seller</h3>
          <div className="gd-poster">
            <img src={posterAvatarUrl(gig)} alt="" className="gd-poster__avatar" />
            <div>
              <p className="gd-poster__label">Posted by</p>
              <strong>{displayPosterName(gig)}</strong>
              <span>{displayPosterHandle(gig)}</span>
            </div>
          </div>
          <dl className="gd-meta-list">
            <GigMetaRow icon={Calendar} label="Posted on" value={gig.postedOn} />
            <GigMetaRow icon={Globe} label="Location" value={gig.location} />
            <GigMetaRow icon={Briefcase} label="Gig type" value={gig.gigType} />
            <GigMetaRow icon={Clock} label="Delivery time" value={gig.deliveryTime} />
            <GigMetaRow icon={Tag} label="Category" value={gig.category} />
          </dl>
        </article>

        <article className="gd-panel">
          <h3>Configuration</h3>
          <h4>Skills</h4>
          <div className="gd-skills">
            {(gig.skills || []).map((skill) => (
              <span key={skill} className="um-role-pill">
                {skill}
              </span>
            ))}
          </div>
          <h4>Requirements</h4>
          <ul className="gd-list">
            {(gig.requirements || []).map((req) => (
              <li key={req}>{req}</li>
            ))}
          </ul>
          {gig.activities?.length ? (
            <>
              <h4>Recent activity</h4>
              <ul className="gd-activity">
                {gig.activities.slice(0, 4).map((item) => (
                  <li key={item.id}>
                    <p>{item.text}</p>
                    <span>{item.at}</span>
                  </li>
                ))}
              </ul>
            </>
          ) : null}
        </article>
      </div>
    </section>
  );
}
