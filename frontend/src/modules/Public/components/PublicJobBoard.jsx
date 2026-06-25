import React from 'react';
import { Link } from 'react-router-dom';
import { FiGlobe, FiMapPin } from 'react-icons/fi';

export default function PublicJobBoard({ data }) {
  return (
    <article className="public-job-board" itemScope itemType="https://schema.org/JobPosting">
      <header>
        <div className="public-job-badges">
          <span className="public-job-category">{data.category}</span>
          {data.remote ? (
            <span className="public-job-remote">
              <FiGlobe size={12} aria-hidden /> Remote / Global
            </span>
          ) : (
            <span className="public-job-remote">
              <FiMapPin size={12} aria-hidden /> On-site
            </span>
          )}
        </div>
        <h1 itemProp="title">{data.jobTitle}</h1>
        <p className="public-job-salary" itemProp="baseSalary">
          {data.salaryRange}
        </p>
      </header>

      <section>
        <h2>Role Summary</h2>
        <p itemProp="description">{data.summary}</p>
      </section>

      {data.skills_tags?.length > 0 && (
        <section aria-label="Skills">
          <h2>Skills</h2>
          <ul className="public-skills">
            {data.skills_tags.map((tag) => (
              <li key={tag} className="public-skill-pill">
                {tag}
              </li>
            ))}
          </ul>
        </section>
      )}

      {data.applicationRequirements?.length > 0 && (
        <section aria-label="Application requirements">
          <h2>Application Requirements</h2>
          <ul className="public-requirements">
            {data.applicationRequirements.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </section>
      )}

      <footer className="public-marketplace__cta">
        <p>Applications are handled inside the private EventThon jobs dashboard.</p>
        <Link to="/auth/login" className="public-cta">
          Sign in to Apply
        </Link>
      </footer>
    </article>
  );
}
