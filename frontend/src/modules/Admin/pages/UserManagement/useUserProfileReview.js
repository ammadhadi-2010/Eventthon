import { useCallback, useEffect, useMemo, useState } from 'react';
import { fetchAdminUserDetail, updateUserStatus } from '../../../../services/adminUserManagementService';
import { buildUserFallbackFromRow, mergeReviewProfile, resolveUserLookup } from './userProfileReviewUtils';

function emptyProfile(seedRow) {
  return {
    user: buildUserFallbackFromRow(seedRow) || {},
    row: seedRow && typeof seedRow === 'object' ? { ...seedRow } : {},
  };
}

export default function useUserProfileReview(reviewTarget, { onComplete } = {}) {
  const seedRow = reviewTarget?.row || null;
  const lookup = useMemo(
    () => reviewTarget?.lookup || resolveUserLookup(seedRow),
    [reviewTarget, seedRow],
  );
  const lookupKey = lookup?.id || lookup?.email || lookup?.mobile || '';
  const seedProfile = useMemo(() => emptyProfile(seedRow), [seedRow]);

  const [user, setUser] = useState(seedProfile.user);
  const [row, setRow] = useState(seedProfile.row);
  const [loading, setLoading] = useState(Boolean(lookupKey));
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [actionError, setActionError] = useState(null);

  const actionKey = lookupKey;

  useEffect(() => {
    setUser(seedProfile.user);
    setRow(seedProfile.row);
    setError(null);
    setActionError(null);
    setLoading(Boolean(lookupKey));
  }, [lookupKey, seedProfile]);

  const load = useCallback(async () => {
    if (!lookupKey || !lookup) {
      setError('No user identifier available for this row.');
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    setUser(seedProfile.user);
    setRow(seedProfile.row);
    try {
      const data = await fetchAdminUserDetail(lookup);
      const merged = mergeReviewProfile(seedRow, data.user || null, data.row || null);
      setUser(merged.user);
      setRow(merged.row);
    } catch (e) {
      setUser(seedProfile.user);
      setRow(seedProfile.row);
      setError(e?.response?.data?.detail || e?.message || 'Failed to load full profile');
    } finally {
      setLoading(false);
    }
  }, [lookup, lookupKey, seedProfile, seedRow]);

  useEffect(() => {
    if (!lookupKey) return undefined;
    load();
  }, [load, lookupKey]);

  const approve = useCallback(async () => {
    if (!actionKey || submitting) return;
    setSubmitting(true);
    setActionError(null);
    try {
      await updateUserStatus(actionKey, 'approve_verification');
      onComplete?.('approved');
    } catch (e) {
      setActionError(e?.response?.data?.detail || e?.message || 'Approval failed');
      throw e;
    } finally {
      setSubmitting(false);
    }
  }, [actionKey, onComplete, submitting]);

  const reject = useCallback(
    async (feedback) => {
      if (!actionKey || submitting) return;
      const note = (feedback || '').trim();
      if (!note) {
        setActionError('Please describe what documentation is missing or needs correction.');
        return;
      }
      setSubmitting(true);
      setActionError(null);
      try {
        await updateUserStatus(actionKey, 'reject_verification', note);
        onComplete?.('rejected');
      } catch (e) {
        setActionError(e?.response?.data?.detail || e?.message || 'Rejection failed');
        throw e;
      } finally {
        setSubmitting(false);
      }
    },
    [actionKey, onComplete, submitting],
  );

  return {
    user,
    row,
    loading,
    error,
    submitting,
    actionError,
    approve,
    reject,
    reload: load,
  };
}
