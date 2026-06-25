import React from 'react';
import { Check } from 'lucide-react';
import ShowroomStackTag from '../ShowroomStackTag';
import JobCompanyBanner from './JobCompanyBanner';
import JobRequirements from './JobRequirements';

const FALLBACK_REQUIREMENTS = [
  'Production experience with the listed tech stack and shipping cadence.',
  'Strong written communication for async, remote-first collaboration.',
  'Portfolio or work samples demonstrating measurable product outcomes.',
  'Ability to work across time zones with global stakeholders.',
];

export default function JobShowroomMainColumn({ data }) {
  const tags = data.skills_tags || [];
  const functional = data.functionalRequirements?.length
    ? data.functionalRequirements
    : FALLBACK_REQUIREMENTS;

  return (
    <div className="ps-mp-grid__main">
      <JobCompanyBanner data={data} />
      <section className="ps-mp-card">
        <h2>Role Overview</h2>
        <div className="ps-mp-prose">
          <p>{data.summary}</p>
          {data.longDescription ? <p>{data.longDescription}</p> : null}
        </div>
      </section>
      <section className="ps-mp-card">
        <h2>Functional Requirements</h2>
        <ul className="ps-mp-requirements">
          {functional.map((item) => (
            <li key={item}>
              <Check size={14} aria-hidden />
              {item}
            </li>
          ))}
        </ul>
        <div className="ps-tag-row ps-job-skill-tags">
          {tags.map((tag) => (
            <ShowroomStackTag key={tag} label={tag} />
          ))}
        </div>
      </section>
      <JobRequirements requirements={data.applicationRequirements} />
    </div>
  );
}
