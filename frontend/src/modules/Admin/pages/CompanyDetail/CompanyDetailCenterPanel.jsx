import React from 'react';
import { Eye, FileText } from 'lucide-react';
import { buildCompanyVerificationDocs } from './companyDetailDocs';

export default function CompanyDetailCenterPanel({ company }) {
  const docs = buildCompanyVerificationDocs(company);
  const pending = String(company?.status || '').toLowerCase() === 'pending';
  const about =
    company?.description?.trim() ||
    'No company description has been submitted yet. Review verification documents on the right workflow panel.';

  return (
    <div className="ud-center">
      <section className="ud-card ud-section">
        <h3 className="ud-section-title">About</h3>
        <p className="ud-muted cm-detail-about">{about}</p>
        <div className="ud-tags-row">
          <span className="ud-tag">{company?.industry || 'General'}</span>
          {company?.size ? <span className="ud-tag ud-tag--green">{company.size} employees</span> : null}
          {company?.isClaimed ? <span className="ud-tag ud-tag--violet">Claimed profile</span> : null}
        </div>
      </section>

      <section className="ud-card ud-section">
        <h3 className="ud-section-title">Stats</h3>
        <div className="ud-stat-grid">
          {[
            ['Total jobs', String(company?.openJobs ?? 0)],
            ['Completed hires', String(company?.completedHires ?? 0)],
            ['Squad interactions', String(company?.squadInteractions ?? 0)],
            ['Verification', company?.isVerified ? 'Approved' : company?.status || '—'],
          ].map(([label, value]) => (
            <div key={label} className="ud-stat-cell">
              <p className="ud-stat-label">{label}</p>
              <p className="ud-stat-value">{value}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="ud-card ud-section">
        <h3 className="ud-section-title">Documents & verification</h3>
        {docs.length === 0 ? (
          <p className="ud-muted">No verification files on file.</p>
        ) : (
          <ul className="ud-doc-list">
            {docs.map((doc) => (
              <li key={doc.id} className="ud-doc-row">
                <FileText size={18} className="ud-doc-icon" aria-hidden />
                <div className="ud-doc-meta">
                  <span className="ud-doc-name">{doc.label}</span>
                  <span className="ud-doc-sub cm-mono">imageurl: {doc.imageurl}</span>
                  <span className={`ud-doc-badge ${pending ? 'ud-doc-badge--pending' : 'ud-doc-badge--ok'}`}>
                    {pending ? 'Pending review' : 'On file'}
                  </span>
                </div>
                <a
                  href={doc.viewUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="ud-doc-view"
                  title="View document"
                  data-imageurl={doc.imageurl}
                >
                  <Eye size={18} />
                </a>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
