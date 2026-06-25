import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import {
  EMPTY_EDIT_WIZARD_BASE,
  INITIAL_WIZARD_DATA,
  WIZARD_STEPS,
  normalizeWizardPricingTiers,
} from '../data/createProjectWizardData';
import { getSubcategoryItemsForParent } from '../../../../../data/serviceCatalog';
import {
  clearWizardStorage,
  loadWizardData,
  loadWizardStep,
  saveWizardData,
  saveWizardStep,
} from './wizardStorage';

const CreateProjectWizardContext = createContext(null);

function formatBudgetRange(min, max) {
  const a = Number(min);
  const b = Number(max);
  if (!a && !b) return '';
  if (!b || b <= a) return `$${Number(min).toLocaleString()}`;
  return `$${a.toLocaleString()} - $${b.toLocaleString()}`;
}

function withNormalizedPricing(merged, pricingSource) {
  const next = { ...merged };
  next.pricingTiers = normalizeWizardPricingTiers(
    pricingSource ?? merged.pricingTiers ?? INITIAL_WIZARD_DATA.pricingTiers,
  );
  if (!next.subCategory && next.category) {
    next.subCategory = getSubcategoryItemsForParent(next.category)[0]?.name || '';
  }
  return next;
}

function mergeWizardState(stored, initialData, { editMode = false } = {}) {
  if (editMode) {
    return withNormalizedPricing(
      { ...EMPTY_EDIT_WIZARD_BASE, ...(initialData || {}) },
      initialData?.pricingTiers,
    );
  }
  const base = { ...INITIAL_WIZARD_DATA, ...stored };
  if (!initialData) {
    return withNormalizedPricing(base, base.pricingTiers);
  }
  const merged = { ...base, ...initialData };
  return withNormalizedPricing(merged, initialData.pricingTiers ?? base.pricingTiers);
}

