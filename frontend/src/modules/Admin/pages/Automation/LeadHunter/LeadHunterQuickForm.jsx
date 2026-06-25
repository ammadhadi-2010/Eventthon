import React, { memo } from 'react';
import { Radar, Search } from 'lucide-react';
import useLeadHunterGeo from './useLeadHunterGeo';
import usePlatformCategories from './usePlatformCategories';

function LeadHunterSelect({ id, value, onChange, options, placeholder, disabled }) {
  return (
    <select
      id={id}
      className="lh-select"
      value={value}
      disabled={disabled}
      onChange={(e) => onChange(e.target.value)}
    >
      <option value="">{placeholder}</option>
      {options.map((opt) => (
        <option key={`${id}-${opt.value}`} value={opt.value}>
          {opt.label}
        </option>
      ))}
    </select>
  );
}

function LeadHunterQuickForm({
  form,
  busy,
  searchBusy,
  websiteHighlight,
  websiteInputRef,
  onChange,
  onCountryChange,
  onGoogleSearch,
  onExtract,
}) {
  const { countries } = useLeadHunterGeo();
  const { categories, loading: categoriesLoading } = usePlatformCategories();
  const categoryOptions = categories.map((name) => ({ value: name, label: name }));
  const actionBusy = busy || searchBusy;
  const canSearch = Boolean(form.country.trim() && form.category.trim()) && !actionBusy;

  const handleCountry = (isoCode) => {
    const match = countries.find((row) => row.value === isoCode);
    onCountryChange(isoCode, match?.label || '');
  };

  return (
    <section className="um-card lh-card">
      <div className="lh-card-head">
        <Radar size={18} aria-hidden />
        <div>
          <h2 className="auto-card-title">Quick Hunter</h2>
          <p className="lh-card-sub">Scan a country-wide category and extract outreach-ready leads.</p>
        </div>
      </div>

      <div className="lh-form-pair">
        <div className="lh-field-block">
          <label className="auto-field-label" htmlFor="lh-country">
            Country
          </label>
          <LeadHunterSelect
            id="lh-country"
            value={form.countryCode}
            placeholder="Select country"
            options={countries}
            onChange={handleCountry}
          />
        </div>

        <div className="lh-field-block">
          <label className="auto-field-label" htmlFor="lh-category">
            Target Category
          </label>
          <LeadHunterSelect
            id="lh-category"
            value={form.category}
            placeholder={categoriesLoading ? 'Loading categories…' : 'Select platform category'}
            options={categoryOptions}
            disabled={categoriesLoading || actionBusy}
            onChange={(value) => onChange('category', value)}
          />
        </div>
      </div>

      <div className="lh-form-grid lh-form-grid--website">
        <label className="auto-field-label" htmlFor="lh-website">
          Website Link
        </label>
        <input
          id="lh-website"
          ref={websiteInputRef}
          className={`lh-input${websiteHighlight ? ' lh-input--pulse' : ''}`}
          type="url"
          value={form.websiteUrl}
          placeholder="https://example.com"
          onChange={(e) => onChange('websiteUrl', e.target.value)}
        />
      </div>

      <div className="lh-action-row">
        <button
          type="button"
          className="um-btn um-btn--primary"
          disabled={!canSearch}
          onClick={onGoogleSearch}
        >
          <Search size={14} aria-hidden />
          {searchBusy ? 'Searching…' : 'Search Google Leads'}
        </button>
        <button type="button" className="um-btn um-btn--primary" disabled={busy} onClick={onExtract}>
          <Radar size={14} aria-hidden />
          {busy ? 'Extracting…' : 'Run Extract'}
        </button>
      </div>
    </section>
  );
}

export default memo(LeadHunterQuickForm);
