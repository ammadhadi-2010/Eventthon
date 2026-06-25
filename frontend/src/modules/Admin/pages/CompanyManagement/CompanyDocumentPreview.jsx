import React from 'react';
import { ExternalLink, FileText } from 'lucide-react';
import { resolveCompanyImageurl } from './companyImage';

function isPdfPath(imageurl) {
  return /\.pdf(\?|$)/i.test(String(imageurl || ''));
}

function isImagePath(imageurl) {
  return /\.(png|jpe?g|gif|webp)(\?|$)/i.test(String(imageurl || ''));
}

/** Scrollable proof viewer — reads the exact key `imageurl`. */
export default function CompanyDocumentPreview({ imageurl }) {
  const raw = String(imageurl || '').trim();
  if (!raw) {
    return (
      <div className="cm-doc-preview cm-doc-preview--empty">
        <FileText size={32} strokeWidth={1.5} aria-hidden />
        <p>No verification document uploaded.</p>
      </div>
    );
  }

  const src = resolveCompanyImageurl(raw);
  const pdf = isPdfPath(raw);

  return (
    <div className="cm-doc-preview" data-imageurl={raw}>
      <div className="cm-doc-preview__scroll">
        {pdf ? (
          <iframe title="Verification document" src={src} className="cm-doc-preview__frame" />
        ) : isImagePath(raw) ? (
          <img src={src} alt="Verification proof" className="cm-doc-preview__image" />
        ) : (
          <iframe title="Verification document" src={src} className="cm-doc-preview__frame" />
        )}
      </div>
      <a href={src} target="_blank" rel="noopener noreferrer" className="cm-doc-preview__open">
        <ExternalLink size={14} aria-hidden />
        Open full document
      </a>
    </div>
  );
}
