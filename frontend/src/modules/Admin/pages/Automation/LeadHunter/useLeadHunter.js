import { useCallback, useMemo, useState } from 'react';
import { buildPitchDraft } from './leadHunterBranding';
import { extractLeads, sendPitch } from './leadHunterApi';
import useLeadHunterDiscovery from './useLeadHunterDiscovery';

const EMPTY_FORM = { countryCode: '', country: '', category: '', websiteUrl: '' };

export default function useLeadHunter() {
  const [form, setForm] = useState(EMPTY_FORM);
  const [leads, setLeads] = useState([]);
  const [selectedId, setSelectedId] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  const patchForm = useCallback((key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  }, []);

  const setErrorSafe = useCallback((msg) => setError(msg), []);
  const setNoticeSafe = useCallback((msg) => setNotice(msg), []);

  const discovery = useLeadHunterDiscovery(patchForm, setNoticeSafe, setErrorSafe);

  const selectedLead = useMemo(
    () => leads.find((row) => row.id === selectedId) || leads[0] || null,
    [leads, selectedId],
  );

  const pitch = useMemo(() => {
    if (!selectedLead) return null;
    return buildPitchDraft({
      lead: selectedLead,
      category: form.category || selectedLead.category,
      country: form.country || selectedLead.country,
    });
  }, [selectedLead, form.category, form.country]);

  const patchCountry = useCallback((isoCode, countryName) => {
    setForm((prev) => ({
      ...prev,
      countryCode: isoCode,
      country: countryName,
    }));
  }, []);

  const runGoogleSearch = useCallback(() => discovery.runGoogleSearch(form), [discovery, form]);

  const runExtract = useCallback(async () => {
    setBusy(true);
    setError('');
    setNotice('');
    try {
      const res = await extractLeads({
        country: form.country.trim(),
        category: form.category.trim(),
        website_url: form.websiteUrl.trim(),
      });
      const rows = Array.isArray(res?.leads) ? res.leads : [];
      setLeads(rows);
      setSelectedId(rows[0]?.id || '');
      setNotice(res?.message || 'Lead extract completed.');
      return true;
    } catch (err) {
      setLeads([]);
      setError(err?.response?.data?.detail || err?.message || 'Extract failed');
      return false;
    } finally {
      setBusy(false);
    }
  }, [form]);

  const runSendPitch = useCallback(async () => {
    if (!selectedLead || !pitch) return false;
    setBusy(true);
    setError('');
    setNotice('');
    try {
      const res = await sendPitch({
        lead_id: selectedLead.id,
        email: selectedLead.email,
        subject: pitch.subject,
        body: `${pitch.greeting}\n\n${pitch.body}\n\n${pitch.signoff}`,
        country: form.country || selectedLead.country,
        category: form.category || selectedLead.category,
      });
      setNotice(res?.message || 'Pitch sent via EventThon Network.');
      return true;
    } catch (err) {
      setError(err?.response?.data?.detail || err?.message || 'Send pitch failed');
      return false;
    } finally {
      setBusy(false);
    }
  }, [form, pitch, selectedLead]);

  return {
    form,
    patchForm,
    patchCountry,
    leads,
    selectedId,
    setSelectedId,
    selectedLead,
    pitch,
    busy,
    error,
    notice,
    runExtract,
    runSendPitch,
    runGoogleSearch,
    discoveredLinks: discovery.discoveredLinks,
    searchBusy: discovery.searchBusy,
    websiteHighlight: discovery.websiteHighlight,
    websiteInputRef: discovery.websiteInputRef,
    loadIntoHunter: discovery.loadIntoHunter,
  };
}
