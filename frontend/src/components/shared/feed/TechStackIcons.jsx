import React from 'react';
import {
  SiJavascript,
  SiMongodb,
  SiNextdotjs,
  SiNodedotjs,
  SiPython,
  SiReact,
  SiTailwindcss,
  SiTypescript,
} from 'react-icons/si';

const TECH_MAP = {
  react: SiReact,
  node: SiNodedotjs,
  nodedotjs: SiNodedotjs,
  javascript: SiJavascript,
  js: SiJavascript,
  typescript: SiTypescript,
  ts: SiTypescript,
  mongodb: SiMongodb,
  mongo: SiMongodb,
  python: SiPython,
  next: SiNextdotjs,
  nextjs: SiNextdotjs,
  tailwind: SiTailwindcss,
};

function normalizeKey(raw) {
  return String(raw || '')
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '');
}

/** Renders a row of tech brand icons for feed placeholders (props-driven, reusable). */
export default function TechStackIcons({ stack = [], className = '', max = 6, size = 'md' }) {
  const keys = (Array.isArray(stack) ? stack : []).map(normalizeKey).filter(Boolean);
  const seen = new Set();
  const icons = [];
  for (const k of keys) {
    if (seen.has(k) || icons.length >= max) continue;
    const Cmp = TECH_MAP[k];
    if (Cmp) {
      seen.add(k);
      icons.push({ key: k, Cmp });
    }
  }
  const sizeMod = size === 'sm' ? 'esh-tech-icons--sm' : '';
  if (!icons.length) {
    return (
      <div
        className={['esh-tech-icons esh-tech-icons--empty', sizeMod, className].filter(Boolean).join(' ')}
        aria-hidden
      >
        <SiReact title="React" className="esh-tech-icons__ico" />
        <SiNodedotjs title="Node" className="esh-tech-icons__ico" />
        <SiTypescript title="TypeScript" className="esh-tech-icons__ico" />
      </div>
    );
  }
  return (
    <div className={['esh-tech-icons', sizeMod, className].filter(Boolean).join(' ')} aria-hidden>
      {icons.map(({ key, Cmp }) => (
        <Cmp key={key} className="esh-tech-icons__ico" title={key} />
      ))}
    </div>
  );
}
