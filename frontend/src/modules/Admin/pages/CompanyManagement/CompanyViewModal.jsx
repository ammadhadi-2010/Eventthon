import React, { useEffect, useMemo, useState } from 'react';
import { X } from 'lucide-react';
import { resolveCompanyImageurl } from './companyImage';
import CompanyDocumentPreview from './CompanyDocumentPreview';
import { buildCompanyProofDocument } from './companyViewUtils';

export default function CompanyViewModal({ companyId, initialRow, open, onClose, onFetch }) {
  const [row, setRow] = useState(null);
  const [loading, setLoading] = useState(false);
  const proofDoc = useMemo(
    () => (row ? buildCompanyProofDocument(row) : { imageurl: '' }),
    [row],
  );

  useEffect(() => {
    if (!open || !companyId) {
      setRow(null);
      return undefined;
    }
    setRow(initialRow || null);
    let cancelled = false;
    (async () => {
      setLoading(true);
      const data = await onFetch(companyId);
      if (!cancelled) {
        setRow(data || initialRow || null);
        setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [open, companyId, onFetch, initialRow]);

  if (!open) return null;

  return (
    <div className="jm-modal-overlay cm-view-overlay" role="dialog" aria-modal="true" aria-label="Company details">
      <button type="button" className="jm-modal-overlay__backdrop" onClick={onClose} aria-label="Close" />
      <div className="jm-modal gigs-card cm-view-modal">
        <header className="jm-modal__head">
          <div className="cm-modal__title-row">
            {row ? (
              <img src={resolveCompanyImageurl(row.imageurl, row.name)} alt="" className="cm-modal-logo" />
            ) : null}
            <div>
              <h2>{row?.name || 'Company'}</h2>
              <p>{row?.industry || '—'}</p>
            </div>
          </div>
          <button type="button" className="jm-modal__close" onClick={onClose} aria-label="Close">
            <X size={18} />
          </button>
        </header>
        {loading && !row ? <p className="jm-modal__loading">Loading…</p> : null}
        {!loading && !row ? (
          <p className="jm-modal__loading">Could not load company details.</p>
        ) : null}
        {row ? (
          <>
            <dl className="jm-detail-grid cm-view-grid">
              <div><dt>Location</dt><dd>{row.location || '—'}</dd></div>
              <div><dt>Country</dt><dd>{row.country || '—'}</dd></div>
              <div><dt>Website</dt><dd>{row.website || '—'}</dd></div>
              <div><dt>Size</dt><dd>{row.size || '—'}</dd></div>
              <div><dt>Registration #</dt><dd>{row.registrationNumber || '—'}</dd></div>
              <div><dt>Tax ID</dt><dd>{row.taxId || '—'}</dd></div>
              <div><dt>Open jobs</dt><dd>{row.openJobs ?? 0}</dd></div>
              <div><dt>Status</dt><dd>{row.status}</dd></div>
              <div><dt>Claimed</dt><dd>{row.isClaimed ? 'Yes' : 'No'}</dd></div>
              <div><dt>Verified</dt><dd>{row.isVerified ? 'Yes' : 'No'}</dd></div>
              <div><dt>Contact</dt><dd>{row.contactEmail || '—'}</dd></div>
              <div className="cm-view-grid__full">
                <dt>Review message</dt>
                <dd>{row.verificationMessage || '—'}</dd>
              </div>
            </dl>
            <section className="cm-doc-section" aria-label="Verification document preview">
              <h3 className="cm-doc-section__title">Verification document (imageurl)</h3>
              <CompanyDocumentPreview imageurl={proofDoc.imageurl} />
            </section>
          </>
        ) : null}
        {loading && row ? <p className="jm-modal__loading">Refreshing details…</p> : null}
      </div>
    </div>
  );
}
