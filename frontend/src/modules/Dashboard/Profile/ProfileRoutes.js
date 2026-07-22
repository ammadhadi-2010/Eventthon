import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { hasStoredSession } from '../../../utils/storedUser';

import DevProfileOverviewPage from './devProfileOverview/DevProfileOverviewPage';
import ConnectionsPage from './connectionsPage/ConnectionsPage';
import EditProfileFlowPage from './editProfile/EditProfileFlowPage';
import ViewFullProfilePage from './viewFullProfile/ViewFullProfilePage';
import IdentityVerify from './Sections/IdentityVerify';

const ProfileRoutes = ({ userData, refreshData }) => {
  return (
    <div className="w-full min-w-0" style={{ fontFamily: 'Sans-Serif' }}>
      <Routes>
        <Route
          index
          element={<DevProfileOverviewPage userData={userData} refreshData={refreshData} />}
        />

        <Route
          path="edit"
          element={
            hasStoredSession() ? (
              <EditProfileFlowPage userData={userData} refreshData={refreshData} />
            ) : (
              <Navigate to="/auth/login" replace />
            )
          }
        />

        <Route
          path="view"
          element={<ViewFullProfilePage userData={userData} refreshData={refreshData} />}
        />

        <Route
          path="connections/:listKey"
          element={
            hasStoredSession() ? (
              <ConnectionsPage userData={userData} />
            ) : (
              <Navigate to="/auth/login" replace />
            )
          }
        />

        <Route path="niche" element={<Navigate to="/profile/edit" replace />} />

        <Route
          path="verify"
          element={
            hasStoredSession() ? (
              <IdentityVerify userData={userData} refreshData={refreshData} />
            ) : (
              <Navigate to="/auth/login" replace />
            )
          }
        />

        <Route path="*" element={<Navigate to="/profile" replace />} />
      </Routes>
    </div>
  );
};

export default ProfileRoutes;
