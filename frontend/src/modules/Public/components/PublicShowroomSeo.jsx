import React from 'react';
import { Helmet } from 'react-helmet-async';
import { metaDescriptionFromBio } from '../utils/seoUtils';

export default function PublicShowroomSeo({
  title,
  description,
  keywords = [],
  canonicalPath,
  ogType = 'website',
}) {
  const desc = metaDescriptionFromBio(description, 160);
  const keywordStr = keywords.filter(Boolean).join(', ');
  const origin = typeof window !== 'undefined' ? window.location.origin : '';
  const canonical = canonicalPath && origin ? `${origin}${canonicalPath}` : undefined;

  return (
    <Helmet>
      <title>{title}</title>
      <meta name="description" content={desc} />
      {keywordStr ? <meta name="keywords" content={keywordStr} /> : null}
      <meta property="og:title" content={title} />
      <meta property="og:description" content={desc} />
      <meta property="og:type" content={ogType} />
      {canonical ? <link rel="canonical" href={canonical} /> : null}
    </Helmet>
  );
}
