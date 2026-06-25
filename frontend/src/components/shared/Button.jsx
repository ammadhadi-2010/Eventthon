import React from 'react';

const VARIANT_CLASS = {
  overlay: 'esh-btn esh-btn--overlay',
  ghost: 'esh-btn esh-btn--ghost',
  primary: 'esh-btn esh-btn--primary',
};

/**
 * Site-wide button primitive — change variants in `shared.css` for global styling.
 */
export default function Button({
  variant = 'ghost',
  type = 'button',
  className = '',
  children,
  ...rest
}) {
  const base = VARIANT_CLASS[variant] || VARIANT_CLASS.ghost;
  const cn = [base, className].filter(Boolean).join(' ');
  return (
    <button type={type} className={cn} {...rest}>
      {children}
    </button>
  );
}
