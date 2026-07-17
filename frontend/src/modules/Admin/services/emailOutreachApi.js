import API from '../../../api/axiosConfig';

import { OUTREACH_API } from './outreachApiConfig';



const TIMEOUT = 45000;



/** Normalize outreach send payload to FastAPI field names. */

export function normalizeOutreachSendPayload(payload = {}) {

  const htmlBody = payload.body || payload.body_html || '';

  const plain = payload.bodyText || payload.body_text || '';

  return {

    lead_id: payload.lead_id || payload.leadId || '',

    to: String(payload.to || '').trim(),

    subject: String(payload.subject || '').trim(),

    body: htmlBody,

    bodyText: plain || htmlBody.replace(/<br\s*\/?>/gi, '\n').replace(/<[^>]+>/g, '').trim(),

    cc: payload.cc || '',

    bcc: payload.bcc || '',

  };

}



async function postWithFallback(paths, payload) {

  let lastError = null;

  for (const path of paths) {

    try {

      const { data } = await API.post(path, payload, { timeout: TIMEOUT });

      return data;

    } catch (err) {

      lastError = err;

      if (err?.response?.status !== 404) throw err;

    }

  }

  throw lastError;

}



async function getWithFallback(paths, params) {

  let lastError = null;

  for (const path of paths) {

    try {

      const { data } = await API.get(path, { params, timeout: TIMEOUT });

      return data;

    } catch (err) {

      lastError = err;

      if (err?.response?.status !== 404) throw err;

    }

  }

  throw lastError;

}



export async function fetchOutreachLeads(params) {

  const { data } = await API.get(OUTREACH_API.leads, { params, timeout: TIMEOUT });

  return data;

}



export async function fetchOutreachLead(leadId) {

  const { data } = await API.get(`${OUTREACH_API.leads}/${encodeURIComponent(leadId)}`, { timeout: TIMEOUT });

  return data?.lead;

}



export async function fetchOutreachStats() {

  const { data } = await API.get(OUTREACH_API.stats, { timeout: TIMEOUT });

  return data;

}



export async function fetchOutreachActivity(limit = 20) {

  const { data } = await API.get(OUTREACH_API.activity, { params: { limit }, timeout: TIMEOUT });

  return data;

}



export async function createOutreachLead(payload) {

  const { data } = await API.post(OUTREACH_API.leads, payload, { timeout: TIMEOUT });

  return data?.lead;

}



export async function updateOutreachLead(leadId, payload) {

  const { data } = await API.patch(`${OUTREACH_API.leads}/${encodeURIComponent(leadId)}`, payload, { timeout: TIMEOUT });

  return data?.lead;

}



export async function deleteOutreachLead(leadId) {

  const { data } = await API.delete(`${OUTREACH_API.leads}/${encodeURIComponent(leadId)}`, { timeout: TIMEOUT });

  return data;

}



export async function sendOutreachEmail(payload) {

  const body = normalizeOutreachSendPayload(payload);

  return postWithFallback([OUTREACH_API.send, OUTREACH_API.sendPublic], body);

}



export async function scheduleOutreachEmail(payload) {

  const body = {

    ...normalizeOutreachSendPayload(payload),

    send_at: payload.send_at || payload.sendAt || '',

  };

  return postWithFallback([OUTREACH_API.schedule, OUTREACH_API.schedulePublic], body);

}



export async function generateOutreachAi(payload) {

  return postWithFallback([OUTREACH_API.aiGenerate, OUTREACH_API.aiGeneratePublic], payload);

}



export async function fetchOutreachTemplates() {

  return getWithFallback([OUTREACH_API.templates, OUTREACH_API.templatesPublic]);

}



export async function createOutreachTemplate(payload) {

  return postWithFallback([OUTREACH_API.templates, OUTREACH_API.templatesPublic], payload);

}



export async function fetchOutreachReplies(params = {}) {

  return getWithFallback([OUTREACH_API.replies, OUTREACH_API.repliesPublic], params);

}



export async function syncOutreachReplies() {

  return postWithFallback([OUTREACH_API.repliesSync, OUTREACH_API.repliesSyncPublic], {});

}



export async function fetchAiResponderSettings() {

  return getWithFallback([OUTREACH_API.aiResponderSettings, OUTREACH_API.aiResponderSettingsPublic]);

}



export async function saveAiResponderSettings(payload) {

  let lastError = null;

  for (const path of [OUTREACH_API.aiResponderSettings, OUTREACH_API.aiResponderSettingsPublic]) {

    try {

      const { data } = await API.put(path, payload, { timeout: TIMEOUT });

      return data;

    } catch (err) {

      lastError = err;

      if (err?.response?.status !== 404) throw err;

    }

  }

  throw lastError;

}

