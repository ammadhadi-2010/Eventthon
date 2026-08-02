import React, { useState } from 'react';
import { resolveMediaUrl } from '../../../../components/shared/utils/resolveMediaUrl';
import { resolveCompanyLogoUrl } from '../utils/resolveCompanyLogoUrl';

/** Company / opportunity logo for every Jobs hub row. */
export default function JobCompanyLogo({
  imageurl = '',
  company = '',
  logoText = '',
  logoClass = '',
  listingKind = '',
  alertKind = '',
  shade = 'electric',
  className = '',
  size,
}) {
  const [broken, setBroken] = useState(false);
  const raw = resolveCompanyLogoUrl({
    imageurl,
    company,
    logoClass,
    logoText,
    listingKind,
    alertKind,
  });
  const src = resolveMediaUrl(raw) || raw;
  const showImage = Boolean(src) && !broken;
  const initial = (logoText || company || 'J').toString().trim().slice(0, 2).toUpperCase() || 'J';
  const style = size ? { width: size, height: size } : undefined;

  if (showImage) {
    return (
      <img
        className={`gigs-company-logo gigs-company-logo--image jobs-job-logo ${className}`.trim()}
        src={src}
        alt=""
        style={style}
        onError={() => setBroken(true)}
      />
    );
  }

  return (
    <div
      className={`gigs-company-logo jobs-job-logo jobs-job-logo--${shade} ${className}`.trim()}
      style={style}
      aria-hidden
    >
      {initial}
    </div>
  );
}
