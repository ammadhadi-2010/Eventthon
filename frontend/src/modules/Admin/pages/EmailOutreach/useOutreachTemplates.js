import { useCallback, useEffect, useState } from 'react';
import { createOutreachTemplate, fetchOutreachTemplates } from '../../services/emailOutreachApi';
import { OUTREACH_TEMPLATE_ITEMS } from './outreachTemplatesData';
import { resolveTemplateIcon } from './outreachTemplateIcons';

function mapTemplateRow(row) {
  return {
    id: row.id,
    title: row.title,
    subtitle: row.description || row.subtitle || '',
    subject: row.subject,
    body: row.body,
    tone: row.tone || 'purple',
    icon: typeof row.icon === 'function' ? row.icon : resolveTemplateIcon(row.icon),
  };
}

function mapFallbackTemplates() {
  return OUTREACH_TEMPLATE_ITEMS.map((item) => ({
    ...item,
    subtitle: item.subtitle || '',
    icon: item.icon,
  }));
}

export default function useOutreachTemplates() {
  const [templates, setTemplates] = useState(mapFallbackTemplates());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const refresh = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const data = await fetchOutreachTemplates();
      const rows = Array.isArray(data?.templates) ? data.templates : [];
      setTemplates(rows.map(mapTemplateRow));
    } catch (err) {
      setTemplates(mapFallbackTemplates());
      setError(err?.response?.data?.detail || err?.message || 'Using offline templates');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const saveTemplate = async (payload) => {
    const data = await createOutreachTemplate(payload);
    await refresh();
    return data?.template;
  };

  return { templates, loading, error, refresh, saveTemplate };
}
