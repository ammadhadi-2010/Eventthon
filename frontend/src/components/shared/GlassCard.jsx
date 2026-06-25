import React from 'react';

/** Frosted / glass surface for cards, feed items, etc. */
export default function GlassCard({ as: Comp = 'div', className = '', children, ...rest }) {
  const cn = ['esh-glass-card', className].filter(Boolean).join(' ');
  return (
    <Comp className={cn} {...rest}>
      {children}
    </Comp>
  );
}