export function CreateProjectWizardProvider({ children, initialData = null, editMode = false }) {
  const [step, setStep] = useState(() => (editMode ? 1 : loadWizardStep()));
  const [wizardData, setWizardData] = useState(() =>
    mergeWizardState(editMode ? null : loadWizardData(), initialData, { editMode }),
  );

  useEffect(() => {
    if (editMode) clearWizardStorage();
  }, [editMode]);

  useEffect(() => {
    if (!initialData) return;
    setWizardData(mergeWizardState(editMode ? null : loadWizardData(), initialData, { editMode }));
    setStep(1);
  }, [initialData, editMode]);
  const [tagInput, setTagInput] = useState('');

  useEffect(() => {
    if (editMode) return;
    saveWizardData(wizardData);
  }, [wizardData, editMode]);

  useEffect(() => {
    if (editMode) return;
    saveWizardStep(step);
  }, [step, editMode]);

  const updateField = useCallback((key, value) => {
    setWizardData((prev) => {
      const next = { ...prev, [key]: value };
      if (key === 'category') {
        const subs = getSubcategoryItemsForParent(value);
        next.subCategory = subs[0]?.name || '';
      }
      if (key === 'budgetMin' || key === 'budgetMax') {
        const min = key === 'budgetMin' ? value : prev.budgetMin;
        const max = key === 'budgetMax' ? value : prev.budgetMax;
        next.budgetRange = formatBudgetRange(min, max);
      }
      if (key === 'teamSize') next.lookingFor = value;
      return next;
    });
  }, []);

  const updateListItem = useCallback((listKey, index, value) => {
    setWizardData((prev) => {
      const list = [...(prev[listKey] || [])];
      list[index] = value;
      return { ...prev, [listKey]: list };
    });
  }, []);

  const addListItem = useCallback((listKey, value = '') => {
    const label = String(value).trim();
    setWizardData((prev) => ({
      ...prev,
      [listKey]: [...(prev[listKey] || []), label || 'New item'],
    }));
  }, []);

  const removeListItem = useCallback((listKey, index) => {
    setWizardData((prev) => ({
      ...prev,
      [listKey]: (prev[listKey] || []).filter((_, i) => i !== index),
    }));
  }, []);

  const addTag = useCallback((raw) => {
    const label = String(raw || '').trim();
    if (!label) return;
    setWizardData((prev) => {
      if (prev.tags.includes(label)) return prev;
      return { ...prev, tags: [...prev.tags, label] };
    });
    setTagInput('');
  }, []);

  const removeTag = useCallback((label) => {
    setWizardData((prev) => ({ ...prev, tags: prev.tags.filter((t) => t !== label) }));
  }, []);

  const updatePackageTier = useCallback((tierKey, field, value) => {
    setWizardData((prev) => {
      const tiers = normalizeWizardPricingTiers(prev.pricingTiers);
      return {
        ...prev,
        pricingTiers: {
          ...tiers,
          [tierKey]: { ...tiers[tierKey], [field]: value },
        },
      };
    });
  }, []);

  const updatePackageFeature = useCallback((tierKey, index, value) => {
    setWizardData((prev) => {
      const tiers = normalizeWizardPricingTiers(prev.pricingTiers);
      const features = [...(tiers[tierKey]?.features || [])];
      features[index] = value;
      return {
        ...prev,
        pricingTiers: {
          ...tiers,
          [tierKey]: { ...tiers[tierKey], features },
        },
      };
    });
  }, []);

  const setCoverPreview = useCallback((url) => {
    setWizardData((prev) => ({ ...prev, coverPreview: url }));
  }, []);

  const applyProjectTemplate = useCallback((template) => {
    setWizardData((prev) => {
      const next = {
        ...prev,
        selectedTemplateId: template.id,
        title: template.title,
        category: template.category,
        coverPreview: template.imageUrl,
        shortDescription: template.shortDescription || prev.shortDescription,
        tags: template.tags?.length ? [...template.tags] : prev.tags,
      };
      const subs = getSubcategoryItemsForParent(template.category);
      next.subCategory = subs[0]?.name || prev.subCategory || '';
      return next;
    });
  }, []);

  const persistSnapshot = useCallback(() => {
    saveWizardData(wizardData);
    saveWizardStep(step);
  }, [wizardData, step]);

  const nextStep = useCallback(() => {
    setWizardData((current) => {
      saveWizardData(current);
      return current;
    });
    setStep((s) => Math.min(WIZARD_STEPS.length, s + 1));
  }, []);

  const prevStep = useCallback(() => {
    setStep((s) => Math.max(1, s - 1));
  }, []);

  const goToStep = useCallback((target) => {
    setStep(Math.min(WIZARD_STEPS.length, Math.max(1, target)));
  }, []);

  const saveDraft = useCallback(() => {
    saveWizardData(wizardData);
    saveWizardStep(step);
    window.alert('Project draft saved to this browser session.');
  }, [wizardData, step]);

  const resetWizard = useCallback(() => {
    clearWizardStorage();
  }, []);

  const value = useMemo(
    () => ({
      step,
      wizardData,
      tagInput,
      setTagInput,
      updateField,
      updateListItem,
      addListItem,
      removeListItem,
      addTag,
      removeTag,
      setCoverPreview,
      applyProjectTemplate,
      nextStep,
      prevStep,
      goToStep,
      saveDraft,
      persistSnapshot,
      resetWizard,
      updatePackageTier,
      updatePackageFeature,
      totalSteps: WIZARD_STEPS.length,
    }),
    [
      step,
      wizardData,
      tagInput,
      updateField,
      updateListItem,
      addListItem,
      removeListItem,
      addTag,
      removeTag,
      updatePackageTier,
      updatePackageFeature,
      setCoverPreview,
      applyProjectTemplate,
      nextStep,
      prevStep,
      goToStep,
      saveDraft,
      persistSnapshot,
      resetWizard,
    ],
  );

  return (
    <CreateProjectWizardContext.Provider value={value}>{children}</CreateProjectWizardContext.Provider>
  );
}

export function useCreateProjectWizard() {
  const ctx = useContext(CreateProjectWizardContext);
  if (!ctx) {
    throw new Error('useCreateProjectWizard must be used within CreateProjectWizardProvider');
  }
  return ctx;
}
