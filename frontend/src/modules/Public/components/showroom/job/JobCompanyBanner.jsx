import React from 'react';
import { Building2, MapPin } from 'lucide-react';

export default function JobCompanyBanner({ data }) {
  const company = data.companyName || 'EventThon Global';
  const initial = company.charAt(0).toUpperCase();
  const location = data.location || (data.remote ? 'Remote / Worldwide' : 'Hybrid · Global');

  return (
    <div className="ps-mp-company">
      <div
        className="ps-mp-company__logo"
        style={{ background: data.companyColor || undefined }}
        aria-hidden
      >
        {initial}
      </div>
      <div>
        <p className="ps-eyebrow" style={{ margin: 0 }}>
          <Building2 size={12} style={{ display: 'inline', verticalAlign: 'middle' }} /> Hiring Company
        </p>
        <strong style={{ display: 'block', fontSize: '1rem' }}>{company}</strong>
        <p style={{ margin: '0.25rem 0 0', fontSize: '0.78rem', color: '#94a3b8' }}>
          <MapPin size={12} style={{ display: 'inline' }} /> {location}
          {data.employmentType ? ` · ${data.employmentType}` : ''}
        </p>
      </div>
    </div>
  );
}
