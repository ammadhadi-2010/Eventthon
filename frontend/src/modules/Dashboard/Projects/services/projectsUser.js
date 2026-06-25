import { getProjectsActorId, hasProjectsSession } from './projectsSession';

export function getProjectsUserId() {
  const sessionId = getProjectsActorId();
  if (sessionId) return sessionId;
  if (typeof window === 'undefined') return '';
  return (
    localStorage.getItem('userId') ||
    localStorage.getItem('user_id') ||
    localStorage.getItem('_id') ||
    ''
  ).trim();
}

export { getProjectsActorId, hasProjectsSession };
