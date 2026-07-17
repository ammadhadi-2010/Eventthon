import { useCallback, useEffect, useState } from 'react';
import { fetchAiResponderSettings, saveAiResponderSettings } from '../../services/emailOutreachApi';

export default function useOutreachAiResponder() {
  const [autoPilotEnabled, setAutoPilotEnabled] = useState(false);
  const [systemPrompt, setSystemPrompt] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const data = await fetchAiResponderSettings();
      const settings = data?.settings || {};
      setAutoPilotEnabled(Boolean(settings.autoPilotEnabled));
      setSystemPrompt(settings.systemPrompt || '');
    } catch (err) {
      setError(err?.response?.data?.detail || err?.message || 'Failed to load AI Responder settings');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const save = async () => {
    setSaving(true);
    setError('');
    setNotice('');
    try {
      const data = await saveAiResponderSettings({
        auto_pilot_enabled: autoPilotEnabled,
        system_prompt: systemPrompt.trim(),
      });
      setNotice(data?.message || 'AI Responder settings saved.');
      const settings = data?.settings || {};
      setAutoPilotEnabled(Boolean(settings.autoPilotEnabled));
      setSystemPrompt(settings.systemPrompt || systemPrompt);
      return true;
    } catch (err) {
      setError(err?.response?.data?.detail || err?.message || 'Failed to save settings');
      return false;
    } finally {
      setSaving(false);
    }
  };

  return {
    autoPilotEnabled,
    setAutoPilotEnabled,
    systemPrompt,
    setSystemPrompt,
    loading,
    saving,
    error,
    notice,
    save,
    reload: load,
  };
}
