import React, { useMemo, useState } from 'react';
import { GLOBAL_COUNTRIES } from '../../../../data/globalCountries';
import { submitCompanyPortalRegistration } from '../services/companyPortalApi';

function resolveUserId() {
  return (
    localStorage.getItem("userEmail") ||
    localStorage.getItem("userMobile") ||
    localStorage.getItem("user_id") ||
    ""
  );
}

function buildEmptyForm() {
  return {
    name: '',
    contact_email: resolveUserId(),
    country: '',
    registration_number: '',
    tax_id: '',
    website: '',
    industry: '',
    size: '',
    location: '',
    description: '',
    imageurl: null,
  };
}

export default function CompanyRegistrationPanel({ company, onSubmitted, fresh = false }) {
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState("");
  const [form, setForm] = useState(() => {
    if (fresh) return buildEmptyForm();
    return {
      name: company?.name || '',
      contact_email: company?.contactEmail || resolveUserId(),
      country: company?.country || '',
      registration_number: company?.registrationNumber || '',
      tax_id: company?.taxId || '',
      website: company?.website || '',
      industry: company?.industry || '',
      size: company?.employees || '',
      location: company?.location || '',
      description: company?.description || '',
      imageurl: null,
    };
  });

  const countryOptions = useMemo(() => GLOBAL_COUNTRIES || [], []);

  const setField = (key) => (e) => {
    const value = key === "imageurl" ? (e.target.files?.[0] || null) : e.target.value;
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setDone("");
    setSaving(true);
    try {
      const profile = await submitCompanyPortalRegistration({ ...form, user_id: resolveUserId() });
      window.dispatchEvent(
        new CustomEvent('et:company-updated', { detail: { company: profile } }),
      );
      setDone(
        "Your company profile is successfully submitted and is under review by our Admin team. Features will unlock shortly upon verification.",
      );
      if (typeof onSubmitted === "function") {
        await onSubmitted();
      }
    } catch (err) {
      setError(err?.response?.data?.detail || err?.message || "Could not submit registration.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <section className="cp-section cp-glass">
      <h2 className="cp-section__title">Complete Company Registration</h2>
      <p className="cp-registration-note">
        Public email providers are allowed. Tax ID and registration number are optional for startups and local businesses.
      </p>
      {error ? <p className="cp-form-error">{error}</p> : null}
      {done ? <p className="cp-form-success">{done}</p> : null}
      <form className="cp-register-form" onSubmit={onSubmit}>
        <label>
          <span>Company Name</span>
          <input value={form.name} onChange={setField("name")} required />
        </label>
        <label>
          <span>Business Email</span>
          <input type="email" value={form.contact_email} onChange={setField("contact_email")} required />
        </label>
        <label>
          <span>Country</span>
          <select value={form.country} onChange={setField("country")} required>
            <option value="">Select country</option>
            {countryOptions.map((c) => (
              <option key={c.code} value={c.code}>
                {c.name}
              </option>
            ))}
          </select>
        </label>
        <label>
          <span>Registration Number (Optional)</span>
          <input value={form.registration_number} onChange={setField("registration_number")} />
        </label>
        <label>
          <span>Tax ID (Optional)</span>
          <input value={form.tax_id} onChange={setField("tax_id")} />
        </label>
        <label>
          <span>Verification Proof (imageurl)</span>
          <input type="file" accept=".jpg,.jpeg,.png,.webp,.gif,.pdf" onChange={setField("imageurl")} />
        </label>
        <button type="submit" className="cp-retry-btn" disabled={saving}>
          {saving ? "Submitting..." : "Submit for Verification"}
        </button>
      </form>
    </section>
  );
}
