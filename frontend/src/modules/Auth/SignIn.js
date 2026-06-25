import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import API, { API_BASE_URL } from '../../api/axiosConfig';
import PasswordInput from '../../components/PasswordInput';
import AuthShell from './AuthShell';
import EventThonLogo from '../../components/brand/EventThonLogo';
import { GLOBAL_COUNTRIES } from '../../data/globalCountries';

const SignIn = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    first_name: '', last_name: '', email: '',
    password: '', mobile: '', birth_day: '', 
    birth_month: '', birth_year: '', gender: 'Male',
    register_as_company: false,
    company_name: '',
    country: '',
    tax_id: '',
    registration_number: '',
    imageurl: null,
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleSignIn = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    try {
      const payload = new FormData();
      Object.entries(formData).forEach(([key, value]) => {
        if (value === null || value === '') return;
        payload.append(key, value);
      });
      payload.append('role', formData.register_as_company ? 'employer' : 'candidate');
      const response = await API.post('/api/auth/register', payload, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      if (response.data.status === "success") {
        alert("Registration Successful! Please Log In.");
        navigate('/auth/login');
      }
    } catch (error) {
      const isNetwork =
        error?.code === "ERR_NETWORK" ||
        error?.message === "Network Error" ||
        !error?.response;
      if (isNetwork) {
        setMessage(
          `Cannot reach API (${API_BASE_URL}). Start the backend or fix REACT_APP_API_BASE_URL.`
        );
      } else {
        const d = error.response?.data?.detail;
        setMessage(
          typeof d === "string"
            ? d
            : Array.isArray(d)
              ? d.map((x) => x.msg || x).join(" ")
              : "Registration failed"
        );
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell
      cardClassName="signin-card"
      brandTagline="Create your professional identity on the verified network."
    >
      <div className="bg-glow-top" />

        <div className="login-header">
          <EventThonLogo variant="auth" />
          <p className="tagline">CREATE YOUR PROFESSIONAL IDENTITY</p>
        </div>

        <h2 className="title-text">JOIN THE NETWORK</h2>

        <form onSubmit={handleSignIn} className="login-form">
          <div className="input-row">
            <input className="glass-input half" type="text" placeholder="First Name" 
              onChange={(e) => setFormData({...formData, first_name: e.target.value})} required />
            <input className="glass-input half" type="text" placeholder="Last Name" 
              onChange={(e) => setFormData({...formData, last_name: e.target.value})} required />
          </div>

          <input className="glass-input" type="email" placeholder="Email Address" 
            onChange={(e) => setFormData({...formData, email: e.target.value})} required />
          
          <PasswordInput
            wrapperClassName="password-wrapper"
            className="glass-input"
            placeholder="Create Password"
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            required
          />

          <input className="glass-input" type="text" placeholder="Mobile Number" 
            onChange={(e) => setFormData({...formData, mobile: e.target.value})} required />
          
          <div className="dob-container">
            <p className="field-label">Date of Birth</p>
            <div className="input-row">
              <input className="glass-input small" type="number" placeholder="DD" 
                onChange={(e) => setFormData({...formData, birth_day: e.target.value})} required />
              <input className="glass-input small" type="number" placeholder="MM" 
                onChange={(e) => setFormData({...formData, birth_month: e.target.value})} required />
              <input className="glass-input small" type="number" placeholder="YYYY" 
                onChange={(e) => setFormData({...formData, birth_year: e.target.value})} required />
            </div>
          </div>

          <select className="glass-input" onChange={(e) => setFormData({...formData, gender: e.target.value})}>
            <option value="Male">Male</option>
            <option value="Female">Female</option>
          </select>

          <label className="auth-toggle">
            <input
              type="checkbox"
              checked={formData.register_as_company}
              onChange={(e) => setFormData({ ...formData, register_as_company: e.target.checked })}
            />
            Register as Company / Employer
          </label>

          {formData.register_as_company ? (
            <>
              <input
                className="glass-input"
                type="text"
                placeholder="Company Name"
                onChange={(e) => setFormData({ ...formData, company_name: e.target.value })}
                required
              />
              <select
                className="glass-input"
                value={formData.country}
                onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                required
              >
                <option value="">Select Country</option>
                {GLOBAL_COUNTRIES.map((c) => (
                  <option key={c.code} value={c.code}>{c.name}</option>
                ))}
              </select>
              <input
                className="glass-input"
                type="text"
                placeholder="Tax ID (Optional)"
                onChange={(e) => setFormData({ ...formData, tax_id: e.target.value })}
              />
              <input
                className="glass-input"
                type="text"
                placeholder="Business Registration Number (Optional)"
                onChange={(e) => setFormData({ ...formData, registration_number: e.target.value })}
              />
              <label className="auth-upload">
                <span>Identity / Business Proof (imageurl)</span>
                <input
                  className="glass-input"
                  type="file"
                  accept=".jpg,.jpeg,.png,.webp,.gif,.pdf"
                  onChange={(e) => setFormData({ ...formData, imageurl: e.target.files?.[0] || null })}
                />
              </label>
            </>
          ) : null}

          <button type="submit" className="login-btn" disabled={loading}>
            {loading ? 'CREATING ACCOUNT...' : 'REGISTER NOW'}
          </button>
        </form>

        {message && (
          <p
            className={`status-msg ${
              message.includes("Cannot reach") ? "status-msg--info" : ""
            }`}
          >
            {message}
          </p>
        )}

        <p className="footer-link">
          Already a member?
          <button
            type="button"
            className="create-account-btn"
            onClick={() => navigate("/auth/login")}
          >
            Log In
          </button>
        </p>
    </AuthShell>
  );
};

export default SignIn;