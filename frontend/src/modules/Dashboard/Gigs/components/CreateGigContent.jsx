import './gigs-create-gig-mobile.css';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiCheck, FiClock, FiEye, FiHelpCircle, FiStar, FiTag } from 'react-icons/fi';
import BasicDetailsStep from './createGigSteps/BasicDetailsStep';
import { GigsHubBackButton } from './GigsHubBackButton';
import PricingStep from './createGigSteps/PricingStep';
import GalleryAddonsStep from './createGigSteps/GalleryAddonsStep';
import PublishStep from './createGigSteps/PublishStep';
import { createInitialGigPricingTiers } from './createGigData';
import API from '../../../../api/axiosConfig';
import {
  createGigStart,
  publishGig,
  saveGigPricing,
  uploadGigGallery,
} from '../services/gigsApi';
import { getGigsActorId } from '../utils/gigsSession';

const steps = ['Basic Details', 'Pricing', 'Gallery & Addons', 'Publish'];

const tips = [
  'Use a clear and keyword-rich title',
  'Write a detailed and engaging description',
  'Add high-quality images and videos',
  'Set a competitive and realistic price',
  'Respond to messages promptly',
];

const CreateGigContent = ({ onNavigateBack }) => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(0);
  const [descriptionHtml, setDescriptionHtml] = useState('');
  const [activeTools, setActiveTools] = useState([]);
  const [title, setTitle] = useState('');
  const [gigCategory, setGigCategory] = useState('');
  const [ownerType, setOwnerType] = useState('user');
  const [selectedSquadId, setSelectedSquadId] = useState('');
  const [squadOptions, setSquadOptions] = useState([]);
  const [serviceType, setServiceType] = useState('');
  const [deliveryTime, setDeliveryTime] = useState('');
  const [tagsInput, setTagsInput] = useState('');
  const [pricingTiers, setPricingTiers] = useState(createInitialGigPricingTiers);
  const [addonsText, setAddonsText] = useState('');
  const [visibility, setVisibility] = useState('public');
  const [uploads, setUploads] = useState([]);
  const [gigId, setGigId] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState('');
  const editorRef = useRef(null);
  const imageInputRef = useRef(null);
  const fileInputRef = useRef(null);
  const textLength = useMemo(() => {
    if (!descriptionHtml) return 0;
    return descriptionHtml.replace(/<[^>]*>/g, '').replace(/&nbsp;/g, ' ').trim().length;
  }, [descriptionHtml]);

  useEffect(() => {
    const loadSquads = async () => {
      const userId = localStorage.getItem('userId') || '';
      if (!userId) return;
      try {
        const res = await API.get('/squads/all');
        const raw = Array.isArray(res?.data) ? res.data : [];
        const mine = raw.filter((item) =>
          item?.leader_id === userId ||
          (Array.isArray(item?.members) && item.members.some((m) => m?.id === userId))
        );
        const mapped = mine.map((item) => ({
          id: item._id || item.id,
          name: item.squad_name || item.name || 'My Squad',
        })).filter((x) => x.id);
        setSquadOptions(mapped);
      } catch (error) {
        setSquadOptions([]);
      }
    };
    loadSquads();
  }, []);

  const applyFormat = (tool) => {
    const editor = editorRef.current;
    if (!editor) return;
    editor.focus();

    const cmdMap = {
      B: 'bold',
      I: 'italic',
      U: 'underline',
      '-': 'insertUnorderedList',
      '=': 'insertOrderedList',
      '~': 'strikeThrough',
      '...': 'insertHorizontalRule',
      '"': 'formatBlock',
    };

    if (tool === 'img') {
      imageInputRef.current?.click();
    } else if (tool === '</>') {
      const selectedText = window.getSelection()?.toString() || 'code';
      document.execCommand('insertText', false, `\`${selectedText}\``);
    } else if (tool === '"') {
      document.execCommand('formatBlock', false, 'blockquote');
    } else if (cmdMap[tool]) {
      document.execCommand(cmdMap[tool], false, null);
    }

    setDescriptionHtml(editor.innerHTML);
    setActiveTools((prev) => (prev.includes(tool) ? prev.filter((t) => t !== tool) : [...prev, tool]));
  };

  const toolbarItems = ['B', 'I', 'U', '-', '=', '~', '...', 'img', '"', '</>'];

  const onUploadFiles = (event, type) => {
    const files = Array.from(event.target.files || []);
    if (!files.length) return;
    const mapped = files.map((file) => ({
      id: `${type}-${file.name}-${file.size}-${Date.now()}`,
      name: file.name,
      sizeKb: Math.max(1, Math.round(file.size / 1024)),
      type,
      file,
    }));
    setUploads((prev) => [...prev, ...mapped]);
    event.target.value = '';
  };

  const removeUpload = (id) => {
    setUploads((prev) => prev.filter((item) => item.id !== id));
  };

  const updatePackageTier = (tierKey, field, value) => {
    setPricingTiers((prev) => ({
      ...prev,
      [tierKey]: { ...prev[tierKey], [field]: value },
    }));
  };

  const updatePackageFeature = (tierKey, index, value) => {
    setPricingTiers((prev) => {
      const features = [...(prev[tierKey]?.features || [])];
      features[index] = value;
      return { ...prev, [tierKey]: { ...prev[tierKey], features } };
    });
  };

  const standardTier = pricingTiers.standard;
  const startingPrice = standardTier?.price || '';
  const deliveryDays = standardTier?.deliveryDays || '3';
  const revisionsIncluded = standardTier?.revisions || '2';
  const packageFeatures = (standardTier?.features || []).join('\n');

  const resetGigForm = () => {
    setCurrentStep(0);
    setDescriptionHtml('');
    setActiveTools([]);
    setTitle('');
    setGigCategory('');
    setOwnerType('user');
    setSelectedSquadId('');
    setServiceType('');
    setDeliveryTime('');
    setTagsInput('');
    setPricingTiers(createInitialGigPricingTiers());
    setAddonsText('');
    setVisibility('public');
    setUploads([]);
    setGigId('');
  };

  const parsedTags = tagsInput.split(',').map((t) => t.trim()).filter(Boolean);

  const selectedSquadLabel = useMemo(
    () => squadOptions.find((s) => s.id === selectedSquadId)?.name || '',
    [squadOptions, selectedSquadId],
  );

  const checklist = {
    hasTitleAndDescription:
      title.trim().length >= 3 &&
      descriptionHtml.replace(/<[^>]*>/g, '').replace(/&nbsp;/g, ' ').trim().length >= 20,
    hasOwnerAndSquad:
      ownerType === 'user' || (ownerType === 'squad' && Boolean(selectedSquadId)),
    hasServiceBasics: Boolean(serviceType.trim()) && Boolean(deliveryTime.trim()),
    hasPricingAndTimeline: Number(startingPrice || 0) > 0 && Number(deliveryDays || 0) > 0,
    hasGallery: uploads.length > 0,
    hasTagsAndCategory: Boolean(gigCategory) && parsedTags.length > 0,
  };
  const isChecklistComplete = Object.values(checklist).every(Boolean);

  const saveCurrentStep = async () => {
    setSaveMessage('');
    const sellerUserId = getGigsActorId();
    if (!sellerUserId) {
      setSaveMessage('Missing session. Please log in again.');
      return false;
    }

    try {
      setIsSaving(true);

      if (currentStep === 0) {
        const payload = {
          seller_user_id: sellerUserId,
          owner_type: ownerType,
          squad_id: ownerType === 'squad' ? selectedSquadId : null,
          squad_name: ownerType === 'squad' ? (selectedSquadLabel || null) : null,
          title: title.trim(),
          category: gigCategory || 'General',
          description: descriptionHtml,
          service_type: serviceType || 'General',
          delivery_time: deliveryTime || '3 Days',
          tags: tagsInput.split(',').map((t) => t.trim()).filter(Boolean),
        };
        if (!payload.title || payload.title.length < 3) {
          setSaveMessage('Title must be at least 3 characters.');
          return false;
        }
        if (!serviceType.trim()) {
          setSaveMessage('Please select a service type.');
          return false;
        }
        if (!deliveryTime.trim()) {
          setSaveMessage('Please select a delivery time (basic timeline).');
          return false;
        }
        if (payload.owner_type === 'squad' && !payload.squad_id) {
          setSaveMessage('Please select a squad for squad gig.');
          return false;
        }
        const res = await createGigStart(payload);
        setGigId(res?.gig?._id || '');
        return true;
      }

      if (!gigId) {
        setSaveMessage('Please complete Basic Details first.');
        return false;
      }

      if (currentStep === 1) {
        const standard = pricingTiers.standard || {};
        const payload = {
          starting_price: Number(standard.price || 0),
          revisions_included: Number(standard.revisions || 0),
          delivery_days: Number(standard.deliveryDays || 3),
          package_features: (standard.features || []).join('\n'),
          addons: addonsText.split(',').map((t) => t.trim()).filter(Boolean),
          pricing_tiers: pricingTiers,
        };
        await saveGigPricing(gigId, payload);
        return true;
      }

      if (currentStep === 2) {
        const formData = new FormData();
        uploads.filter((u) => u.type === 'image').forEach((u) => formData.append('images', u.file));
        uploads.filter((u) => u.type === 'file').forEach((u) => formData.append('files', u.file));
        await uploadGigGallery(gigId, formData);
        return true;
      }

      if (currentStep === 3) {
        if (!isChecklistComplete) {
          setSaveMessage('Please complete all checklist items before publishing.');
          return false;
        }
        const payload = {
          visibility,
          status: visibility === 'draft' ? 'Draft' : 'Published',
        };
        await publishGig(gigId, payload);
        setSaveMessage('Gig published successfully.');
        return true;
      }

      return false;
    } catch (error) {
      const message = error?.response?.data?.detail || error?.response?.data?.message || error.message || 'Save failed';
      setSaveMessage(String(message));
      return false;
    } finally {
      setIsSaving(false);
    }
  };

  const deleteGig = async () => {
    if (!gigId) {
      setSaveMessage('No gig found to delete.');
      return;
    }
    const confirmed = window.confirm('Are you sure you want to delete this gig? This action cannot be undone.');
    if (!confirmed) return;
    try {
      setIsSaving(true);
      setSaveMessage('');
      await API.delete(`/api/gigs/${gigId}`);
      resetGigForm();
      setSaveMessage('Gig deleted successfully.');
    } catch (error) {
      const message = error?.response?.data?.detail || error?.response?.data?.message || error.message || 'Delete failed';
      setSaveMessage(String(message));
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <section className="gigs-main-stack">
      <div className="gigs-card create-gig-shell">
        <div className="create-gig-layout">
          <div className="create-gig-main">
            <div className="create-gig-head">
              <GigsHubBackButton
                onBack={() => {
                  if (typeof onNavigateBack === 'function') onNavigateBack();
                  else navigate('/gigs');
                }}
              />
              <div>
                <h2>Create New Gig</h2>
                <p>Fill in the details to create your gig and start selling your service.</p>
              </div>
            </div>

            <div className="create-gig-steps">
              {steps.map((step, index) => (
                <button
                  key={step}
                  type="button"
                  className={`create-gig-step${index === currentStep ? ' is-active' : ''}`}
                  onClick={() => setCurrentStep(index)}
                >
                  <span>{index + 1}</span>
                  <p>{step}</p>
                </button>
              ))}
            </div>

            {currentStep === 0 ? (
              <BasicDetailsStep
                title={title}
                setTitle={setTitle}
                gigCategory={gigCategory}
                setGigCategory={setGigCategory}
                ownerType={ownerType}
                setOwnerType={setOwnerType}
                selectedSquadId={selectedSquadId}
                setSelectedSquadId={setSelectedSquadId}
                squadOptions={squadOptions}
                serviceType={serviceType}
                setServiceType={setServiceType}
                deliveryTime={deliveryTime}
                setDeliveryTime={setDeliveryTime}
                tagsInput={tagsInput}
                setTagsInput={setTagsInput}
                descriptionHtml={descriptionHtml}
                textLength={textLength}
                editorRef={editorRef}
                onDescriptionInput={(event) => setDescriptionHtml(event.currentTarget.innerHTML)}
                toolbarItems={toolbarItems}
                activeTools={activeTools}
                applyFormat={applyFormat}
              />
            ) : null}

            {currentStep === 1 ? (
              <PricingStep
                pricingTiers={pricingTiers}
                updatePackageTier={updatePackageTier}
                updatePackageFeature={updatePackageFeature}
                addonsText={addonsText}
                setAddonsText={setAddonsText}
              />
            ) : null}

            {currentStep === 2 ? (
              <GalleryAddonsStep
                imageInputRef={imageInputRef}
                fileInputRef={fileInputRef}
                uploads={uploads}
                onUploadFiles={onUploadFiles}
                removeUpload={removeUpload}
              />
            ) : null}

            {currentStep === 3 ? (
              <PublishStep
                checklist={checklist}
                title={title}
                category={gigCategory}
                tags={parsedTags}
                ownerType={ownerType}
                squadLabel={selectedSquadLabel}
                serviceType={serviceType}
                deliveryTime={deliveryTime}
                startingPrice={startingPrice}
                deliveryDays={deliveryDays}
                revisionsIncluded={revisionsIncluded}
                packageFeaturesPreview={packageFeatures}
                pricingTiers={pricingTiers}
                addonsPreview={addonsText}
                uploadsCount={uploads.length}
                visibility={visibility}
                setVisibility={setVisibility}
              />
            ) : null}

            {saveMessage ? <p className="create-gig-save-message">{saveMessage}</p> : null}

            <div className="create-gig-actions">
              {gigId ? (
                <button
                  type="button"
                  className="create-gig-btn danger"
                  onClick={deleteGig}
                  disabled={isSaving}
                >
                  Delete Gig
                </button>
              ) : null}
              <button
                type="button"
                className="create-gig-btn ghost"
                onClick={() => setCurrentStep((prev) => Math.max(0, prev - 1))}
              >
                Back
              </button>
              <button
                type="button"
                className="create-gig-btn primary"
                onClick={async () => {
                  const ok = await saveCurrentStep();
                  if (ok && currentStep < 3) {
                    setCurrentStep((prev) => Math.min(3, prev + 1));
                  }
                }}
                disabled={isSaving}
              >
                {isSaving ? 'Saving...' : currentStep === 3 ? 'Publish Gig' : 'Save & Continue'}
              </button>
            </div>
          </div>

          <aside className="create-gig-side">
            <div className="create-gig-preview-card">
              <h4><FiEye size={13} /> Gig Preview</h4>
              <div className="create-gig-preview-banner">
                <div className="create-gig-preview-banner-placeholder">
                  Preview Image
                </div>
              </div>
              <div className="create-gig-preview-seller">
                <div className="create-gig-preview-avatar">UA</div>
                <div>
                  <p className="create-gig-preview-name">Unman Ali</p>
                  <p className="create-gig-preview-level">Level 2 Seller</p>
                </div>
              </div>
              <p className="create-gig-preview-owner-line">
                {ownerType === 'squad' ? <>Squad gig · <strong>{selectedSquadLabel || 'Select squad'}</strong></> : <><strong>Personal</strong> gig</>}
              </p>
              {gigCategory ? <p className="create-gig-preview-category">{gigCategory}</p> : null}
              <h3>{title || 'I will develop a modern React.js website'}</h3>
              <p className="create-gig-preview-service">{serviceType || 'Service type'} · SLA {deliveryDays || '—'} days (Standard)</p>
              <p className="create-gig-rating"><FiStar size={12} /> New <span>(0 orders)</span></p>
              <div className="create-gig-preview-meta">
                <span><FiClock size={12} /> Listed delivery <strong>{deliveryTime || '—'}</strong></span>
                <span><FiTag size={12} /> From <strong>${pricingTiers.basic?.price || '—'}</strong></span>
              </div>
              <div className="create-gig-preview-packages">
                <span>Basic ${pricingTiers.basic?.price || '—'}</span>
                <span>Std ${pricingTiers.standard?.price || '—'}</span>
                <span>Pro ${pricingTiers.premium?.price || '—'}</span>
              </div>
            </div>

            <div className="create-gig-preview-card">
              <h4>Tips for a Successful Gig</h4>
              <ul>
                {tips.map((tip) => (
                  <li key={tip}><FiCheck size={12} /> {tip}</li>
                ))}
              </ul>
            </div>

            <div className="create-gig-preview-card">
              <h4><FiHelpCircle size={13} /> Need Help?</h4>
              <p>Check out our seller guide or contact support.</p>
              <div className="create-gig-side-actions">
                <button type="button" className="create-gig-btn ghost" onClick={() => navigate('/dashboard')}>Seller Guide</button>
                <button type="button" className="create-gig-btn primary" onClick={() => navigate('/messages')}>Contact Support</button>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </section>
  );
};

export default CreateGigContent;
