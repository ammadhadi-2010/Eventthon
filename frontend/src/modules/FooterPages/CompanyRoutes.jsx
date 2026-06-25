import React from 'react';
import { Route, Routes } from 'react-router-dom';
import AboutUs from './Company/AboutUs';
import Pricing from './Company/Pricing';
import Careers from './Company/Careers';
import ContactUs from './Company/ContactUs';
import PrivacyPolicy from './Company/PrivacyPolicy';
import TermsOfService from './Company/TermsOfService';

export default function CompanyRoutes() {
  return (
    <Routes>
      <Route path="about" element={<AboutUs />} />
      <Route path="pricing" element={<Pricing />} />
      <Route path="careers" element={<Careers />} />
      <Route path="contact" element={<ContactUs />} />
      <Route path="privacy" element={<PrivacyPolicy />} />
      <Route path="terms" element={<TermsOfService />} />
    </Routes>
  );
}
