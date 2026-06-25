import React from 'react';
import { FiX } from 'react-icons/fi';

export default function SidebarCardItem({
  icon,
  iconColor = '#3b82f6',
  title,
  subtitle,
  meta,
  action,
  onDismiss,
  onRowClick,
}) {
  const handleKeyDown = (e) => {
    if (!onRowClick) return;
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onRowClick();
    }
  };

  return (
    <div
      className={`dash-rs-row${onRowClick ? ' dash-rs-row--click' : ''}`}
      onClick={onRowClick}
      onKeyDown={handleKeyDown}
      role={onRowClick ? 'button' : undefined}
      tabIndex={onRowClick ? 0 : undefined}
    >
      <div className="dash-rs-icon" style={{ background: iconColor }} aria-hidden>
        {icon}
      </div>
      <div className="dash-rs-mid">
        <div className="dash-rs-row-title">{title}</div>
        {subtitle ? <div className="dash-rs-row-sub">{subtitle}</div> : null}
        {meta ? <div className="dash-rs-row-meta">{meta}</div> : null}
      </div>
      {action ? (
        <div className="dash-rs-action" onClick={(e) => e.stopPropagation()} onKeyDown={(e) => e.stopPropagation()}>
          {action}
        </div>
      ) : null}
      {onDismiss ? (
        <button
          type="button"
          className="dash-rs-dismiss"
          onClick={(e) => {
            e.stopPropagation();
            onDismiss();
          }}
          aria-label="Dismiss suggestion"
        >
          <FiX size={14} />
        </button>
      ) : null}
    </div>
  );
}
