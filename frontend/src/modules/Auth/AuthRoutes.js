import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { GoogleOAuthProvider } from '@react-oauth/google'; // Naya import
import AuthLayout from '../../layouts/AuthLayout';
import Login from './Login';
import SignIn from './SignIn';
import ForgotPassword from './ForgotPassword';

const AuthRoutes = () => {
  const googleClientId =
    process.env.REACT_APP_GOOGLE_CLIENT_ID ||
    '41974550291-emcp865nmpmumr00vd8j482vgei8ftim.apps.googleusercontent.com';

  return (
    <GoogleOAuthProvider clientId={googleClientId}>
      <AuthLayout>
        <Routes>
          <Route path="login" element={<Login />} />
          <Route path="signin" element={<SignIn />} />
          <Route path="forgot-password" element={<ForgotPassword />} />
          <Route path="*" element={<Navigate to="login" replace />} />
        </Routes>
      </AuthLayout>
    </GoogleOAuthProvider>
  );
};

export default AuthRoutes;