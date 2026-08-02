import React, { useMemo, useState } from 'react';
import { FiBriefcase, FiMapPin, FiClock } from 'react-icons/fi';
import FooterPageShell from '../components/FooterPageShell';
import PageHero from '../components/PageHero';
import useCompanyFooterContent from '../hooks/useCompanyFooterContent';
import {
  CAREERS_APPLY_EMAIL,
  CAREERS_SUBTITLE,
  DEPARTMENTS,
  JOBS,
  formatEventThonJobTitle,
} from '../data/careersData';
import '../styles/careers.css';

export default function Careers() {
  const { data, loading } = useCompanyFooterContent('Careers');
  const page = data || {
    jobs: JOBS,
    departments: DEPARTMENTS,
    subtitle: CAREERS_SUBTITLE,
  };
  const [dept, setDept] = useState('All');

  const jobs = useMemo(
    () =>
      (page.jobs || []).map((job) => ({
        ...job,
        title: formatEventThonJobTitle(job.title || job.roleName),
      })),
    [page.jobs],
  );

  const filtered = dept === 'All' ? jobs : jobs.filter((j) => j.dept === dept);

  const applyFor = (job) => {
    if (job.applyUrl) {
      window.open(job.applyUrl, '_blank', 'noopener,noreferrer');
      return;
    }
    const subject = encodeURIComponent(`Application: ${job.title}`);
    window.location.href = `mailto:${CAREERS_APPLY_EMAIL}?subject=${subject}`;
  };

  return (
    <FooterPageShell variant="company">
      <PageHero title="Careers at EventThon" subtitle={page.subtitle || CAREERS_SUBTITLE} />

      <section className="fp-card careers-banner" aria-label="EventThon hiring notice">
        <p className="careers-banner__eyebrow">EventThon · Company hiring</p>
        <h2 className="careers-banner__title">Join the team building EventThon</h2>
        <p className="careers-banner__text">
          This page lists only EventThon’s own open roles — Frontend, Backend, Design, and other
          positions on the EventThon company team. Marketplace gigs and client jobs are not listed
          here.
        </p>
      </section>

      {loading ? <p className="fp-body-text">Loading roles…</p> : null}

      <div className="careers-filters" role="tablist" aria-label="Filter by department">
        {(page.departments || DEPARTMENTS).map((d) => (
          <button
            key={d}
            type="button"
            role="tab"
            aria-selected={dept === d}
            className={`careers-filter${dept === d ? ' is-active' : ''}`}
            onClick={() => setDept(d)}
          >
            {d}
          </button>
        ))}
      </div>

      {filtered.length ? (
        <div className="careers-list">
          {filtered.map((job) => (
            <article key={job.id} className="fp-card careers-job">
              <div className="careers-job__main">
                <p className="careers-job__company">EventThon</p>
                <h3 className="careers-job__title">{job.title}</h3>
                <div className="careers-job__meta">
                  <span>
                    <FiBriefcase size={13} aria-hidden /> {job.dept}
                  </span>
                  <span>
                    <FiMapPin size={13} aria-hidden /> {job.location}
                  </span>
                  {job.type ? (
                    <span>
                      <FiClock size={13} aria-hidden /> {job.type}
                    </span>
                  ) : null}
                </div>
                {job.summary ? <p className="careers-job__summary">{job.summary}</p> : null}
              </div>
              <button type="button" className="careers-job__apply" onClick={() => applyFor(job)}>
                Apply to EventThon
              </button>
            </article>
          ))}
        </div>
      ) : (
        <div className="fp-card careers-empty">
          <p>No open EventThon roles in this department right now. Check back soon.</p>
        </div>
      )}
    </FooterPageShell>
  );
}
