import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { API_BASE_URL } from '../api/axiosConfig';
import { hasStoredSession } from '../utils/storedUser';

const SESSION_KEY = 'et_telemetry_session_id';
const MIN_SEND_SECONDS = 0.5;
const BASELINE_DWELL_SECONDS = 1;

function getOrCreateSessionId() {
  let sessionId = sessionStorage.getItem(SESSION_KEY);
  if (!sessionId) {
    sessionId = `sess-${Date.now()}-${Math.random().toString(36).slice(2, 11)}`;
    sessionStorage.setItem(SESSION_KEY, sessionId);
  }
  return sessionId;
}

export function getTelemetrySessionId() {
  return getOrCreateSessionId();
}

export function resolveTelemetryUserId(userData) {
  return String(
    userData?._id ||
      userData?.user_id ||
      localStorage.getItem('userId') ||
      localStorage.getItem('user_id') ||
      '',
  ).trim();
}

export function buildTelemetryAuthHeaders(userData) {
  const currentUserId = resolveTelemetryUserId(userData);
  const headers = { 'Content-Type': 'application/json', Accept: 'application/json' };
  if (currentUserId) headers['X-User-Id'] = currentUserId;
  return headers;
}

export function postTelemetryLog(payload, userData) {
  const headers = buildTelemetryAuthHeaders(userData);
  const url = `${API_BASE_URL}/api/telemetry/log-activity`;
  console.log('Telemetry Payload Sent:', payload);
  return fetch(url, {
    method: 'POST',
    headers,
    body: JSON.stringify(payload),
    keepalive: true,
  })
    .then((response) => {
      if (!response.ok) {
        console.error('Telemetry Logging Failed:', response.status, response.statusText);
      }
      return response;
    })
    .catch((err) => {
      console.error('Telemetry Logging Failed:', err);
      throw err;
    });
}

function readScrollDepth() {
  const root = document.documentElement;
  const scrollable = root.scrollHeight - window.innerHeight;
  if (scrollable <= 0) return 100;
  const depth = ((window.scrollY + window.innerHeight) / root.scrollHeight) * 100;
  return Math.min(100, Math.max(0, Math.round(depth)));
}

function buildDwellPayload(userId, sessionId, endpoint, startedAt, maxScroll) {
  const spentSeconds = (Date.now() - startedAt) / 1000;
  if (!endpoint || !startedAt || spentSeconds < MIN_SEND_SECONDS) return null;
  return {
    user_id: userId,
    session_id: sessionId,
    endpoint_url: endpoint,
    time_spent_seconds: Math.round(spentSeconds * 10) / 10,
    scroll_depth_percentage: maxScroll,
  };
}

function buildBaselinePayload(userId, sessionId, endpoint, maxScroll) {
  return {
    user_id: userId,
    session_id: sessionId,
    endpoint_url: endpoint,
    time_spent_seconds: BASELINE_DWELL_SECONDS,
    scroll_depth_percentage: maxScroll,
  };
}

function dispatchPayload(payload, userData) {
  if (!payload) return;
  postTelemetryLog(payload, userData);
}

export default function useTelemetry(userData, enabled = true) {
  const location = useLocation();
  const trackerRef = useRef({
    endpoint: '',
    startedAt: 0,
    maxScroll: 0,
    sessionId: getOrCreateSessionId(),
  });
  const scrollFrameRef = useRef(false);

  useEffect(() => {
    if (!enabled || !hasStoredSession()) return undefined;

    const onScroll = () => {
      if (scrollFrameRef.current) return;
      scrollFrameRef.current = true;
      window.requestAnimationFrame(() => {
        const state = trackerRef.current;
        state.maxScroll = Math.max(state.maxScroll, readScrollDepth());
        scrollFrameRef.current = false;
      });
    };

    const flushCurrent = () => {
      const state = trackerRef.current;
      const userId = resolveTelemetryUserId(userData);
      dispatchPayload(
        buildDwellPayload(userId, state.sessionId, state.endpoint, state.startedAt, state.maxScroll),
        userData,
      );
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('pagehide', flushCurrent);
    const onVisibility = () => {
      if (document.visibilityState === 'hidden') flushCurrent();
    };
    document.addEventListener('visibilitychange', onVisibility);

    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('pagehide', flushCurrent);
      document.removeEventListener('visibilitychange', onVisibility);
      flushCurrent();
    };
  }, [enabled, userData]);

  useEffect(() => {
    if (!enabled || !hasStoredSession()) return undefined;

    const state = trackerRef.current;
    const userId = resolveTelemetryUserId(userData);
    const nextEndpoint = `${location.pathname}${location.search || ''}`;

    if (state.endpoint && state.startedAt && state.endpoint !== nextEndpoint) {
      dispatchPayload(
        buildDwellPayload(userId, state.sessionId, state.endpoint, state.startedAt, state.maxScroll),
        userData,
      );
    }

    state.endpoint = nextEndpoint;
    state.startedAt = Date.now();
    state.maxScroll = readScrollDepth();

    dispatchPayload(
      buildBaselinePayload(userId, state.sessionId, nextEndpoint, state.maxScroll),
      userData,
    );

    return () => {
      dispatchPayload(
        buildDwellPayload(userId, state.sessionId, state.endpoint, state.startedAt, state.maxScroll),
        userData,
      );
    };
  }, [location.pathname, location.search, enabled, userData]);
}
