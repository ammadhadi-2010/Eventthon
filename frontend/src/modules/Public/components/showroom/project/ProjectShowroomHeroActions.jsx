import React, { useState } from 'react';
import { FiBookmark, FiExternalLink, FiShare2 } from 'react-icons/fi';
import { FaGithub } from 'react-icons/fa6';

function resolveGithubUrl(data) {
  if (data?.githubUrl) return data.githubUrl;
  const link = (data?.publicPortfolioLinks || []).find((item) =>
    /github/i.test(item?.label || item?.url || ''),
  );
  return link?.url || '';
}

function resolveVisitUrl(data) {
  return data?.visitSiteUrl || data?.livePreviewUrl || '#';
}

export default function ProjectShowroomHeroActions({ data }) {
  const [saved, setSaved] = useState(false);
  const preview = data?.livePreviewUrl || data?.visitSiteUrl || '#';
  const site = resolveVisitUrl(data);
  const github = resolveGithubUrl(data);

  const onShare = async () => {
    const url = typeof window !== 'undefined' ? window.location.href : preview;
    try {
      if (navigator.share) {
        await navigator.share({ title: data?.projectName, url });
        return;
      }
      await navigator.clipboard.writeText(url);
    } catch {
      /* user cancelled */
    }
  };

  return (
    <div className="ps-hero__actions" role="group" aria-label="Project actions">
      <a
        href={preview}
        className="ps-btn ps-btn--primary ps-btn--action"
        target="_blank"
        rel="noopener noreferrer"
      >
        <FiExternalLink size={15} aria-hidden />
        Live Preview
      </a>
      <a
        href={site}
        className="ps-btn ps-btn--surface ps-btn--action"
        target="_blank"
        rel="noopener noreferrer"
      >
        <FiExternalLink size={15} aria-hidden />
        Visit Site
      </a>
      <a
        href={github || '#'}
        className="ps-btn ps-btn--square"
        target={github ? '_blank' : undefined}
        rel={github ? 'noopener noreferrer' : undefined}
        aria-label="GitHub"
        onClick={!github ? (e) => e.preventDefault() : undefined}
      >
        <FaGithub size={18} />
      </a>
      <button type="button" className="ps-btn ps-btn--surface ps-btn--action" onClick={onShare}>
        <FiShare2 size={15} aria-hidden />
        Share
      </button>
      <button
        type="button"
        className={`ps-btn ps-btn--square${saved ? ' is-saved' : ''}`}
        aria-label={saved ? 'Saved' : 'Save project'}
        aria-pressed={saved}
        onClick={() => setSaved((v) => !v)}
      >
        <FiBookmark size={17} aria-hidden />
      </button>
    </div>
  );
}
