import React, { useEffect, useMemo, useState } from 'react';
import { GLOBAL_COUNTRIES } from '../../../../data/globalCountries';
import { useCompanyPortal } from '../hooks/useCompanyPortal';
import useCompanyImagePreview from '../hooks/useCompanyImagePreview';
import { updateCompanySettings } from '../services/companyPortalApi';
import CompanySettingsProfileFields from '../components/CompanySettingsProfileFields';
import CompanySettingsVerification from '../components/CompanySettingsVerification';
import '../styles/company-settings.css';

const SIZE_OPTIONS = ['1-10', '11-50', '51-200', '201-500', '500+'];

function resolveUserId() {
  return (
    localStorage.getItem('userEmail') ||
    localStorage.getItem('userMobile') ||
    localStorage.getItem('user_id') ||
    ''
  );
}

const emptyForm = (company) => ({
  name: company.name || '',
  tagline: company.tagline || '',
  description: company.description || '',
  country: company.country || '',
  location: company.location || '',
  website: company.website || '',
  size: company.employees || '',
  businessRegTaxId: company.registrationNumber || company.taxId || '',
  logo: { imageurl: null },
  cover: { imageurl: null },
  verification: { imageurl: null },
});

export default function CompanySettingsPage() {
  const { data, loading, error, reload } = useCompanyPortal();
  const company = data?.company || {};
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState('');
  const [fail, setFail] = useState('');
  const [form, setForm] = useState(() => emptyForm(company));

  const countries = useMemo(() => GLOBAL_COUNTRIES || [], []);
  const logoPreviewUrl = useCompanyImagePreview(form.logo.imageurl, company.imageurl);
  const coverPreviewUrl = useCompanyImagePreview(form.cover.imageurl, company.coverImageurl);

  useEffect(() => {
    setForm(emptyForm(company));
  }, [company]);

  const onField = (key) => (e) => setForm((prev) => ({ ...prev, [key]: e.target.value }));
  const onLogoImageurl = (e) =>
    setForm((prev) => ({ ...prev, logo: { imageurl: e.target.files?.[0] || null } }));
  const onCoverImageurl = (e) =>
    setForm((prev) => ({ ...prev, cover: { imageurl: e.target.files?.[0] || null } }));
  const onVerificationImageurl = (e) =>
    setForm((prev) => ({ ...prev, verification: { imageurl: e.target.files?.[0] || null } }));

  const onSubmit = async (e) => {
    e.preventDefault();
    setFail('');
    setNotice('');
    setSaving(true);
    try {
      const updatedCompany = await updateCompanySettings({
        user_id: resolveUserId(),
        name: form.name,
        tagline: form.tagline,
        description: form.description,
        country: form.country,
        location: form.location,
        website: form.website,
        size: form.size,
        registration_number: form.businessRegTaxId,
        tax_id: form.businessRegTaxId,
        logo_imageurl: form.logo.imageurl,
        cover_imageurl: form.cover.imageurl,
        verification_imageurl: form.verification.imageurl,
      });
      window.dispatchEvent(
        new CustomEvent('et:company-updated', { detail: { company: updatedCompany } }),
      );
      setNotice('Company settings and verification documents saved.');
      await reload();
    } catch (err) {
      setFail(
        err?.response?.data?.detail || err?.message || 'Could not update company settings.',
      );
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <p className="cp-page-loading">Loading company settings...</p>;
  if (error || !data) {
    return <p className="cp-page-error gigs-card">{error || 'Company settings could not be loaded.'}</p>;
  }

  return (
    <section className="cp-section cp-glass">
      <div className="cp-section__head">
        <h2>Company Settings</h2>
      </div>
      {notice ? <p className="cp-form-success">{notice}</p> : null}
      {fail ? <p className="cp-form-error">{fail}</p> : null}
      <form className="cp-settings-form" onSubmit={onSubmit}>
        <CompanySettingsProfileFields
          form={form}
          countries={countries}
          sizeOptions={SIZE_OPTIONS}
          logoPreviewUrl={logoPreviewUrl}
          coverPreviewUrl={coverPreviewUrl}
          onFieldChange={onField}
          onLogoImageurlChange={onLogoImageurl}
          onCoverImageurlChange={onCoverImageurl}
        />
        <CompanySettingsVerification
          businessRegTaxId={form.businessRegTaxId}
          currentProofUrl={company.verificationProofImageurl}
          onBusinessRegTaxIdChange={(v) => setForm((p) => ({ ...p, businessRegTaxId: v }))}
          onProofImageurlChange={onVerificationImageurl}
        />
        <div className="cp-settings-form__full">
          <button type="submit" className="cp-retry-btn" disabled={saving}>
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </form>
    </section>
  );
}
