import React from 'react';
import { Route, Routes } from 'react-router-dom';
import Documentation from './Resources/Documentation';
import Guides from './Resources/Guides';
import Tutorials from './Resources/Tutorials';
import Blog from './Resources/Blog';
import CaseStudies from './Resources/CaseStudies';
import HelpCenter from './Resources/HelpCenter';
import Community from './Resources/Community';

export default function ResourcesRoutes() {
  return (
    <Routes>
      <Route path="documentation" element={<Documentation />} />
      <Route path="guides" element={<Guides />} />
      <Route path="tutorials" element={<Tutorials />} />
      <Route path="blog" element={<Blog />} />
      <Route path="case-studies" element={<CaseStudies />} />
      <Route path="help" element={<HelpCenter />} />
      <Route path="community" element={<Community />} />
    </Routes>
  );
}
