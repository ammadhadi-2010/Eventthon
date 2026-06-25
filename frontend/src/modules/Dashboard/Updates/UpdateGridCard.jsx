import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { FiAward, FiHeart, FiMapPin, FiMessageCircle, FiBriefcase, FiClock } from 'react-icons/fi';

function AuthorRow({ item }) {
  const [broken, setBroken] = useState(false);
  const initial = item.authorName.charAt(0).toUpperCase();

  return (
    <div className="flex w-full items-start gap-1.5 lg:gap-2.5">
      <div className="upd-grid-card__author-avatar max-lg:h-6 max-lg:w-6 shrink-0">
        {item.authorImageurl && !broken ? (
          <img src={item.authorImageurl} alt={item.authorName} onError={() => setBroken(true)} loading="lazy" />
        ) : (
          <span>{initial}</span>
        )}
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex w-full items-center justify-between gap-1.5">
          <strong className="truncate text-[13px] font-semibold text-slate-100 max-lg:text-[12px] lg:text-[13px]">
            {item.authorName}
          </strong>
        </div>
        <span className="block truncate text-[10px] text-slate-400 lg:text-[11px]">
          {item.authorTitle}
        </span>
      </div>
    </div>
  );
}

function CardMedia({ item }) {
  const [broken, setBroken] = useState(false);
  const layout = item.theme.layout;
  const imageClass = 'upd-grid-card__media w-full rounded-md max-lg:max-h-[3.2rem] max-lg:object-cover';

  if (layout === 'badge') {
    return (
      <div className="upd-grid-card__badge max-lg:max-h-[3.2rem] max-lg:min-h-0 max-lg:py-1" aria-hidden>
        <FiAward className="max-lg:h-4 max-lg:w-4" />
      </div>
    );
  }

  if (layout === 'icon') {
    return (
      <div className="upd-grid-card__job-meta max-lg:gap-0.5 max-lg:text-[9px] max-lg:leading-tight">
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
        className={round ? 'upd-grid-card__media-round max-lg:h-7 max-lg:w-7' : imageClass}
        onError={() => setBroken(true)}
        loading="lazy"
      />
    );
  }

  return (
    <div className="upd-grid-card__media-fallback max-lg:max-h-[3.2rem] max-lg:min-h-0 max-lg:py-1 max-lg:text-[10px]">
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
      'max-lg:flex max-lg:max-h-[calc((100dvh-11.5rem)/2)] max-lg:flex-col max-lg:justify-between',
      'max-lg:overflow-hidden max-lg:px-1.5 max-lg:pt-1 max-lg:pb-1.5',
      'lg:max-h-none',
    ].join(' ');

  return (
    <article className={cardClass}>
      <div className="upd-update-card__body flex min-h-0 flex-1 flex-col gap-0 max-lg:gap-0 lg:gap-2.5 lg:h-auto max-lg:overflow-hidden">
        <div
          className="upd-grid-card__head m-0 shrink-0 p-0 text-[10px] font-extrabold leading-none tracking-wide max-lg:mb-0.5"
          style={{ color: item.theme.color }}
        >
          <span>{item.theme.label}</span>
          <time>{item.timeAgo}</time>
        </div>

        <AuthorRow item={item} />

        <h3 className="m-0 shrink-0 p-0 text-[15px] font-semibold leading-snug text-slate-100 max-lg:line-clamp-1 max-lg:text-[13px] lg:line-clamp-none">
          {item.title}
        </h3>

        {item.message ? (
          <p className="m-0 shrink-0 p-0 text-slate-400 max-lg:line-clamp-1 max-lg:text-[13px] max-lg:leading-snug lg:line-clamp-none lg:text-base lg:leading-normal">
            {item.message}
          </p>
        ) : null}

        <div className="upd-update-card__media-wrap m-0 w-full shrink-0 overflow-hidden p-0">
          <CardMedia item={item} />
        </div>
      </div>

      <footer className="upd-grid-card__footer m-0 mt-auto shrink-0 p-0 max-lg:pt-0.5">
        <div className="upd-grid-card__stats max-lg:gap-1.5 max-lg:text-[10px]">
          <span><FiHeart /> {item.likesCount}</span>
          <span><FiMessageCircle /> {item.commentsCount}</span>
        </div>
        <Link to={actionTo} className="upd-grid-card__action max-lg:text-[10px]">
          {item.actionLabel} →
        </Link>
      </footer>
    </article>
  );
}
