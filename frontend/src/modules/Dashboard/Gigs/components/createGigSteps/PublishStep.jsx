import React from 'react';
import { FiCheckCircle, FiCircle } from 'react-icons/fi';

const PublishStep = ({
  checklist,
  title,
  category,
  tags,
  ownerType,
  squadLabel,
  serviceType,
  deliveryTime,
  startingPrice,
  deliveryDays,
  revisionsIncluded,
  packageFeaturesPreview,
  pricingTiers,
  addonsPreview,
  uploadsCount,
  visibility,
  setVisibility,
}) => {
  const addonList = (addonsPreview || '').split(',').map((t) => t.trim()).filter(Boolean);
  const featuresBlurb = (packageFeaturesPreview || '').trim();
  const featuresSummary = featuresBlurb
    ? (featuresBlurb.length > 96 ? `${featuresBlurb.slice(0, 96)}…` : featuresBlurb)
    : 'None';

  const checklistRows = [
    { key: 'hasTitleAndDescription', label: 'Title and description are complete' },
    { key: 'hasOwnerAndSquad', label: 'Personal or Squad ownership is configured' },
    { key: 'hasServiceBasics', label: 'Service type and listed delivery time' },
    { key: 'hasPricingAndTimeline', label: 'Basic, Standard, and Premium prices set' },
    { key: 'hasGallery', label: 'Gallery media has been uploaded' },
    { key: 'hasTagsAndCategory', label: 'Tags and category are set' },
  ];

  return (
    <div className="create-gig-form-card">
      <label>Final Checklist</label>
      <p className="create-gig-field-sub">Review your gig before publishing</p>

      <div className="create-gig-checklist">
        {checklistRows.map((row) => (
          <p key={row.key} className={checklist[row.key] ? 'is-complete' : 'is-pending'}>
            {checklist[row.key] ? <FiCheckCircle size={13} /> : <FiCircle size={13} />}
            {row.label}
          </p>
        ))}
      </div>

      <div className="create-gig-publish-preview">
        <h4>Gig Summary</h4>
        <div className="create-gig-publish-grid">
          <p><span>Title</span><strong>{title || 'Not added'}</strong></p>
          <p><span>Owner</span><strong>{ownerType === 'squad' ? `Squad · ${squadLabel || '—'}` : 'Personal'}</strong></p>
          <p><span>Category</span><strong>{category || 'Not selected'}</strong></p>
          <p><span>Service type</span><strong>{serviceType || 'Not selected'}</strong></p>
          <p><span>Listed delivery (basic)</span><strong>{deliveryTime || 'Not set'}</strong></p>
          <p><span>Starting price</span><strong>{startingPrice ? `$${startingPrice}` : 'Not set'}</strong></p>
          <p><span>Package delivery days</span><strong>{deliveryDays || 'Not set'}</strong></p>
          <p><span>Revisions included</span><strong>{revisionsIncluded ?? '0'}</strong></p>
          <p><span>Tags</span><strong>{tags.length ? tags.join(', ') : 'No tags'}</strong></p>
          <p><span>Package highlights</span><strong>{featuresSummary}</strong></p>
          {pricingTiers ? (
            <>
              <p>
                <span>Basic</span>
                <strong>
                  ${pricingTiers.basic?.price} · {pricingTiers.basic?.deliveryDays}d ·{' '}
                  {pricingTiers.basic?.revisions} rev
                </strong>
              </p>
              <p>
                <span>Standard</span>
                <strong>
                  ${pricingTiers.standard?.price} · {pricingTiers.standard?.deliveryDays}d ·{' '}
                  {pricingTiers.standard?.revisions} rev
                </strong>
              </p>
              <p>
                <span>Premium</span>
                <strong>
                  ${pricingTiers.premium?.price} · {pricingTiers.premium?.deliveryDays}d ·{' '}
                  {pricingTiers.premium?.revisions} rev
                </strong>
              </p>
            </>
          ) : null}
          <p><span>Add-ons</span><strong>{addonList.length ? addonList.join(', ') : 'None'}</strong></p>
          <p><span>Gallery uploads</span><strong>{uploadsCount}</strong></p>
        </div>
      </div>

      <label>Visibility</label>
      <p className="create-gig-field-sub">Choose how your gig should go live</p>
      <div className="create-gig-select-wrap">
        <select value={visibility} onChange={(event) => setVisibility(event.target.value)}>
          <option value="public">Publish Publicly</option>
          <option value="draft">Save as Draft</option>
        </select>
      </div>
    </div>
  );
};

export default PublishStep;
