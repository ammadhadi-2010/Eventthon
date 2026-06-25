import React from 'react';
import { FiX } from 'react-icons/fi';
import { getUserDisplayName, pickImageurl, resolveDashboardMediaUrl } from '../../utils/dashboardMedia';

export default function PostModalHeader({ userData, type, onClose }) {
  const displayName = getUserDisplayName(userData);
  const avatarSrc = resolveDashboardMediaUrl(pickImageurl(userData));
  const privacy = type === 'SQUAD' ? 'Asking Squad' : 'Sharing with Network';

  return (
    <div className="post-modal__header">
      <div className="post-modal__user">
        <div className="post-modal__avatar">
          {avatarSrc ? (
            <img src={avatarSrc} alt={displayName} className="post-modal__avatar-img" />
          ) : (
            <span>{displayName.charAt(0).toUpperCase()}</span>
          )}
        </div>
        <div className="min-w-0">
          <h4 className="post-modal__name truncate">{displayName}</h4>
          <p className="post-modal__privacy truncate">{privacy}</p>
        </div>
      </div>
      <button type="button" onClick={onClose} className="post-modal__close shrink-0" aria-label="Close">
        <FiX size={22} />
      </button>
    </div>
  );
}
