/**
 * Outreach API path constants (FastAPI backend).
 */
export const OUTREACH_API = {
  send: '/api/admin/email-outreach/send',
  sendPublic: '/api/outreach/send',
  schedule: '/api/admin/email-outreach/schedule',
  schedulePublic: '/api/outreach/schedule',
  aiGenerate: '/api/admin/email-outreach/ai-generate',
  aiGeneratePublic: '/api/outreach/ai-generate',
  leads: '/api/admin/email-outreach/leads',
  stats: '/api/admin/email-outreach/stats',
  activity: '/api/admin/email-outreach/activity',
  templates: '/api/admin/email-outreach/templates',
  templatesPublic: '/api/outreach/templates',
  replies: '/api/admin/email-outreach/replies',
  repliesPublic: '/api/outreach/replies',
  repliesSync: '/api/admin/email-outreach/replies/sync',
  repliesSyncPublic: '/api/outreach/replies/sync',
  leadHunterCategories: '/api/admin/email-outreach/lead-hunter/categories',
  leadHunterGoogleSearch: '/api/admin/email-outreach/lead-hunter/google-search',
  leadHunterExtract: '/api/admin/email-outreach/lead-hunter/extract',
  leadHunterSendPitch: '/api/admin/email-outreach/lead-hunter/send-pitch',
  aiResponderSettings: '/api/admin/email-outreach/ai-responder/settings',
  aiResponderSettingsPublic: '/api/outreach/ai-responder/settings',
};
