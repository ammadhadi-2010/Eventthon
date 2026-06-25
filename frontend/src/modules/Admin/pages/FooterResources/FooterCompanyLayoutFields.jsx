import React from 'react';
import FooterMediaSubmitButton from './FooterMediaSubmitButton';
import {
  FooterField,
  FooterResourceImagePreview,
  FooterTextArea,
  FooterTextInput,
} from './FooterResourceFieldKit';

export default function FooterCompanyLayoutFields({ formData, onChange, onMediaUploaded, saving, flags }) {
  const setField = (key) => (e) => onChange({ ...formData, [key]: e.target.value });

  return (
    <>
      {flags.showAboutBlock ? (
        <>
          <FooterField id="footer-about-excerpt" label="About Summary" hint="Short company overview blurb.">
            <FooterTextArea
              id="footer-about-excerpt"
              value={formData.excerpt}
              onChange={setField('excerpt')}
              placeholder="Who we are and what we build..."
              maxLength={2000}
              rows={3}
            />
          </FooterField>
          <FooterField id="footer-about-content" label="About Content" hint="Full about page copy / HTML blocks.">
            <FooterTextArea
              id="footer-about-content"
              value={formData.content}
              onChange={setField('content')}
              placeholder="Mission, vision, and team story..."
              maxLength={12000}
              rows={6}
            />
          </FooterField>
          <FooterField id="footer-about-image" label="About Cover Image URL">
            <FooterMediaSubmitButton onUploaded={onMediaUploaded} disabled={saving} />
            <FooterTextInput
              id="footer-about-image"
              value={formData.imageurl}
              onChange={setField('imageurl')}
              placeholder="https://..."
              maxLength={500}
            />
            <FooterResourceImagePreview imageurl={formData.imageurl} tall />
          </FooterField>
        </>
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
          <FooterField id="footer-job-title" label="Role Title" hint="Careers listing headline.">
            <FooterTextInput
              id="footer-job-title"
              value={formData.jobTitle}
              onChange={setField('jobTitle')}
              placeholder="Senior Frontend Engineer"
              maxLength={160}
            />
          </FooterField>
          <FooterField id="footer-job-location" label="Role Location">
            <FooterTextInput
              id="footer-job-location"
              value={formData.jobLocation}
              onChange={setField('jobLocation')}
              placeholder="Remote · Lahore, PK"
              maxLength={120}
            />
          </FooterField>
          <FooterField id="footer-job-excerpt" label="Role Summary">
            <FooterTextArea
              id="footer-job-excerpt"
              value={formData.excerpt}
              onChange={setField('excerpt')}
              placeholder="What this role owns..."
              maxLength={2000}
              rows={3}
            />
          </FooterField>
          <FooterField id="footer-job-content" label="Role Details">
            <FooterTextArea
              id="footer-job-content"
              value={formData.content}
              onChange={setField('content')}
              placeholder="Responsibilities and requirements..."
              maxLength={12000}
              rows={5}
            />
          </FooterField>
          <FooterField id="footer-job-apply-url" label="Apply / Careers URL">
            <FooterTextInput
              id="footer-job-apply-url"
              value={formData.externalUrl}
              onChange={setField('externalUrl')}
              placeholder="https://careers.eventthon.com/apply"
              maxLength={500}
            />
          </FooterField>
        </>
      ) : null}

      {flags.showContactLeads ? (
        <>
          <FooterField id="footer-contact-email" label="Contact Email" hint="Lead routing inbox.">
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
          <FooterField id="footer-contact-excerpt" label="Contact Intro">
            <FooterTextArea
              id="footer-contact-excerpt"
              value={formData.excerpt}
              onChange={setField('excerpt')}
              placeholder="How we respond to inquiries..."
              maxLength={2000}
              rows={2}
            />
          </FooterField>
          <FooterField id="footer-contact-content" label="Contact Context">
            <FooterTextArea
              id="footer-contact-content"
              value={formData.content}
              onChange={setField('content')}
              placeholder="Office hours, support tiers, SLA notes..."
              maxLength={12000}
              rows={4}
            />
          </FooterField>
        </>
      ) : null}

      {flags.showPolicyBlock ? (
        <>
          <FooterField id="footer-policy-version" label="Policy Version" hint="e.g. v2.1 · Jan 2026">
            <FooterTextInput
              id="footer-policy-version"
              value={formData.policyVersion}
              onChange={setField('policyVersion')}
              placeholder="v1.0"
              maxLength={40}
            />
          </FooterField>
          <FooterField id="footer-policy-content" label="Policy Body" hint="Legal copy / HTML policy blocks.">
            <FooterTextArea
              id="footer-policy-content"
              value={formData.content}
              onChange={setField('content')}
              placeholder="Section 1. Data we collect..."
              maxLength={12000}
              rows={8}
            />
          </FooterField>
        </>
      ) : null}
    </>
  );
}
