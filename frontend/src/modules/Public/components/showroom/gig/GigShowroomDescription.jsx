import React from 'react';
import { GIG_DELIVERABLES } from './gigShowroomUtils';

export default function GigShowroomDescription({ description, deliverables }) {
  const files = deliverables?.length ? deliverables : GIG_DELIVERABLES;
  return (
    <section className="ps-mp-card">
      <h2>About This Service</h2>
      <div className="ps-mp-prose">
        <p>{description}</p>
        <p>
          Every order includes structured milestones, revision windows, and marketplace escrow
          protection so you receive production-ready assets on schedule.
        </p>
      </div>
      <h3 style={{ marginTop: '1rem', fontSize: '0.85rem' }}>Deliverables</h3>
      <div className="ps-mp-deliverables">
        {files.map((type) => (
          <span key={type} className="ps-mp-deliverable">
            {type}
          </span>
        ))}
      </div>
    </section>
  );
}
