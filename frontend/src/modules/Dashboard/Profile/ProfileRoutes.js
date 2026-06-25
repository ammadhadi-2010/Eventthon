import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import DevProfileOverviewPage from './devProfileOverview/DevProfileOverviewPage';
import ConnectionsPage from './connectionsPage/ConnectionsPage';
import EditProfileFlowPage from './editProfile/EditProfileFlowPage';
import ViewFullProfilePage from './viewFullProfile/ViewFullProfilePage';
import IdentityVerify from './Sections/IdentityVerify';

const ProfileRoutes = ({ userData, refreshData }) => {
    const storedMobile = localStorage.getItem('userMobile');
    
    if (!storedMobile) {
        return <Navigate to="/auth/login" replace />;
    }

    return (
        <div className="w-full min-w-0" style={{ fontFamily: 'Sans-Serif' }}>
            <Routes>
                {/* STEP 1: Projects Page (Main Profile) */}
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

                <Route
                    path="connections/:listKey"
                    element={<ConnectionsPage userData={userData} />}
                />
                
                {/* Niche selection is part of Edit profile → Skills & Niche step */}
                <Route path="niche" element={<Navigate to="/profile/edit" replace />} />

                {/* Identity verification */}
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