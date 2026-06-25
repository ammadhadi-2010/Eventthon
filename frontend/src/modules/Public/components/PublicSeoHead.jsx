import React from 'react';
import { Helmet } from 'react-helmet-async';
import { buildSeoTitle, metaDescriptionFromBio } from '../utils/seoUtils';

export default function PublicSeoHead({ displayName, professionalRole, dynamicBio, canonicalPath }) {
  const title = buildSeoTitle(displayName, professionalRole);
  const description = metaDescriptionFromBio(dynamicBio);
  const origin = typeof window !== 'undefined' ? window.location.origin : '';
  const canonical = canonicalPath && origin ? `${origin}${canonicalPath}` : undefined;

  return (
    <Helmet>
      <title>{title}</title>
      <meta name="description" content={description} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:type" content="profile" />
      {canonical ? <link rel="canonical" href={canonical} /> : null}
    </Helmet>
  );
}
