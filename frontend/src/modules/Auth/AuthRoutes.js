import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { GoogleOAuthProvider } from '@react-oauth/google';
import AuthLayout from '../../layouts/AuthLayout';
import Login from './Login';
import SignIn from './SignIn';
import ForgotPassword from './ForgotPassword';
import GoogleCallback from './GoogleCallback';

const AuthRoutes = () => {
  const googleClientId = process.env.REACT_APP_GOOGLE_CLIENT_ID || '';

  const routes = (
    <AuthLayout>
      <Routes>
        <Route path="login" element={<Login />} />
        <Route path="signin" element={<SignIn />} />
        <Route path="google/callback" element={<GoogleCallback />} />
        <Route path="register" element={<Navigate to="/auth/signin" replace />} />
        <Route path="forgot-password" element={<ForgotPassword />} />
        <Route path="*" element={<Navigate to="login" replace />} />
      </Routes>
    </AuthLayout>
  );

  if (!googleClientId) {
    return routes;
  }

  return <GoogleOAuthProvider clientId={googleClientId}>{routes}</GoogleOAuthProvider>;
};

export default AuthRoutes;