import React from 'react';

const SUCCESS_MESSAGE =
  'Admin profile configuration updated successfully! 🚀';

export default function AdminProfileSuccessToast({ open, onClose }) {
  if (!open) return null;

  return (
    <div className="ap-success-toast" role="alert" aria-live="polite">
      <div className="ap-success-toast__card">
        <p>{SUCCESS_MESSAGE}</p>
        <button type="button" onClick={onClose}>
          Close
        </button>
      </div>
    </div>
  );
}
