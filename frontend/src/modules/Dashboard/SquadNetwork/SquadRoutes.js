// ============================================
// SquadRoutes.js — Squad Module Routes
// ============================================

import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Squads from './Squads';
import SquadDetail from './SquadDetail/SquadDetail';
import SquadCommandCenter from './SquadCommandCenter';

const SquadRoutes = ({ userData }) => {
    return (
        <Routes>
            {/* Main Squads List */}
            <Route path="/" element={<Squads userData={userData} />} />

            {/* Squad Detail View */}
            <Route path=":id" element={<SquadDetail userData={userData} />} />

            {/* Command Center */}
            <Route path="command-center" element={<SquadCommandCenter userData={userData} />} />
            <Route path="command-center/:id" element={<SquadCommandCenter userData={userData} />} />

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/squads" replace />} />
        </Routes>
    );
};

export default SquadRoutes;
