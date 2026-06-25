import {
  CompanyCoverBannerPreview,
  CompanyLogoPreview,
} from './CompanySettingsImagePreviews';

export default function CompanySettingsProfileFields({
  form,
  countries,
  sizeOptions,
  logoPreviewUrl,
  coverPreviewUrl,
  onFieldChange,
  onLogoImageurlChange,
  onCoverImageurlChange,
}) {
  return (
    <>
      <label>
        <span>Company Name</span>
        <input value={form.name} onChange={onFieldChange('name')} required />
      </label>
      <label>
        <span>Tagline / Slogan</span>
        <input value={form.tagline} onChange={onFieldChange('tagline')} />
      </label>
      <label className="cp-settings-form__full">
        <span>About Description</span>
        <textarea rows={4} value={form.description} onChange={onFieldChange('description')} />
      </label>
      <label>
        <span>Country</span>
        <select value={form.country} onChange={onFieldChange('country')}>
          <option value="">Select Country</option>
          {countries.map((c) => (
            <option key={c.code} value={c.code}>
              {c.name}
            </option>
          ))}
        </select>
      </label>
      <label>
        <span>Location</span>
        <input
          value={form.location}
          onChange={onFieldChange('location')}
          placeholder="City, State"
        />
      </label>
      <label>
        <span>Website Hyperlink</span>
        <input
          value={form.website}
          onChange={onFieldChange('website')}
          placeholder="https://company.com"
        />
      </label>
      <label>
        <span>Company Size</span>
        <select value={form.size} onChange={onFieldChange('size')}>
          <option value="">Select size</option>
          {sizeOptions.map((x) => (
            <option key={x} value={x}>
              {x}
            </option>
          ))}
        </select>
      </label>
      <label className="cp-settings-form__media">
        <span>Logo imageurl</span>
        <CompanyLogoPreview src={logoPreviewUrl} />
        <input type="file" accept=".jpg,.jpeg,.png,.webp,.gif" onChange={onLogoImageurlChange} />
      </label>
      <label className="cp-settings-form__media">
        <span>Background Cover Banner imageurl</span>
        <CompanyCoverBannerPreview src={coverPreviewUrl} />
        <input type="file" accept=".jpg,.jpeg,.png,.webp,.gif" onChange={onCoverImageurlChange} />
      </label>
    </>
  );
}
