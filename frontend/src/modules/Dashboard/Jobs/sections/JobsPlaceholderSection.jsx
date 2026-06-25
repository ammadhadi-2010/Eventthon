import React from 'react';

const JobsPlaceholderSection = ({ title, subtitle }) => (
  <div className="jobs-placeholder-wrap">
    <div className="gigs-card jobs-placeholder-card">
      <h2>{title}</h2>
      <p>{subtitle}</p>
    </div>
  </div>
);

export default JobsPlaceholderSection;
