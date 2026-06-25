import { DEFAULT_FORM } from './createJobAlertConstants';

const KEY = 'eventthon:jobAlertDraft:v1';

function safeParse(raw) {
  try {
    const o = JSON.parse(raw);
    return o && typeof o === 'object' ? o : null;
  } catch {
    return null;
  }
}

export function loadJobAlertDraft() {
  if (typeof window === 'undefined') return null;
  const stored = safeParse(window.sessionStorage.getItem(KEY));
  if (!stored?.form) return null;
  return {
    step: Number(stored.step) || 1,
    form: { ...DEFAULT_FORM, ...stored.form },
  };
}

export function saveJobAlertDraft(step, form) {
  if (typeof window === 'undefined') return;
  window.sessionStorage.setItem(KEY, JSON.stringify({ step, form, savedAt: Date.now() }));
}

export function clearJobAlertDraft() {
  if (typeof window === 'undefined') return;
  window.sessionStorage.removeItem(KEY);
}
