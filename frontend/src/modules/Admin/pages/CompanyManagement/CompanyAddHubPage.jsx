import React from 'react';
import { Navigate } from 'react-router-dom';
import { COMPANY_HUB_CREATE_PATH } from './companyHubPaths';

/** Legacy admin sidebar path — forwards to the clean company hub create form. */
export default function CompanyAddHubPage() {
  return <Navigate to={COMPANY_HUB_CREATE_PATH} replace />;
}
