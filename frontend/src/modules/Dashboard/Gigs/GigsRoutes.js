import React from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import GigsCategoriesPage from './GigsCategoriesPage';
import GigsCategoryProvidersPage from './GigsCategoryProvidersPage';
import GigsFeaturedBrowsePage from './GigsFeaturedBrowsePage';
import GigsPage from './GigsPage';
import GigDetailExplorerPage from './GigDetailExplorerPage';
import GigOrderReviewPage from './GigOrderReviewPage';
import GigsShowroomPanelsLayoutPage from '../../Public/pages/GigsShowroomPanelsLayoutPage';

const GigsRoutes = () => {
  return (
    <Routes>
      <Route index element={<GigsPage />} />
      <Route path="showrooms" element={<GigsShowroomPanelsLayoutPage />} />
      <Route path="explorer" element={<GigDetailExplorerPage />} />
      <Route path="browse/featured" element={<GigsFeaturedBrowsePage />} />
      <Route path="providers" element={<GigsCategoryProvidersPage />} />
      <Route path="categories" element={<GigsCategoriesPage />} />
      <Route path=":gigId/order" element={<GigOrderReviewPage />} />
      <Route path="*" element={<Navigate to="/gigs" replace />} />
    </Routes>
  );
};

export default GigsRoutes;
