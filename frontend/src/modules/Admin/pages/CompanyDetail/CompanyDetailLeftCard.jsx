import React from 'react';
import { FiCheck } from 'react-icons/fi';
import { resolveCompanyImageurl } from '../CompanyManagement/companyImage';

function statusLabel(status, verified) {
  const code = String(status || '').toLowerCase();
  if (verified || code === 'active') return { text: 'Active', className: 'ud-status-pill--ok' };
  if (code === 'pending') return { text: 'Pending', className: 'ud-status-pill--muted' };
  if (code === 'rejected') return { text: 'Rejected', className: 'ud-status-pill--bad' };
  return { text: 'Inactive', className: 'ud-status-pill--muted' };
}

export default function CompanyDetailLeftCard({ company }) {
  const st = statusLabel(company?.status, company?.isVerified);
  const location = [company?.location, company?.country].filter(Boolean).join(', ') || '—';

  return (
    <aside className="ud-card ud-left">
      <div className="ud-avatar-wrap">
        <img
          src={resolveCompanyImageurl(company?.imageurl, company?.name)}
          alt=""
          className="ud-avatar cm-detail-logo"
        />
        <span className={`ud-status-pill ${st.className}`}>{st.text}</span>
      </div>

      <div className="ud-name-block">
        <h2 className="ud-name">
          {company?.name || 'Company'}
          {company?.isVerified ? (
            <span className="ud-verified" title="Verified">
              <FiCheck strokeWidth={3} />
            </span>
          ) : null}
        </h2>
        {company?.tagline ? <p className="ud-handle">{company.tagline}</p> : null}
        <span className="ud-tag ud-tag--violet">{company?.industry || 'General'}</span>
      </div>

      <dl className="ud-meta-list">
        <div className="ud-meta-row">
          <dt>Company ID</dt>
          <dd>{company?.publicId || company?.id || '—'}</dd>
        </div>
        <div className="ud-meta-row">
          <dt>Contact email</dt>
          <dd>{company?.contactEmail || '—'}</dd>
        </div>
        <div className="ud-meta-row">
          <dt>Website</dt>
          <dd>{company?.website || '—'}</dd>
        </div>
        <div className="ud-meta-row">
          <dt>Location</dt>
          <dd>{location}</dd>
        </div>
        <div className="ud-meta-row">
          <dt>Joined</dt>
          <dd>{company?.joined || '—'}</dd>
        </div>
        <div className="ud-meta-row">
          <dt>Submitted</dt>
          <dd>{company?.submittedOn || '—'}</dd>
        </div>
      </dl>
    </aside>
  );
}
