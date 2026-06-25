import { useCallback, useEffect, useState } from 'react';
import API from '../../api/axiosConfig';
import {
  buildTelemetryAuthHeaders,
  getTelemetrySessionId,
  resolveTelemetryUserId,
} from '../../hooks/useTelemetry';
import { hasStoredSession } from '../../utils/storedUser';
import { MOCK_TELEMETRY_BATCH } from './aiGrowthInsightsConstants';

function parseInsightRows(payload) {
  if (!payload || typeof payload !== 'object') return [];
  const rows = payload.insights ?? payload.data ?? [];
  return Array.isArray(rows) ? rows.filter(Boolean) : [];
}

async function seedMockTelemetryLogs(authId) {
  const sessionId = getTelemetrySessionId();
  const headers = buildTelemetryAuthHeaders();
  console.log('Seed simulation dispatch started for MongoDB user id:', authId);

  for (const row of MOCK_TELEMETRY_BATCH) {
    const payload = {
      user_id: authId,
      session_id: sessionId,
      endpoint_url: row.endpoint_url,
      time_spent_seconds: row.time_spent_seconds,
      scroll_depth_percentage: row.scroll_depth_percentage,
    };
    console.log('Telemetry Payload Sent:', payload);
    await API.post('/api/telemetry/log-activity', payload, { headers, timeout: 10000 });
  }

  console.log('Seed simulation dispatch complete. Total logs:', MOCK_TELEMETRY_BATCH.length);
}

export default function useAIGrowthInsights(controlledOpen) {
  const [isLoading, setIsLoading] = useState(false);
  const [seeding, setSeeding] = useState(false);
  const [insights, setInsights] = useState([]);
  const [error, setError] = useState('');

  const fetchInsights = useCallback(async () => {
    setIsLoading(true);
    setError('');

    try {
      if (!hasStoredSession()) {
        setInsights([]);
        setError('Sign in to unlock AI growth insights.');
        return;
      }

      const authId = resolveTelemetryUserId();
      const headers = buildTelemetryAuthHeaders();
      if (!authId || !headers['X-User-Id']) {
        setInsights([]);
        setError('MongoDB user id missing. Please sign in again.');
        return;
      }

      console.log('Insights fetch started for MongoDB user id:', authId);
      const response = await API.get('/api/telemetry/insights', {
        headers,
        params: { session_id: getTelemetrySessionId() },
        timeout: 12000,
        withCredentials: true,
      });

      const payload = response?.data;
      if (payload?.status && payload.status !== 'success') {
        setInsights([]);
        setError(payload?.message || 'Insights service returned an unexpected status.');
        return;
      }

      const rows = parseInsightRows(payload);
      console.log('Insights fetch complete. Rows received:', rows.length);
      setInsights(rows);
    } catch (err) {
      setInsights([]);
      console.error('Insights fetch failed:', err);
      const detail = err?.response?.data?.detail;
      setError(typeof detail === 'string' ? detail : 'Could not load growth insights right now. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const runMockSeed = async () => {
    const authId = resolveTelemetryUserId();
    if (!authId) {
      setError('MongoDB user id missing. Please sign in again.');
      return;
    }

    setSeeding(true);
    setError('');
    try {
      await seedMockTelemetryLogs(authId);
      setInsights([]);
      setIsLoading(true);
      console.log('Seed complete. Triggering insights re-fetch for user id:', authId);
      await fetchInsights();
    } catch (err) {
      console.error('Mock telemetry seed failed:', err);
      setError('Mock telemetry seed failed. Check console and backend connection.');
      setIsLoading(false);
    } finally {
      setSeeding(false);
    }
  };

  useEffect(() => {
    if (controlledOpen) fetchInsights();
  }, [controlledOpen, fetchInsights]);

  const actionableInsights = insights && insights.length > 0 ? insights : [];
  const showOnboarding = !isLoading && !error && actionableInsights.length === 0;

  return {
    isLoading,
    seeding,
    insights: actionableInsights,
    error,
    showOnboarding,
    fetchInsights,
    runMockSeed,
  };
}
