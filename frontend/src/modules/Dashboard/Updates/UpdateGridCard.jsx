import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { FiAward, FiHeart, FiMapPin, FiMessageCircle, FiBriefcase, FiClock } from 'react-icons/fi';

function AuthorRow({ item }) {
  const [broken, setBroken] = useState(false);
  const initial = item.authorName.charAt(0).toUpperCase();

  return (
    <div className="flex w-full items-start gap-2.5">
      <div className="upd-grid-card__author-avatar shrink-0">
        {item.authorImageurl && !broken ? (
          <img src={item.authorImageurl} alt={item.authorName} onError={() => setBroken(true)} loading="lazy" />
        ) : (
          <span>{initial}</span>
        )}
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex w-full items-center justify-between gap-1.5">
          <strong className="truncate text-[13px] font-semibold text-slate-100">
            {item.authorName}
          </strong>
        </div>
        <span className="block truncate text-[11px] text-slate-400">
          {item.authorTitle}
        </span>
      </div>
    </div>
  );
}

function CardMedia({ item }) {
  const [broken, setBroken] = useState(false);
  const layout = item.theme.layout;
  const imageClass = 'upd-grid-card__media w-full rounded-md object-cover';

  if (layout === 'badge') {
    return (
      <div className="upd-grid-card__badge" aria-hidden>
        <FiAward />
      </div>
    );
  }

  if (layout === 'icon') {
    return (
      <div className="upd-grid-card__job-meta">
        <div><FiMapPin /> {item.jobLocation}</div>
        <div><FiBriefcase /> {item.jobType}</div>
        <div><FiClock /> {item.jobExperience}</div>
      </div>
    );
  }

  if (item.imageurl && !broken) {
    const round = layout === 'round';
    return (
      <img
        src={item.imageurl}
        alt=""
        className={round ? 'upd-grid-card__media-round' : imageClass}
        onError={() => setBroken(true)}
        loading="lazy"
      />
    );
  }

  return (
    <div className="upd-grid-card__media-fallback">
      {item.theme.label}
    </div>
  );
}

export default function UpdateGridCard({ item, listMode = false }) {
  const actionTo = item.actionUrl || '/dashboard';

  const cardClass = listMode
    ? `upd-grid-card upd-update-card upd-grid-card--${item.type} is-list`
    : [
      'upd-grid-card upd-update-card',
      `upd-grid-card--${item.type}`,
      'max-lg:flex max-lg:w-full max-lg:flex-col',
      'lg:max-h-none',
    ].join(' ');

  return (
    <article className={cardClass}>
      <div className="upd-update-card__body flex min-h-0 flex-1 flex-col gap-2.5 max-lg:gap-2 lg:h-auto">
        <div
          className="upd-grid-card__head m-0 shrink-0 p-0 text-[10px] font-extrabold leading-none tracking-wide"
          style={{ color: item.theme.color }}
        >
          <span>{item.theme.label}</span>
          <time>{item.timeAgo}</time>
        </div>

        <AuthorRow item={item} />

        <h3 className="m-0 shrink-0 p-0 text-[15px] font-semibold leading-snug text-slate-100 max-lg:line-clamp-2 max-lg:text-[15px] lg:line-clamp-none">
          {item.title}
        </h3>

        {item.message ? (
          <p className="m-0 shrink-0 p-0 text-slate-400 max-lg:line-clamp-2 max-lg:text-[13px] max-lg:leading-snug lg:line-clamp-none lg:text-base lg:leading-normal">
            {item.message}
          </p>
        ) : null}

        <div className="upd-update-card__media-wrap m-0 w-full shrink-0 overflow-hidden p-0">
          <CardMedia item={item} />
        </div>
      </div>

      <footer className="upd-grid-card__footer m-0 mt-auto shrink-0 p-0">
        <div className="upd-grid-card__stats max-lg:gap-3 max-lg:text-[12px]">
          <span><FiHeart /> {item.likesCount}</span>
          <span><FiMessageCircle /> {item.commentsCount}</span>
        </div>
        <Link to={actionTo} className="upd-grid-card__action max-lg:text-[12px]">
          {item.actionLabel} →
        </Link>
      </footer>
    </article>
  );
}
