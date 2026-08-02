import { useCallback, useEffect, useState } from 'react';
import { fetchPublicDonationConfig } from './donationApi';
import { DEFAULT_DONATION_SETTINGS, mergeDonationSettings } from './donationContent';
import { DONATION_CAUSES, DONATION_ORGANIZATIONS } from './donationData';

const FALLBACK_CAUSES = DONATION_CAUSES.map(({ id, label, color }) => ({
  id,
  label,
  color,
  iconKey: id === 'all' ? 'heart' : id === 'healthcare' ? 'health' : id === 'emergency' ? 'alert' : id === 'food' ? 'coffee' : id === 'water' ? 'droplet' : id === 'orphans' ? 'users' : 'book',
}));

export default function useDonationConfig() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [settings, setSettings] = useState(DEFAULT_DONATION_SETTINGS);
  const [causes, setCauses] = useState(FALLBACK_CAUSES);
  const [organizations, setOrganizations] = useState(DONATION_ORGANIZATIONS);

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const data = await fetchPublicDonationConfig();
      if (data) {
        setSettings(mergeDonationSettings(data.settings));
        if (Array.isArray(data.causes) && data.causes.length) setCauses(data.causes);
        if (Array.isArray(data.organizations) && data.organizations.length) {
          setOrganizations(data.organizations);
        }
      }
    } catch (err) {
      setError(err?.response?.data?.detail || err?.message || 'Could not load donation hub. Showing saved defaults.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  return { loading, error, settings, causes, organizations, reload: load };
}
