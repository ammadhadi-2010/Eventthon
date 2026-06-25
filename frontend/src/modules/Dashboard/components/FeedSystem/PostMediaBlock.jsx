import React, { useState } from 'react';
import { FiImage, FiVideo } from 'react-icons/fi';

function MediaUnavailable({ label }) {
  return (
    <div style={placeholder} role="img" aria-label={label}>
      <FiImage size={22} style={{ opacity: 0.5 }} />
      <span>{label}</span>
    </div>
  );
}

function FeedImage({ src }) {
  const [broken, setBroken] = useState(false);
  if (broken) return <MediaUnavailable label="Image preview unavailable" />;
  return (
    <img
      src={src}
      alt=""
      style={image}
      onError={() => setBroken(true)}
      loading="lazy"
    />
  );
}

function FeedVideo({ src }) {
  const [broken, setBroken] = useState(false);
  if (broken) return <MediaUnavailable label="Video preview unavailable" />;
  return (
    <video
      src={src}
      controls
      playsInline
      preload="metadata"
      style={video}
      onError={() => setBroken(true)}
    >
      <track kind="captions" />
    </video>
  );
}

export default function PostMediaBlock({ items = [] }) {
  const primary = items[0];
  if (!primary?.url) return null;

  return (
    <div style={wrapper}>
      {primary.kind === 'video' ? (
        <>
          <div style={videoBadge}>
            <FiVideo size={12} /> Video
          </div>
          <FeedVideo src={primary.url} />
        </>
      ) : (
        <FeedImage src={primary.url} />
      )}
    </div>
  );
}

const wrapper = {
  borderRadius: '12px',
  overflow: 'hidden',
  border: '1px solid rgba(255,255,255,0.08)',
  marginTop: '10px',
  background: 'rgba(15,23,42,0.6)',
  position: 'relative',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  padding: '6px',
};

const image = {
  width: '100%',
  maxWidth: '100%',
  maxHeight: '560px',
  height: 'auto',
  objectFit: 'contain',
  display: 'block',
};

const video = {
  width: '100%',
  maxHeight: '560px',
  objectFit: 'contain',
  display: 'block',
  background: '#020617',
};

const videoBadge = {
  position: 'absolute',
  top: '10px',
  left: '10px',
  zIndex: 2,
  display: 'inline-flex',
  alignItems: 'center',
  gap: '6px',
  padding: '4px 10px',
  borderRadius: '999px',
  background: 'rgba(15,23,42,0.82)',
  color: '#6ee7b7',
  fontSize: '11px',
  fontWeight: '700',
};

const placeholder = {
  marginTop: '10px',
  padding: '28px 16px',
  borderRadius: '12px',
  border: '1px dashed rgba(148,163,184,0.35)',
  background: 'rgba(15,23,42,0.45)',
  color: '#94a3b8',
  fontSize: '13px',
  fontWeight: '600',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  gap: '8px',
};
