import React from 'react';
import { Route, Routes } from 'react-router-dom';
import UpdatesExplorerPage from './UpdatesExplorerPage';

const UpdatesRoutes = ({ userData }) => (
  <Routes>
    <Route index element={<UpdatesExplorerPage userData={userData} />} />
  </Routes>
);

export default UpdatesRoutes;
