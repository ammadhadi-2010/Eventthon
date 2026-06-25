import { useCallback, useEffect, useMemo, useState } from 'react';
import { resolveJobsUserEmail } from '../utils/jobsUser';
import { clearJobAlertDraft, loadJobAlertDraft, saveJobAlertDraft } from './createJobAlertSession';
import { DEFAULT_FORM, JOB_ALERT_STEPS, SALARY_SLIDER } from './createJobAlertConstants';

export function useCreateJobAlertForm() {
  const draft = loadJobAlertDraft();
  const [step, setStep] = useState(draft?.step || 1);
  const [form, setForm] = useState(() => ({
    ...DEFAULT_FORM,
    ...draft?.form,
    notificationEmail: draft?.form?.notificationEmail || resolveJobsUserEmail(),
  }));

  useEffect(() => {
    saveJobAlertDraft(step, form);
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
      const list = prev[field];
      if (list.some((t) => t.toLowerCase() === tag.toLowerCase())) {
        return { ...prev, [inputField]: '' };
      }
      return { ...prev, [field]: [...list, tag], [inputField]: '' };
    });
  }, []);

  const removeTag = useCallback((field, tag) => {
    setForm((prev) => ({
      ...prev,
      [field]: prev[field].filter((t) => t !== tag),
    }));
  }, []);

  const estimatedMatches = useMemo(() => {
    const base = 80;
    const skillBoost = Math.min(form.skills.length * 8, 48);
    const keywordBoost = Math.min(form.keywords.length * 6, 24);
    const titleBoost = form.jobTitle.trim() ? 20 : 0;
    const low = base + skillBoost + keywordBoost + titleBoost;
    return { low, high: low + 60 };
  }, [form.jobTitle, form.skills.length, form.keywords.length]);

  const canGoNext = useMemo(() => {
    if (step === 1) return Boolean(form.jobTitle.trim());
    if (step === 5) return Boolean(form.notificationEmail.trim());
    return true;
  }, [step, form.jobTitle, form.notificationEmail]);

  const goNext = useCallback(() => {
    setStep((s) => Math.min(JOB_ALERT_STEPS.length, s + 1));
  }, []);

  const goBack = useCallback(() => {
    setStep((s) => Math.max(1, s - 1));
  }, []);

  const goToStep = useCallback((n) => {
    setStep(Math.min(JOB_ALERT_STEPS.length, Math.max(1, n)));
  }, []);

  const saveDraft = useCallback(() => {
    saveJobAlertDraft(step, form);
  }, [step, form]);

  const resetDraft = useCallback(() => {
    clearJobAlertDraft();
    setForm({ ...DEFAULT_FORM, notificationEmail: resolveJobsUserEmail() });
    setStep(1);
  }, []);

  return {
    step,
    form,
    patch,
    toggleChip,
    addTag,
    removeTag,
    estimatedMatches,
    canGoNext,
    goNext,
    goBack,
    goToStep,
    saveDraft,
    resetDraft,
    salaryBounds: SALARY_SLIDER,
    isFirst: step === 1,
    isLast: step === JOB_ALERT_STEPS.length,
  };
}
