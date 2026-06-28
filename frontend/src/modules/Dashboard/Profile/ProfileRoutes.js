import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { hasStoredSession } from '../../../utils/storedUser';

import DevProfileOverviewPage from './devProfileOverview/DevProfileOverviewPage';
import ConnectionsPage from './connectionsPage/ConnectionsPage';
import EditProfileFlowPage from './editProfile/EditProfileFlowPage';
import ViewFullProfilePage from './viewFullProfile/ViewFullProfilePage';
import IdentityVerify from './Sections/IdentityVerify';

const ProfileRoutes = ({ userData, refreshData }) => {
  if (!hasStoredSession()) {
    return <Navigate to="/auth/login" replace />;
  }

  return (
    <div className="w-full min-w-0" style={{ fontFamily: 'Sans-Serif' }}>
      <Routes>
        <Route
          index
          element={<DevProfileOverviewPage userData={userData} refreshData={refreshData} />}
        />

        <Route
          path="edit"
          element={<EditProfileFlowPage userData={userData} refreshData={refreshData} />}
        />

        <Route
          path="view"
          element={<ViewFullProfilePage userData={userData} refreshData={refreshData} />}
        />

        <Route path="connections/:listKey" element={<ConnectionsPage userData={userData} />} />

        <Route path="niche" element={<Navigate to="/profile/edit" replace />} />

        <Route
          path="verify"
          element={<IdentityVerify userData={userData} refreshData={refreshData} />}
        />

        <Route path="*" element={<Navigate to="/profile" replace />} />
      </Routes>
    </div>
  );
};

export default ProfileRoutes;
