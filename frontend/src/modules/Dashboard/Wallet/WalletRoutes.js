import React from 'react';
import { Routes, Route } from 'react-router-dom';
import WalletPage from './WalletPage';

const WalletRoutes = ({ userData }) => (
  <Routes>
    <Route path="*" element={<WalletPage userData={userData} />} />
  </Routes>
);

export default WalletRoutes;
