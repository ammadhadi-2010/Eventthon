import { useCallback, useEffect, useState } from 'react';
import {
  fetchAdminProfileCore,
  runAdminProfileCommand,
  updateAdminProfile,
} from './adminProfileApi';
import { buildAdminProfileUpdateFormData } from './adminProfileForm';
import { DEFAULT_ADMIN_PROFILE } from './adminProfileDefaults';

const COMMAND_MAP = {
  'clear-cache': 'clear-cache',
  'main-lock': 'main-lock',
  'database-sync': 'database-sync',
};

export default function useAdminProfile() {
  const [profile, setProfile] = useState(DEFAULT_ADMIN_PROFILE);
  const [loading, setLoading] = useState(true);
  const [runningCommand, setRunningCommand] = useState('');
  const [statusText, setStatusText] = useState('');
  const [editOpen, setEditOpen] = useState(false);
  const [savingProfile, setSavingProfile] = useState(false);
  const [editError, setEditError] = useState('');
  const [successOpen, setSuccessOpen] = useState(false);

  const loadProfile = useCallback(async () => {
    setLoading(true);
    try {
      const data = await fetchAdminProfileCore();
      if (data) setProfile({ ...DEFAULT_ADMIN_PROFILE, ...data });
    } catch (error) {
      console.error('Admin profile load failed:', error);
      setStatusText('Could not refresh admin profile metrics. Showing cached defaults.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  const executeCommand = async (commandKey) => {
    const actionKey = COMMAND_MAP[commandKey];
    if (!actionKey) return;
    setRunningCommand(commandKey);
    setStatusText('');
    try {
      const result = await runAdminProfileCommand(actionKey);
      setStatusText(result?.message || 'Admin command executed successfully.');
      await loadProfile();
    } catch (error) {
      console.error('Admin command failed:', error);
      setStatusText('Command execution failed. Please try again.');
    } finally {
      setRunningCommand('');
    }
  };

  const saveProfile = async (form, avatarFile) => {
    setSavingProfile(true);
    setEditError('');
    try {
      const payload = buildAdminProfileUpdateFormData(form, avatarFile);
      const result = await updateAdminProfile(payload);
      const nextEmail = String(result?.data?.email || form.email || '').trim();
      if (nextEmail) localStorage.setItem('userEmail', nextEmail);
      setEditOpen(false);
      setSuccessOpen(true);
      window.setTimeout(() => setSuccessOpen(false), 5200);
      await loadProfile();
    } catch (error) {
      console.error('Admin profile update failed:', error);
      const detail = error?.response?.data?.detail;
      setEditError(typeof detail === 'string' ? detail : 'Could not save admin profile changes.');
    } finally {
      setSavingProfile(false);
    }
  };

  return {
    profile,
    loading,
    runningCommand,
    statusText,
    executeCommand,
    reload: loadProfile,
    editOpen,
    setEditOpen,
    savingProfile,
    editError,
    saveProfile,
    successOpen,
    setSuccessOpen,
  };
}
