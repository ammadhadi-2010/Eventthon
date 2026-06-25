import React from 'react';
import { FiArrowLeft } from 'react-icons/fi';

export default function ProjectsHubMobileBack({ visible, onBack }) {
  if (!visible) return null;

  return (
    <button
      type="button"
      className="ph-mobile-back"
      onClick={onBack}
      aria-label="Go back"
    >
      <FiArrowLeft size={16} aria-hidden />
    </button>
  );
}
