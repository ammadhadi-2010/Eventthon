import React from 'react';
import ReactDOM from 'react-dom/client';
import { HelmetProvider } from 'react-helmet-async';
import './index.css';
import './modules/Dashboard/Navbar/hub-inner-mobile-padding.css';
import App from './App';
import { captureReferralFromUrl } from './utils/referralStorage';

captureReferralFromUrl();

const root = ReactDOM.createRoot(document.getElementById('root'));

root.render(
  <React.StrictMode>
    <HelmetProvider>
      <App />
    </HelmetProvider>
  </React.StrictMode>
);