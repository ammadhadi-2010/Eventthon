import React from 'react';
import AboutUsAdminFields from './AboutUsAdminFields';
import FooterBrandAdminFields from './FooterBrandAdminFields';
import PrivacyPolicyAdminFields from './PrivacyPolicyAdminFields';
import TermsOfServiceAdminFields from './TermsOfServiceAdminFields';
import {
  FooterField,
  FooterTextArea,
  FooterTextInput,
} from './FooterResourceFieldKit';

export default function FooterCompanyLayoutFields({ formData, onChange, onMediaUploaded, saving, flags }) {
  const setField = (key) => (e) => onChange({ ...formData, [key]: e.target.value });

  return (
    <>
      {flags.showAboutBlock ? (
        <AboutUsAdminFields
          formData={formData}
          onChange={onChange}
          onMediaUploaded={onMediaUploaded}
          saving={saving}
        />
      ) : null}

      {flags.showFooterBrand ? (
        <FooterBrandAdminFields formData={formData} onChange={onChange} />
      ) : null}

      {flags.showPrivacyPolicy ? (
        <PrivacyPolicyAdminFields formData={formData} onChange={onChange} />
      ) : null}

      {flags.showTermsOfService ? (
        <TermsOfServiceAdminFields formData={formData} onChange={onChange} />
      ) : null}

      {flags.showPricingCard || flags.showCareersListing ? (
        <FooterField
          id="footer-company-order"
          label="Sort Order"
          hint="Lower numbers appear first. Use 1 for the featured pricing plan."
        >
          <FooterTextInput
            id="footer-company-order"
            type="number"
            min={0}
            max={9999}
            value={formData.sidebarOrder}
            onChange={setField('sidebarOrder')}
            placeholder="0"
          />
        </FooterField>
      ) : null}

      {flags.showPricingCard ? (
        <>
          <FooterField id="footer-pricing-label" label="Plan Name" hint="Pricing card title.">
            <FooterTextInput
              id="footer-pricing-label"
              value={formData.pricingLabel}
              onChange={setField('pricingLabel')}
              placeholder="Pro Plan"
              maxLength={120}
            />
          </FooterField>
          <FooterField id="footer-pricing-price" label="Plan Price" hint="e.g. $29/mo or Free">
            <FooterTextInput
              id="footer-pricing-price"
              value={formData.pricingPrice}
              onChange={setField('pricingPrice')}
              placeholder="$29/mo"
              maxLength={40}
            />
          </FooterField>
          <FooterField id="footer-pricing-features" label="Plan Features" hint="One feature per line.">
            <FooterTextArea
              id="footer-pricing-features"
              value={formData.pricingFeatures}
              onChange={setField('pricingFeatures')}
              placeholder={'Unlimited squads\nPriority support\nAdvanced analytics'}
              maxLength={4000}
              rows={5}
            />
          </FooterField>
          <FooterField id="footer-pricing-excerpt" label="Plan Summary">
            <FooterTextArea
              id="footer-pricing-excerpt"
              value={formData.excerpt}
              onChange={setField('excerpt')}
              placeholder="Best for growing teams..."
              maxLength={2000}
              rows={2}
            />
          </FooterField>
        </>
      ) : null}

      {flags.showCareersListing ? (
        <>
          <FooterField
            id="footer-job-title"
            label="Role Title"
            hint="EventThon company role only (e.g. Frontend Engineer). Public page shows “Role @ EventThon”."
          >
            <FooterTextInput
              id="footer-job-title"
              value={formData.jobTitle}
              onChange={(e) => {
                const jobTitle = e.target.value;
                onChange({
                  ...formData,
                  jobTitle,
                  title: String(jobTitle || '')
                    .replace(/\s*@\s*eventthon\s*$/i, '')
                    .trim(),
                });
              }}
              placeholder="Frontend Engineer"
              maxLength={160}
            />
          </FooterField>
          <FooterField id="footer-job-location" label="Role Location">
            <FooterTextInput
              id="footer-job-location"
              value={formData.jobLocation}
              onChange={setField('jobLocation')}
              placeholder="Remote · Worldwide"
              maxLength={120}
            />
          </FooterField>
          <FooterField
            id="footer-job-excerpt"
            label="Department"
            hint="Engineering, Design, Product, etc. Used for filter chips on /company/careers."
          >
            <FooterTextInput
              id="footer-job-excerpt"
              value={formData.excerpt}
              onChange={setField('excerpt')}
              placeholder="Engineering"
              maxLength={120}
            />
          </FooterField>
          <FooterField id="footer-job-content" label="Role Details">
            <FooterTextArea
              id="footer-job-content"
              value={formData.content}
              onChange={setField('content')}
              placeholder="What this EventThon role owns, requirements, and impact..."
              maxLength={12000}
              rows={5}
            />
          </FooterField>
          <FooterField
            id="footer-job-apply-url"
            label="Apply URL"
            hint="Optional. If empty, Apply opens careers@eventthon.com."
          >
            <FooterTextInput
              id="footer-job-apply-url"
              value={formData.externalUrl}
              onChange={setField('externalUrl')}
              placeholder="https://eventthon.com/apply/frontend"
              maxLength={500}
            />
          </FooterField>
        </>
      ) : null}

      {flags.showContactLeads ? (
        <>
          <FooterField id="footer-contact-email" label="Contact Email" hint="Shown on /company/contact and used for lead routing.">
            <FooterTextInput
              id="footer-contact-email"
              value={formData.contactEmail}
              onChange={setField('contactEmail')}
              placeholder="hello@eventthon.com"
              maxLength={200}
            />
          </FooterField>
          <FooterField id="footer-contact-phone" label="Contact Phone">
            <FooterTextInput
              id="footer-contact-phone"
              value={formData.contactPhone}
              onChange={setField('contactPhone')}
              placeholder="+1 555 0100"
              maxLength={40}
            />
          </FooterField>
          <FooterField
            id="footer-contact-location"
            label="Location"
            hint="Office / HQ address. One line per row. Synced to the public Contact Us map pin card."
          >
            <FooterTextArea
              id="footer-contact-location"
              value={formData.contactLocation}
              onChange={setField('contactLocation')}
              placeholder={'1200 Innovation Drive, Suite 400\nSan Francisco, CA'}
              maxLength={1000}
              rows={3}
            />
          </FooterField>
          <FooterField id="footer-contact-hours" label="Office Hours" hint="Shown on the public Contact Us page.">
            <FooterTextInput
              id="footer-contact-hours"
              value={formData.contactHours}
              onChange={setField('contactHours')}
              placeholder="Mon–Fri, 9:00 AM – 6:00 PM PST"
              maxLength={200}
            />
          </FooterField>
          <FooterField
            id="footer-contact-excerpt"
            label="Contact Intro"
            hint="Hero subtitle + intro blurb on /company/contact."
          >
            <FooterTextArea
              id="footer-contact-excerpt"
              value={formData.excerpt}
              onChange={setField('excerpt')}
              placeholder="Reach the EventThon team for support, partnerships, or press."
              maxLength={2000}
              rows={3}
            />
          </FooterField>
          <FooterField
            id="footer-contact-content"
            label="Contact Context"
            hint="Longer details under Contact Intro (support tiers, response time, partnerships, etc.)."
          >
            <FooterTextArea
              id="footer-contact-content"
              value={formData.content}
              onChange={setField('content')}
              placeholder="We respond within one business day. For partnerships, include your company name and timeline..."
              maxLength={12000}
              rows={5}
            />
          </FooterField>
        </>
      ) : null}
    </>
  );
}
