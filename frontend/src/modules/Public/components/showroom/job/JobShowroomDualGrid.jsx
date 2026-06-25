import React from 'react';
import JobShowroomMainColumn from './JobShowroomMainColumn';
import JobShowroomAside from './JobShowroomAside';

export default function JobShowroomDualGrid({ data, isGuest }) {
  const slug = data.publicSlug || data.jobId;
  return (
    <div className="ps-mp-grid">
      <JobShowroomMainColumn data={data} />
      <JobShowroomAside data={data} isGuest={isGuest} slug={slug} />
    </div>
  );
}
