import React from 'react';
import { resolvePortalImageurl } from '../utils/portalImage';

export default function CompanySettingsVerification({
  businessRegTaxId,
  currentProofUrl,
  onBusinessRegTaxIdChange,
  onProofImageurlChange,
}) {
  return (
    <fieldset className="cp-settings-block">
      <legend>Business Verification Documents</legend>
      <p className="cp-settings-block__hint">
        Optional. Upload a business card, identity card, or official registration proof (image or PDF).
      </p>
      <label>
        <span>Business Registration Number / Tax ID (optional)</span>
        <input
          value={businessRegTaxId}
          onChange={(e) => onBusinessRegTaxIdChange(e.target.value)}
          placeholder="Registration number or tax ID"
        />
      </label>
      <label className="cp-settings-form__full">
        <span>Upload Business Registration Proof / Identity Card / Business Card</span>
        <input
          type="file"
          accept=".jpg,.jpeg,.png,.webp,.gif,.pdf"
          onChange={(e) => onProofImageurlChange(e)}
        />
      </label>
      {currentProofUrl ? (
        <p className="cp-settings-proof">
          Current proof on file:{' '}
          <a href={resolvePortalImageurl(currentProofUrl, 'Proof')} target="_blank" rel="noopener noreferrer">
            View document
          </a>
        </p>
      ) : null}
    </fieldset>
  );
}
