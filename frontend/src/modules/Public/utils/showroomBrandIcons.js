import { Code2, Layers } from 'lucide-react';
import { FaGithub, FaMdb, FaNodeJs, FaReact } from 'react-icons/fa6';

/** Brand + stack icon resolver for public showrooms (fa6 + lucide fallbacks). */
const BRAND_MAP = [
  { match: /react/i, Icon: FaReact, tone: 'cyan' },
  { match: /node/i, Icon: FaNodeJs, tone: 'green' },
  { match: /mongo/i, Icon: FaMdb, tone: 'lime' },
  { match: /github/i, Icon: FaGithub, tone: 'slate' },
  { match: /tailwind/i, Icon: Layers, tone: 'sky' },
  { match: /chart/i, Icon: Code2, tone: 'violet' },
];

export const HIGHLIGHT_GLOWS = [
  { gradient: 'radial-gradient(circle at 30% 30%, #38bdf8 0%, transparent 70%)', tone: 'cyan' },
  { gradient: 'radial-gradient(circle at 30% 30%, #a78bfa 0%, transparent 70%)', tone: 'violet' },
  { gradient: 'radial-gradient(circle at 30% 30%, #4ade80 0%, transparent 70%)', tone: 'green' },
  { gradient: 'radial-gradient(circle at 30% 30%, #fbbf24 0%, transparent 70%)', tone: 'amber' },
  { gradient: 'radial-gradient(circle at 30% 30%, #f472b6 0%, transparent 70%)', tone: 'pink' },
];

export const COLLAB_GLOWS = [
  { gradient: 'radial-gradient(circle at 30% 30%, #6366f1 0%, transparent 65%)', tone: 'indigo' },
  { gradient: 'radial-gradient(circle at 30% 30%, #22d3ee 0%, transparent 65%)', tone: 'cyan' },
  { gradient: 'radial-gradient(circle at 30% 30%, #c084fc 0%, transparent 65%)', tone: 'violet' },
  { gradient: 'radial-gradient(circle at 30% 30%, #34d399 0%, transparent 65%)', tone: 'emerald' },
];

export function resolveBrandIcon(label) {
  const text = String(label || '');
  const row = BRAND_MAP.find((b) => b.match.test(text));
  return row || { Icon: Code2, tone: 'blue' };
}

export function resolvePreviewSrc(data) {
  const candidates = [
    data?.imageurl,
    data?.imageUrl,
    data?.previewImageUrl,
    data?.coverImage,
    data?.bannerUrl,
    data?.cover_preview,
  ];
  const hit = candidates.find((v) => typeof v === 'string' && v.trim().length > 0);
  return hit ? hit.trim() : '';
}
