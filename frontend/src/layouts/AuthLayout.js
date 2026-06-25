import React from 'react';

/**
 * Auth routes render their own full-page layout (AuthShell + Login.css).
 * This wrapper only ensures a full-viewport root without clipping the form.
 */
const AuthLayout = ({ children }) => {
  return <div className="auth-layout-root">{children}</div>;
};

export default AuthLayout;