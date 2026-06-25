import React from 'react';

export function CompanyCoverBannerPreview({ src }) {
  if (!src) return null;
  return (
    <div className="cp-settings-cover-preview" aria-hidden={false}>
      <img src={src} alt="Cover Banner Preview" />
      <span className="cp-settings-preview-badge">Live Banner Preview</span>
    </div>
  );
}

export function CompanyLogoPreview({ src }) {
  if (!src) return null;
  return (
    <div className="cp-settings-logo-preview" aria-hidden={false}>
      <img src={src} alt="Logo Preview" />
    </div>
  );
}
