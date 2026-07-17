import React, { useState } from 'react';
import { Building2 } from 'lucide-react';
import { leadLetterAvatar, resolveLeadImageurl } from './outreachImage';

export default function LeadCompanyAvatar({ imageurl, company }) {
  const [failed, setFailed] = useState(false);
  const src = failed ? leadLetterAvatar(company) : resolveLeadImageurl(imageurl, company);

  if (!src) {
    return (
      <span className="eo-avatar eo-avatar--fallback" aria-hidden>
        <Building2 size={16} />
      </span>
    );
  }

  return (
    <img
      src={src}
      alt=""
      className="eo-avatar"
      loading="lazy"
      onError={() => setFailed(true)}
    />
  );
}
