import React from 'react';
import { FiArrowLeft } from 'react-icons/fi';

export default function CreateProjectMobileTitleRow({ title, subtitle, onBack }) {
  return (
    <div className="cp-mobile-title-row">
      <button type="button" className="cp-mobile-title-back" onClick={onBack} aria-label="Go back">
        <FiArrowLeft size={20} aria-hidden />
      </button>
      <div className="cp-mobile-title-copy">
        <h2 className="cp-form-title">{title}</h2>
        {subtitle ? <p className="cp-form-sub">{subtitle}</p> : null}
      </div>
    </div>
  );
}
