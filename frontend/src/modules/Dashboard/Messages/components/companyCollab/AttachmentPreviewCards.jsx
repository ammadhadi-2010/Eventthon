import React from 'react';
import {
  FiFile,
  FiFileText,
  FiFilm,
  FiImage,
  FiPackage,
  FiX,
} from 'react-icons/fi';

function formatBytes(size) {
  const n = Number(size || 0);
  if (!n) return '';
  if (n >= 1024 * 1024) return `${(n / (1024 * 1024)).toFixed(1)} MB`;
  if (n >= 1024) return `${(n / 1024).toFixed(1)} KB`;
  return `${n} B`;
}

function iconFor(type) {
  const t = String(type || '').toLowerCase();
  if (t === 'image') return FiImage;
  if (t === 'video') return FiFilm;
  if (t === 'zip') return FiPackage;
  if (t === 'pdf' || t === 'word' || t === 'excel' || t === 'resume' || t === 'portfolio') return FiFileText;
  return FiFile;
}

export default function AttachmentPreviewCards({
  items = [],
  onRemove,
  toAbsoluteUrl,
}) {
  if (!items.length) return null;
  return (
    <div className="cc-attach-grid">
      {items.map((item, idx) => {
        const type = String(item.type || item.kind || 'file').toLowerCase();
        const Icon = iconFor(type);
        const url = toAbsoluteUrl?.(item.url || item.imageurl) || item.url || item.imageurl;
        const isImage = type === 'image';
        return (
          <div key={`${item.name}-${idx}`} className={`cc-attach-card cc-attach-card--${type}`}>
            {isImage && url ? (
              <img src={url} alt="" className="cc-attach-card__thumb" />
            ) : (
              <div className="cc-attach-card__icon"><Icon size={18} /></div>
            )}
            <div className="cc-attach-card__meta">
              <strong>{item.name || `file-${idx + 1}`}</strong>
              <span>{type.toUpperCase()}{item.size ? ` · ${formatBytes(item.size)}` : ''}</span>
            </div>
            <button type="button" aria-label="Remove" onClick={() => onRemove?.(idx)}>
              <FiX size={14} />
            </button>
          </div>
        );
      })}
    </div>
  );
}
