import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  clearOpportunityDraft,
  loadOpportunityDraft,
  saveOpportunityDraft,
} from './opportunitySession';
import { DEFAULT_OPPORTUNITY_FORM, OPPORTUNITY_STEPS } from './opportunityConstants';

export function useCreateOpportunityForm() {
  const draft = loadOpportunityDraft();
  const [step, setStep] = useState(draft?.step || 1);
  const [form, setForm] = useState(() => ({
    ...DEFAULT_OPPORTUNITY_FORM,
    ...draft?.form,
  }));

  useEffect(() => {
    saveOpportunityDraft(step, form);
  }, [step, form]);

  const patch = useCallback((updates) => {
    setForm((prev) => ({ ...prev, ...updates }));
  }, []);

  const toggleChip = useCallback((field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  }, []);

  const addTag = useCallback((field, inputField, raw) => {
    const tag = String(raw || '').trim();
    if (!tag) return;
    setForm((prev) => {
      const list = prev[field] || [];
      if (list.some((t) => t.toLowerCase() === tag.toLowerCase())) {
        return { ...prev, [inputField]: '' };
      }
      return { ...prev, [field]: [...list, tag], [inputField]: '' };
    });
  }, []);

  const removeTag = useCallback((field, tag) => {
    setForm((prev) => ({
      ...prev,
      [field]: (prev[field] || []).filter((t) => t !== tag),
    }));
  }, []);

  const canGoNext = useMemo(() => {
    if (step === 1) return Boolean(form.jobTitle.trim()) && Boolean(form.opportunityType);
    if (step === 2) return Boolean(form.jobDescription.trim());
    if (step === 3) {
      if (form.budgetModel === 'Fixed' || form.budgetModel === 'Hourly') {
        return Boolean(String(form.budgetAmount || '').trim());
      }
      if (form.budgetModel === 'Equity') {
        return Boolean(String(form.equityShare || '').trim());
      }
      return true;
    }
    return true;
  }, [step, form]);

  const goNext = useCallback(() => {
    setStep((s) => Math.min(OPPORTUNITY_STEPS.length, s + 1));
  }, []);

  const goBack = useCallback(() => {
    setStep((s) => Math.max(1, s - 1));
  }, []);

  const goToStep = useCallback((n) => {
    setStep(Math.min(OPPORTUNITY_STEPS.length, Math.max(1, n)));
  }, []);

  const saveDraft = useCallback(() => {
    saveOpportunityDraft(step, form);
  }, [step, form]);

  return {
    step,
    form,
    patch,
    toggleChip,
    addTag,
    removeTag,
    canGoNext,
    goNext,
    goBack,
    goToStep,
    saveDraft,
    isLast: step === OPPORTUNITY_STEPS.length,
  };
}
