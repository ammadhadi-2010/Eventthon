import React, { useState } from 'react';
import { LayoutDashboard } from 'lucide-react';
import { resolvePreviewSrc } from '../../../utils/showroomBrandIcons';

export default function ProjectShowroomPreviewCard({ data }) {
  const src = resolvePreviewSrc(data);
  const [broken, setBroken] = useState(false);
  const showImage = Boolean(src) && !broken;

  return (
    <div className="ps-preview-card" aria-label="Project preview presentation">
      {showImage ? (
        <img
          className="ps-preview-card__img"
          src={src}
          alt=""
          onError={() => setBroken(true)}
        />
      ) : (
        <div className="ps-preview-card__fallback">
          <div className="ps-preview-card__glow" aria-hidden />
          <LayoutDashboard size={42} strokeWidth={1.25} className="ps-preview-card__glyph" aria-hidden />
          <div className="ps-preview-card__bars" aria-hidden>
            <span />
            <span />
            <span />
          </div>
          <p>System preview · {data.projectName || 'Project'}</p>
        </div>
      )}
    </div>
  );
}
