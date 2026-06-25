import React from 'react';
import { Globe, Heart, Laptop, Sparkles } from 'lucide-react';
import { buildRemoteMetaTags } from './jobShowroomUtils';

const ICONS = [Globe, Laptop, Sparkles, Heart];

export default function JobRemoteMeta({ remote, tags }) {
  const meta = tags?.length ? tags : buildRemoteMetaTags(remote).map((t) => t.label);
  return (
    <div className="ps-mp-meta-tags" aria-label="Remote lifestyle benefits">
      {meta.map((label, idx) => {
        const Icon = ICONS[idx % ICONS.length];
        return (
          <span key={label} className="ps-mp-meta-tag">
            <Icon size={11} aria-hidden />
            {label}
          </span>
        );
      })}
    </div>
  );
}
