import React from 'react';
import { FIELD_CLASS, LABEL_CLASS } from './footerResourceConstants';

export function FooterResourceImagePreview({ imageurl, alt = 'Resource Preview', tall }) {
  if (!imageurl) return null;
  const height = tall ? 'h-32' : 'h-20';
  return (
    <div
      className={`w-full ${height} rounded-xl overflow-hidden border border-slate-800 relative bg-[#111622] mt-2`}
    >
      <img src={imageurl} alt={alt} className="w-full h-full object-cover" />
    </div>
  );
}

export function FooterField({ id, label, hint, children }) {
  return (
    <div className="w-full flex flex-col">
      <label className={LABEL_CLASS} htmlFor={id}>{label}</label>
      {children}
      {hint ? <p className="mt-1 text-xs text-slate-200">{hint}</p> : null}
    </div>
  );
}

export function FooterTextInput({ id, value, onChange, placeholder, maxLength, type = 'text' }) {
  return (
    <input
      id={id}
      type={type}
      className={FIELD_CLASS}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      maxLength={maxLength}
    />
  );
}

export function FooterTextArea({ id, value, onChange, placeholder, maxLength, rows = 5 }) {
  return (
    <textarea
      id={id}
      className={`${FIELD_CLASS} min-h-[${rows * 24}px] resize-y`}
      style={{ minHeight: `${rows * 24}px` }}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      maxLength={maxLength}
    />
  );
}
