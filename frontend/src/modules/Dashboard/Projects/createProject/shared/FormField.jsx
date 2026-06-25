import React from 'react';

export default function FormField({ label, hint, children, className = '' }) {
  return (
    <label className={`cp-field ${className}`.trim()}>
      {label ? <span className="cp-field__label">{label}</span> : null}
      {children}
      {hint ? <span className="cp-field__hint">{hint}</span> : null}
    </label>
  );
}
