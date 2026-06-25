import React from 'react';
import { BadgeCheck } from 'lucide-react';
import ShowroomStackTag from '../ShowroomStackTag';
import ProjectShowroomPreviewCard from './ProjectShowroomPreviewCard';
import ProjectShowroomHeroActions from './ProjectShowroomHeroActions';

export default function ProjectShowroomHero({ data, canManage }) {
  return (
    <section className="ps-hero" aria-labelledby="project-showroom-title">
      <div className="ps-hero__visual">
        <ProjectShowroomPreviewCard data={data} />
      </div>
      <div className="ps-hero__copy">
        <p className="ps-eyebrow">{data.category}</p>
        <h1 id="project-showroom-title">
          {data.projectName}
          <BadgeCheck size={22} className="ps-verified-icon" aria-label="Verified project" />
        </h1>
        <p className="ps-lead">{data.summary}</p>
        <div className="ps-tag-row">
          {(data.techStackTags || []).map((tag) => (
            <ShowroomStackTag key={tag} label={tag} />
          ))}
        </div>
        <ProjectShowroomHeroActions data={data} />
        {canManage ? <p className="ps-manage-hint">Owner preview — visitors see the guest CTA below.</p> : null}
      </div>
    </section>
  );
}
