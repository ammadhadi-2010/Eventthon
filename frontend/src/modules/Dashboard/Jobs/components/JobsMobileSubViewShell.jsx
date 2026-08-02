import React from 'react';

/** Pass-through shell — breadcrumb lives on JobsPage for all sections. */
export default function JobsMobileSubViewShell({ children }) {
  return <div className="jh-subview-shell">{children}</div>;
}
