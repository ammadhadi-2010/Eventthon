import { useCallback, useEffect, useState } from 'react';
import {
  deleteAdminDonationCause,
  deleteAdminDonationOrganization,
  fetchAdminDonationConfig,
  fetchAdminDonationIntents,
  saveAdminDonationCause,
  saveAdminDonationOrganization,
  saveAdminDonationSettings,
} from '../../../Donation/donationApi';
import { mergeDonationSettings } from '../../../Donation/donationContent';

const IMAGE_FIELD_BY_SLOT = {
  hero: 'heroImageUrl',
  reward: 'rewardImageUrl',
  learnmore: 'learnMoreImageUrl',
};

const EMPTY_CAUSE = {
  id: '',
  label: '',
  iconKey: 'heart',
  color: '#8b5cf6',
  active: true,
  sortOrder: 0,
};

const EMPTY_ORG = {
  id: '',
  name: '',
  description: '',
  website: '',
  causes: [],
  color: '#6366f1',
  logo: '',
  logoImageUrl: '',
  verified: true,
  active: true,
  sortOrder: 0,
};

export default function useAdminDonations() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState('');
  const [config, setConfig] = useState(null);
  const [intents, setIntents] = useState([]);
  const [causeDraft, setCauseDraft] = useState(EMPTY_CAUSE);
  const [orgDraft, setOrgDraft] = useState(EMPTY_ORG);

  const load = useCallback(async () => {
    setLoading(true);
    setStatus('');
    try {
      const [cfg, logs] = await Promise.all([
        fetchAdminDonationConfig(),
        fetchAdminDonationIntents(50),
      ]);
      setConfig({
        ...cfg,
        settings: mergeDonationSettings(cfg?.settings),
      });
      setIntents(logs);
    } catch (err) {
      setStatus(err?.response?.data?.detail || err?.message || 'Could not load donation config.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const refreshIntents = async () => {
    setSaving(true);
    try {
      const logs = await fetchAdminDonationIntents(50);
      setIntents(logs);
      setStatus('Donation activity refreshed.');
    } catch (err) {
      setStatus(err?.response?.data?.detail || err?.message || 'Could not refresh activity.');
    } finally {
      setSaving(false);
    }
  };

  const saveSettings = async () => {
    if (!config?.settings) return;
    setSaving(true);
    setStatus('');
    try {
      const data = await saveAdminDonationSettings(config.settings);
      setConfig({
        ...data,
        settings: mergeDonationSettings(data?.settings),
      });
      setStatus('Settings saved — live on /donate page.');
    } catch (err) {
      setStatus(err?.response?.data?.detail || err?.message || 'Save failed.');
    } finally {
      setSaving(false);
    }
  };

  const saveCause = async () => {
    const id = String(causeDraft.id || '').trim().toLowerCase();
    const label = String(causeDraft.label || '').trim();
    if (!id || !label) {
      setStatus('Cause id and label are required.');
      return;
    }
    setSaving(true);
    setStatus('');
    try {
      const data = await saveAdminDonationCause({
        ...causeDraft,
        id,
        label,
        causes: undefined,
        causesText: undefined,
      });
      setConfig({
        ...data,
        settings: mergeDonationSettings(data?.settings),
      });
      setCauseDraft(EMPTY_CAUSE);
      setStatus('Cause saved — visible on /donate when active.');
    } catch (err) {
      setStatus(err?.response?.data?.detail || err?.message || 'Could not save cause.');
    } finally {
      setSaving(false);
    }
  };

  const removeCause = async (causeId) => {
    if (!window.confirm('Delete this cause?')) return;
    setSaving(true);
    try {
      const data = await deleteAdminDonationCause(causeId);
      setConfig({
        ...data,
        settings: mergeDonationSettings(data?.settings),
      });
      setStatus('Cause deleted.');
    } catch (err) {
      setStatus(err?.response?.data?.detail || err?.message || 'Delete failed.');
    } finally {
      setSaving(false);
    }
  };

  const saveOrg = async () => {
    const id = String(orgDraft.id || '').trim().toLowerCase();
    const name = String(orgDraft.name || '').trim();
    if (!id || !name) {
      setStatus('Organization id and name are required.');
      return;
    }
    setSaving(true);
    setStatus('');
    try {
      const causes = String(orgDraft.causesText || '')
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);
      const data = await saveAdminDonationOrganization({
        ...orgDraft,
        id,
        name,
        causes: causes.length ? causes : orgDraft.causes || [],
        causesText: undefined,
      });
      setConfig({
        ...data,
        settings: mergeDonationSettings(data?.settings),
      });
      setOrgDraft(EMPTY_ORG);
      setStatus('Organization saved — visible on /donate when active.');
    } catch (err) {
      setStatus(err?.response?.data?.detail || err?.message || 'Could not save organization.');
    } finally {
      setSaving(false);
    }
  };

  const removeOrg = async (orgId) => {
    if (!window.confirm('Delete this organization?')) return;
    setSaving(true);
    try {
      const data = await deleteAdminDonationOrganization(orgId);
      setConfig({
        ...data,
        settings: mergeDonationSettings(data?.settings),
      });
      setStatus('Organization deleted.');
    } catch (err) {
      setStatus(err?.response?.data?.detail || err?.message || 'Delete failed.');
    } finally {
      setSaving(false);
    }
  };

  const editCause = (row) => setCauseDraft({ ...EMPTY_CAUSE, ...row });
  const editOrg = (row) => setOrgDraft({
    ...EMPTY_ORG,
    ...row,
    causesText: Array.isArray(row.causes) ? row.causes.join(', ') : '',
  });

  const resetCauseDraft = () => setCauseDraft(EMPTY_CAUSE);
  const resetOrgDraft = () => setOrgDraft(EMPTY_ORG);

  const updateSettingsField = (key, value) => {
    setConfig((prev) => ({
      ...prev,
      settings: { ...prev.settings, [key]: value },
    }));
  };

  const updateSettingsListItem = (listKey, index, field, value) => {
    setConfig((prev) => {
      const list = [...(prev.settings?.[listKey] || [])];
      list[index] = { ...list[index], [field]: value };
      return {
        ...prev,
        settings: { ...prev.settings, [listKey]: list },
      };
    });
  };

  const onImageUploaded = (result) => {
    const cfg = result?.config;
    if (cfg) {
      setConfig({
        ...cfg,
        settings: mergeDonationSettings(cfg?.settings),
      });
      setStatus(`${result.slot === 'hero' ? 'Hero' : result.slot === 'reward' ? 'Reward' : 'Learn More'} image uploaded — live on /donate.`);
      return;
    }
    const field = result?.field || IMAGE_FIELD_BY_SLOT[result?.slot];
    if (field && result?.url) {
      updateSettingsField(field, result.url);
      setStatus('Image uploaded — click Save all page settings if preview looks correct.');
    }
  };

  const clearImage = async (slot) => {
    const field = IMAGE_FIELD_BY_SLOT[slot];
    if (!field || !config?.settings) return;
    setSaving(true);
    setStatus('');
    try {
      const nextSettings = { ...config.settings, [field]: '' };
      const data = await saveAdminDonationSettings(nextSettings);
      setConfig({
        ...data,
        settings: mergeDonationSettings(data?.settings),
      });
      setStatus(`${slot === 'hero' ? 'Hero' : slot === 'reward' ? 'Reward' : 'Learn More'} image removed.`);
    } catch (err) {
      setStatus(err?.response?.data?.detail || err?.message || 'Could not remove image.');
    } finally {
      setSaving(false);
    }
  };

  return {
    loading,
    saving,
    status,
    config,
    intents,
    causeDraft,
    setCauseDraft,
    orgDraft,
    setOrgDraft,
    saveSettings,
    saveCause,
    removeCause,
    saveOrg,
    removeOrg,
    editCause,
    editOrg,
    resetCauseDraft,
    resetOrgDraft,
    updateSettingsField,
    updateSettingsListItem,
    onImageUploaded,
    clearImage,
    refreshIntents,
    reload: load,
  };
}
