import React, { useEffect, useMemo, useState } from 'react';
import { Play } from 'lucide-react';
import { API_BASE_URL } from '../../../../../api/axiosConfig';
import { resolvePreviewSrc } from '../../../utils/showroomBrandIcons';

const GIG_PREVIEW_FALLBACK =
  'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=1200&q=80';

function normalizeImageUrl(url) {
  if (!url || typeof url !== 'string') return '';
  const trimmed = url.trim();
  if (!trimmed) return '';
  if (trimmed.startsWith('http') || trimmed.startsWith('data:')) return trimmed;
  if (trimmed.startsWith('/')) return `${API_BASE_URL}${trimmed}`;
  return `${API_BASE_URL}/${trimmed}`;
}

export default function GigShowroomPreview({ data }) {
  const imageurl = useMemo(() => normalizeImageUrl(resolvePreviewSrc(data)), [data]);
  const [src, setSrc] = useState(() => imageurl || GIG_PREVIEW_FALLBACK);

  useEffect(() => {
    setSrc(imageurl || GIG_PREVIEW_FALLBACK);
  }, [imageurl]);

  const handleError = () => {
    setSrc((current) => (current === GIG_PREVIEW_FALLBACK ? '' : GIG_PREVIEW_FALLBACK));
  };

  return (
    <div className="ps-mp-preview w-full lg:w-[62%] h-auto" aria-label="Service preview">
      {src ? (
        <img src={src} alt="" onError={handleError} />
      ) : (
        <div className="ps-mp-preview__mock">
          <div className="ps-mp-preview__mock-bars">
            <span />
            <span />
            <span />
          </div>
          <div className="ps-mp-preview__mock-chart" />
        </div>
      )}
      <span className="ps-mp-live-btn">
        <Play size={12} fill="currentColor" aria-hidden />
        Live Preview
      </span>
    </div>
  );
}
