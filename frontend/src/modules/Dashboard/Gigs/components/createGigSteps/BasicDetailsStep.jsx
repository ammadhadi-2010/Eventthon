import React from 'react';
import { FiClock, FiFileText, FiGrid, FiLayers, FiTag, FiType } from 'react-icons/fi';
import { GLOBAL_SERVICE_CATEGORIES } from '../../../../../data/globalCategories';

const BasicDetailsStep = ({
  title,
  setTitle,
  ownerType,
  setOwnerType,
  selectedSquadId,
  setSelectedSquadId,
  squadOptions,
  gigCategory,
  setGigCategory,
  serviceType,
  setServiceType,
  deliveryTime,
  setDeliveryTime,
  tagsInput,
  setTagsInput,
  descriptionHtml,
  textLength,
  editorRef,
  onDescriptionInput,
  toolbarItems,
  activeTools,
  applyFormat,
}) => {
  const categoryOptions = GLOBAL_SERVICE_CATEGORIES.slice(0, 12);
  const serviceTypeOptions = [
    'Frontend Development',
    'Backend Development',
    'Full Stack',
    'UI / UX Design',
    'Mobile Apps',
    'WordPress / CMS',
    'DevOps & Cloud',
    'Content & Copywriting',
    'SEO & Growth',
    'Data & Analytics',
    'Video / Motion',
    'Consulting',
  ];
  const deliveryTimeOptions = ['1 Day', '2 Days', '3 Days', '5 Days', '7 Days', '14 Days', 'Milestone Based'];

  return (
    <div className="create-gig-form-card">
      <label><FiType size={13} /> Gig Title</label>
      <p className="create-gig-field-sub">Create a clear and catchy title for your gig</p>
      <input
        type="text"
        value={title}
        onChange={(event) => setTitle(event.target.value)}
        placeholder="e.g. I will develop a modern React.js website"
      />
      <div className="create-gig-counter">{title.length}/80</div>

      <label><FiGrid size={13} /> Gig Owner</label>
      <p className="create-gig-field-sub">Choose whether this gig belongs to you or a squad</p>
      <div className="create-gig-grid-2">
        <button
          type="button"
          className={`create-gig-owner-btn${ownerType === 'user' ? ' is-active' : ''}`}
          onClick={() => setOwnerType('user')}
        >
          Personal Gig
        </button>
        <button
          type="button"
          className={`create-gig-owner-btn${ownerType === 'squad' ? ' is-active' : ''}`}
          onClick={() => setOwnerType('squad')}
        >
          Squad Gig
        </button>
      </div>
      {ownerType === 'squad' ? (
        <div className="create-gig-select-wrap">
          <select value={selectedSquadId} onChange={(event) => setSelectedSquadId(event.target.value)}>
            <option value="" disabled>Select Squad</option>
            {squadOptions.map((squad) => (
              <option key={squad.id} value={squad.id}>{squad.name}</option>
            ))}
          </select>
        </div>
      ) : null}

      <label><FiGrid size={13} /> Gig Category</label>
      <p className="create-gig-field-sub">Choose the most relevant category for your service</p>
      <div className="create-gig-select-wrap">
        <select value={gigCategory} onChange={(event) => setGigCategory(event.target.value)}>
          <option value="" disabled>Select Category</option>
          {categoryOptions.map((item) => (
            <option key={item} value={item}>{item}</option>
          ))}
        </select>
      </div>

      <label><FiFileText size={13} /> Gig Description</label>
      <p className="create-gig-field-sub">Describe your service in detail. Tell buyers what you will do for them.</p>
      <div className="create-gig-toolbar">
        {toolbarItems.map((item) => (
          <button
            key={item}
            type="button"
            className={`create-gig-tool-btn${activeTools.includes(item) ? ' is-active' : ''}`}
            onMouseDown={(event) => {
              event.preventDefault();
              applyFormat(item);
            }}
          >
            {item}
          </button>
        ))}
      </div>
      <div
        ref={editorRef}
        className="create-gig-editor"
        contentEditable
        dir="ltr"
        suppressContentEditableWarning
        data-placeholder="Write a detailed description of your gig..."
        onInput={onDescriptionInput}
      />
      <div className="create-gig-counter">{textLength}/2500</div>

      <div className="create-gig-grid-2">
        <div>
          <label><FiLayers size={13} /> Service Type</label>
          <p className="create-gig-field-sub">What type of service are you offering?</p>
          <div className="create-gig-select-wrap">
            <select value={serviceType} onChange={(event) => setServiceType(event.target.value)}>
              <option value="" disabled>Select Service Type</option>
              {serviceTypeOptions.map((item) => (
                <option key={item} value={item}>{item}</option>
              ))}
            </select>
          </div>
        </div>
        <div>
          <label><FiClock size={13} /> Delivery Time</label>
          <p className="create-gig-field-sub">Expected delivery time</p>
          <div className="create-gig-select-wrap">
            <select value={deliveryTime} onChange={(event) => setDeliveryTime(event.target.value)}>
              <option value="" disabled>Select Delivery Time</option>
              {deliveryTimeOptions.map((item) => (
                <option key={item} value={item}>{item}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <label><FiTag size={13} /> Tags</label>
      <p className="create-gig-field-sub">Add relevant tags to help buyers find your gig</p>
      <input
        type="text"
        value={tagsInput}
        onChange={(event) => setTagsInput(event.target.value)}
        placeholder="e.g. React, Next.js, Web Development"
      />
      <div className="create-gig-counter">{tagsInput.length}/100</div>
    </div>
  );
};

export default BasicDetailsStep;
