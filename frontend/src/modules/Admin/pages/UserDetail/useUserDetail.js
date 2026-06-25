import { useCallback, useEffect, useMemo, useState } from 'react';
import { fetchAdminUserDetail } from '../../../../services/adminUserManagementService';
import { buildUserFallbackFromRow, mergeReviewProfile } from '../UserManagement/userProfileReviewUtils';

function seedProfile(seedRow) {
  return {
    user: buildUserFallbackFromRow(seedRow) || {},
    row: seedRow && typeof seedRow === 'object' ? { ...seedRow } : {},
  };
}

export default function useUserDetail(lookup, seedRowFromNav) {
  const seedProfileData = useMemo(() => seedProfile(seedRowFromNav), [seedRowFromNav]);
  const lookupKey = lookup?.id || lookup?.email || lookup?.mobile || '';

  const [user, setUser] = useState(seedProfileData.user);
  const [row, setRow] = useState(seedProfileData.row);
  const [loading, setLoading] = useState(Boolean(lookupKey));
  const [error, setError] = useState(null);

  useEffect(() => {
    setUser(seedProfileData.user);
    setRow(seedProfileData.row);
    setError(null);
    setLoading(Boolean(lookupKey));
  }, [lookupKey, seedProfileData]);

  const load = useCallback(async () => {
    if (!lookupKey || !lookup) {
      setUser({});
      setRow({});
      setLoading(false);
      setError(null);
      return;
    }
    setLoading(true);
    setError(null);
    setUser(seedProfileData.user);
    setRow(seedProfileData.row);
    try {
      const data = await fetchAdminUserDetail(lookup);
      const merged = mergeReviewProfile(seedRowFromNav, data.user || null, data.row || null);
      setUser(merged.user);
      setRow(merged.row);
    } catch (e) {
      setUser(seedProfileData.user);
      setRow(seedProfileData.row);
      setError(e?.response?.data?.detail || e?.message || 'Failed to load user');
    } finally {
      setLoading(false);
    }
  }, [lookup, lookupKey, seedProfileData, seedRowFromNav]);

  useEffect(() => {
    if (!lookupKey) return undefined;
    load();
  }, [load, lookupKey]);

  return { user, row, loading, error, actionKey: lookupKey, refetch: load };
}
