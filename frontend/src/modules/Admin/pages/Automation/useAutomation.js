import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  createAutomationPost,
  deleteAutomationPost,
  fetchAutomationMetrics,
  fetchAutomationPosts,
  fetchAutomationSettings,
  generateAutomationCaption,
  patchAutomationPostStatus,
  publishAutomationPost,
  saveAutomationSettings,
} from '../../../../services/adminAutomationService';
import { AUTOMATION_PLATFORMS, buildAutomationStats } from './automationData';

const DEFAULT_PLATFORMS = AUTOMATION_PLATFORMS.reduce((acc, p) => ({ ...acc, [p.id]: true }), {});

export function useAutomation() {
  const [metrics, setMetrics] = useState({});
  const [stats, setStats] = useState(buildAutomationStats({}));
  const [rows, setRows] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [viewAll, setViewAll] = useState(false);
  const [platformSettings, setPlatformSettings] = useState(DEFAULT_PLATFORMS);

  const reload = useCallback(async (nextPage = page, limit = viewAll ? 50 : 6) => {
    setLoading(true);
    setError('');
    try {
      const [m, postsRes, settingsRes] = await Promise.all([
        fetchAutomationMetrics(),
        fetchAutomationPosts({ page: nextPage, limit }),
        fetchAutomationSettings(),
      ]);
      setMetrics(m);
      setStats(buildAutomationStats(m));
      setRows(postsRes.rows);
      setTotal(postsRes.total);
      setPage(postsRes.page);
      if (settingsRes.platforms && Object.keys(settingsRes.platforms).length) {
        setPlatformSettings({ ...DEFAULT_PLATFORMS, ...settingsRes.platforms });
      }
    } catch (err) {
      setError(err?.response?.data?.detail || err?.message || 'Failed to load automation data');
    } finally {
      setLoading(false);
    }
  }, [page, viewAll]);

  useEffect(() => {
    reload(page);
  }, [reload, page, viewAll]);

  const connectedPlatforms = useMemo(
    () => AUTOMATION_PLATFORMS.filter((p) => platformSettings[p.id] !== false),
    [platformSettings],
  );

  const submitPost = async (form) => {
    setBusy(true);
    setError('');
    try {
      const fd = new FormData();
      fd.append('caption', form.caption);
      fd.append('post_type', form.postType);
      fd.append('platforms', JSON.stringify(form.platforms));
      fd.append('publish_mode', form.publishMode);
      if (form.scheduledAt) fd.append('scheduled_at', form.scheduledAt);
      if (form.file) fd.append('file', form.file);
      if (form.imageurl) fd.append('imageurl', form.imageurl);
      await createAutomationPost(fd);
      await reload(1);
      setPage(1);
      return true;
    } catch (err) {
      setError(err?.response?.data?.detail || err?.message || 'Failed to create post');
      return false;
    } finally {
      setBusy(false);
    }
  };

  const runGenerate = async (text) => {
    setBusy(true);
    try {
      return await generateAutomationCaption({ text, prompt: text });
    } catch (err) {
      setError(err?.response?.data?.detail || err?.message || 'AI generation failed');
      return '';
    } finally {
      setBusy(false);
    }
  };

  const saveSettings = async (platforms) => {
    setBusy(true);
    try {
      const saved = await saveAutomationSettings(platforms);
      setPlatformSettings({ ...DEFAULT_PLATFORMS, ...saved });
      setSettingsOpen(false);
      await reload(page);
    } catch (err) {
      setError(err?.response?.data?.detail || err?.message || 'Failed to save settings');
    } finally {
      setBusy(false);
    }
  };

  const publishPost = async (postId) => {
    setBusy(true);
    try {
      await publishAutomationPost(postId);
      await reload(page);
    } finally {
      setBusy(false);
    }
  };

  const setPostStatus = async (postId, status) => {
    setBusy(true);
    try {
      await patchAutomationPostStatus(postId, status);
      await reload(page);
    } finally {
      setBusy(false);
    }
  };

  const removePost = async (postId) => {
    setBusy(true);
    try {
      await deleteAutomationPost(postId);
      await reload(page);
    } finally {
      setBusy(false);
    }
  };

  return {
    metrics,
    stats,
    rows,
    total,
    page,
    loading,
    busy,
    error,
    settingsOpen,
    viewAll,
    platformSettings,
    connectedPlatforms,
    setPage,
    setSettingsOpen,
    setViewAll,
    reload,
    submitPost,
    runGenerate,
    saveSettings,
    publishPost,
    setPostStatus,
    removePost,
  };
}
