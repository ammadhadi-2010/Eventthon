import React from 'react';
import { Check } from 'lucide-react';

export default function JobRequirements({ requirements }) {
  if (!requirements?.length) return null;
  return (
    <section className="ps-mp-card">
      <h2>Application Requirements</h2>
      <ul className="ps-mp-requirements" style={{ listStyle: 'none', margin: 0, padding: 0 }}>
        {requirements.map((item) => (
          <li key={item}>
            <Check size={14} aria-hidden />
            {item}
          </li>
        ))}
      </ul>
    </section>
  );
}
