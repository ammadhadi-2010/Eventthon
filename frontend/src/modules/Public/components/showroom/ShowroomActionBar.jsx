import React from 'react';
import { Link } from 'react-router-dom';
import { FiCopy, FiEdit3, FiGlobe } from 'react-icons/fi';
import useCopyPublicLink from '../../hooks/useCopyPublicLink';

export default function ShowroomActionBar({ publicPath, managePath, canManage, badge = 'Public Project' }) {
  const { copied, copyLink } = useCopyPublicLink();

  return (
    <div className="ps-action-bar">
      <span className="ps-public-badge">
        <FiGlobe size={12} aria-hidden />
        {badge}
      </span>
      {canManage ? (
        <div className="ps-action-bar__controls">
          <button type="button" className="ps-btn ps-btn--ghost" onClick={() => copyLink(publicPath)}>
            <FiCopy size={14} aria-hidden />
            {copied ? 'Copied!' : 'Copy Public Link'}
          </button>
          {managePath ? (
            <Link to={managePath} className="ps-btn ps-btn--ghost">
              <FiEdit3 size={14} aria-hidden />
              Edit Layout
            </Link>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
