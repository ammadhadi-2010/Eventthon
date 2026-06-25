import React from 'react';

export default function JobsHubHeader({ title, subtitle }) {
  return (
    <header className="jh-view-header">
      <h2>{title}</h2>
      {subtitle ? <p>{subtitle}</p> : null}
    </header>
  );
}
