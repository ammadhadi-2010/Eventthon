import React from 'react';
import { Routes, Route } from 'react-router-dom';
import WalletComingSoon from './WalletComingSoon';

const WalletRoutes = () => (
  <Routes>
    <Route path="*" element={<WalletComingSoon />} />
  </Routes>
);

export default WalletRoutes;
