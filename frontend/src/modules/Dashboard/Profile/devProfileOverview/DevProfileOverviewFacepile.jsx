import React from 'react';
import { API_BASE_URL } from '../../../../api/axiosConfig';

function resolveAvatar(url) {
  if (!url || typeof url !== 'string') return '';
  const v = url.trim();
  if (!v) return '';
  if (v.startsWith('http') || v.startsWith('blob:')) return v;
  return `${API_BASE_URL}${v.startsWith('/') ? v : `/${v}`}`;
}

function dicebear(seed) {
  return `https://api.dicebear.com/8.x/avataaars/svg?seed=${encodeURIComponent(seed)}`;
}

/** Up to `shown` avatar URLs: prefer `suggested` avatars, then generated. */
export function buildFacepileUrls(suggested, shown, seedPrefix) {
  const out = [];
  const list = Array.isArray(suggested) ? suggested : [];
  for (let i = 0; i < list.length && out.length < shown; i++) {
    const u = resolveAvatar(list[i]?.avatar);
    if (u) out.push(u);
  }
  let n = 0;
  while (out.length < shown) {
    out.push(dicebear(`${seedPrefix}-${n++}`));
  }
  return out.slice(0, shown);
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

export default function DevProfileOverviewFacepile({ suggested, total, shown = 7, seedPrefix = 'fp' }) {
  const urls = buildFacepileUrls(suggested, shown, seedPrefix);
  const badge = fmtRemainderBadge(total, shown);

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
