import React from 'react';
import { resolveMediaUrl } from '../../../../components/shared/utils/resolveMediaUrl';

function resolveAvatar(url, seed = 'member') {
  const resolved = resolveMediaUrl(url || '');
  if (resolved) return resolved;
  return `https://api.dicebear.com/8.x/avataaars/svg?seed=${encodeURIComponent(seed)}`;
}

/** Up to `shown` avatar URLs from real `suggested` members only (no generated fillers). */
export function buildFacepileUrls(suggested, shown, total = 0) {
  const list = Array.isArray(suggested) ? suggested : [];
  const cap = Math.min(
    shown,
    Math.max(0, Math.floor(Number(total) || 0) || list.length),
  );
  if (cap <= 0) return [];
  const out = [];
  for (let i = 0; i < list.length && out.length < cap; i++) {
    const seed = list[i]?.name || list[i]?.id || `m${i}`;
    out.push(resolveAvatar(list[i]?.avatar, seed));
  }
  return out;
}

function fmtRemainderBadge(total, shown) {
  const t = Math.max(0, Math.floor(Number(total) || 0));
  const s = Math.min(shown, t);
  const rest = t - s;
  if (rest <= 0) return null;
  if (rest >= 1000) {
    const k = rest / 1000;
    return `+${Math.round(k)}K`;
  }
  return `+${rest}`;
}

export default function DevProfileOverviewFacepile({ suggested, total, shown = 7 }) {
  const urls = buildFacepileUrls(suggested, shown, total);
  const badge = fmtRemainderBadge(total, shown);

  if (!urls.length) {
    const n = Math.max(0, Math.floor(Number(total) || 0));
    if (n > 0) {
      return (
        <p className="dpo-muted-sm dpo-facepile-empty">
          {n} member{n === 1 ? '' : 's'} — open View All
        </p>
      );
    }
    return <p className="dpo-muted-sm dpo-facepile-empty">No members yet.</p>;
  }

  return (
    <div className="dpo-facepile">
      <div className="dpo-facepile__stack">
        {urls.map((src, i) => (
          <span key={`${src}-${i}`} className="dpo-facepile__ring">
            <img className="dpo-facepile__img" src={src} alt="" />
          </span>
        ))}
      </div>
      {badge ? <span className="dpo-facepile__badge">{badge}</span> : null}
    </div>
  );
}
