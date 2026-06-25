import React from 'react';

export const JA_OPTION_STYLE = { backgroundColor: '#0d1321', color: '#ffffff' };

export const JA_SELECT_VIBRANT_CLASS =
  'ja-select ja-select--vibrant bg-[#0d1321] text-white border border-slate-800 focus:border-indigo-500 rounded-xl px-3 py-2 w-full';

export function JobAlertSelectOption({ value, children }) {
  return (
    <option value={value} style={JA_OPTION_STYLE}>
      {children}
    </option>
  );
}

export function JobAlertNativeSelect({ value, onChange, children, className = JA_SELECT_VIBRANT_CLASS, ...rest }) {
  return (
    <select className={className} value={value} onChange={onChange} {...rest}>
      {children}
    </select>
  );
}
