import React from 'react';
import { Helmet } from 'react-helmet-async';
import { metaDescriptionFromBio } from '../utils/seoUtils';

export default function PublicShowroomSeo({
  title,
  description,
  keywords = [],
  canonicalPath,
  ogType = 'website',
  image,
  noIndex = false,
}) {
  const desc = metaDescriptionFromBio(description, 160);
  const keywordStr = keywords.filter(Boolean).join(', ');

  const origin =
    typeof window !== 'undefined' ? window.location.origin : '';

  const canonical =
    canonicalPath && origin ? `${origin}${canonicalPath}` : origin;

  // Default Open Graph Image
  const ogImage = image
    ? image.startsWith('http')
      ? image
      : `${origin}${image}`
    : `${origin}/og-default.jpg`;

  return (
    <Helmet>

      {/* =========================
          Basic SEO
      ========================== */}

      <title>{title}</title>

      <meta
        name="description"
        content={desc}
      />

      {keywordStr.length > 0 && (
        <meta
          name="keywords"
          content={keywordStr}
        />
      )}

      <meta
        name="author"
        content="EventThone Network"
      />

      <meta
        name="robots"
        content={noIndex ? 'noindex,nofollow' : 'index,follow'}
      />

      <meta
        name="theme-color"
        content="#020617"
      />

      {/* =========================
          Canonical
      ========================== */}

      {canonical && (
        <link
          rel="canonical"
          href={canonical}
        />
      )}

      {/* =========================
          Open Graph
      ========================== */}

      <meta property="og:type" content={ogType} />
      <meta property="og:site_name" content="EventThone Network" />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={desc} />
      <meta property="og:url" content={canonical} />
      <meta property="og:image" content={ogImage} />
      <meta property="og:image:alt" content={title} />

      {/* =========================
          Twitter / X
      ========================== */}

      <meta
        name="twitter:card"
        content="summary_large_image"
      />

      <meta
        name="twitter:title"
        content={title}
      />

      <meta
        name="twitter:description"
        content={desc}
      />

      <meta
        name="twitter:image"
        content={ogImage}
      />

      {/* =========================
          Mobile
      ========================== */}

      <meta
        name="viewport"
        content="width=device-width, initial-scale=1"
      />

    </Helmet>
  );
}
