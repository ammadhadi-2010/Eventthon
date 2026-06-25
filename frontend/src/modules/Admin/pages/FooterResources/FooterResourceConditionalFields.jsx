import React from 'react';
import { getCategoryFieldFlags } from '../../../../models/FooterResource';
import FooterCompanyLayoutFields from './FooterCompanyLayoutFields';
import FooterResourceLayoutFields from './FooterResourceLayoutFields';

export default function FooterResourceConditionalFields({ formData, onChange, onMediaUploaded, saving }) {
  const flags = getCategoryFieldFlags(formData.category);

  return (
    <div className="w-full flex flex-col gap-4">
      {flags.footerBlock === 'company' ? (
        <FooterCompanyLayoutFields
          formData={formData}
          onChange={onChange}
          onMediaUploaded={onMediaUploaded}
          saving={saving}
          flags={flags}
        />
      ) : (
        <FooterResourceLayoutFields
          formData={formData}
          onChange={onChange}
          onMediaUploaded={onMediaUploaded}
          saving={saving}
          flags={flags}
        />
      )}
    </div>
  );
}
