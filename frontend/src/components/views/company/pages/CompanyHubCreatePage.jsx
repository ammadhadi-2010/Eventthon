import React from 'react';
import { useNavigate } from 'react-router-dom';
import CompanyRegistrationPanel from '../components/CompanyRegistrationPanel';
import '../styles/company-hub-create.css';

export default function CompanyHubCreatePage() {
  const navigate = useNavigate();

  return (
    <div className="cp-hub-create">
      <header className="cp-hub-create__head">
        <h1>Register a Company</h1>
        <p>Complete a fresh company profile submission for admin verification.</p>
      </header>
      <CompanyRegistrationPanel fresh onSubmitted={() => navigate('/company/dashboard')} />
    </div>
  );
}
