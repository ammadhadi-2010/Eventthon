import { useEffect, useState } from 'react';

import { normalizeOutreachSendPayload, scheduleOutreachEmail, sendOutreachEmail } from '../../services/emailOutreachApi';

import { DEFAULT_COMPOSER_BODY, DEFAULT_COMPOSER_SUBJECT } from './composerDefaults';



function formatApiError(err) {

  const detail = err?.response?.data?.detail;

  if (typeof detail === 'string') return detail;

  if (Array.isArray(detail)) {

    return detail.map((item) => item?.msg || JSON.stringify(item)).join('\n');

  }

  return err?.message || 'Failed to send email';

}



export default function useEmailComposer(draft = {}) {

  const [to, setTo] = useState(draft.to || '');

  const [cc, setCc] = useState('');

  const [bcc, setBcc] = useState('');

  const [subject, setSubject] = useState(draft.subject || DEFAULT_COMPOSER_SUBJECT);

  const [body, setBody] = useState(draft.body || DEFAULT_COMPOSER_BODY);

  const [leadId, setLeadId] = useState(draft.leadId || '');

  const [showCc, setShowCc] = useState(false);

  const [showBcc, setShowBcc] = useState(false);

  const [sending, setSending] = useState(false);

  const [scheduling, setScheduling] = useState(false);



  useEffect(() => {

    if (draft.to !== undefined) setTo(draft.to);

    if (draft.subject !== undefined) setSubject(draft.subject);

    if (draft.leadId !== undefined) setLeadId(draft.leadId);

    if (draft.body !== undefined) setBody(draft.body);

  }, [draft.to, draft.subject, draft.leadId, draft.body, draft.templateTs]);



  const buildPayload = (htmlBody) => normalizeOutreachSendPayload({

    lead_id: leadId || '',

    to: String(to || '').trim(),

    subject: String(subject || '').trim() || 'EventThon Outreach',

    body: htmlBody,

    cc: cc || '',

    bcc: bcc || '',

  });



  const validateBeforeSend = () => {

    const email = String(to || '').trim();

    if (!email.includes('@') || !email.includes('.')) {

      window.alert('Please enter a valid recipient email.');

      return false;

    }

    return true;

  };



  const sendEmail = async (htmlBody) => {

    if (!validateBeforeSend()) return false;

    setSending(true);

    try {

      const result = await sendOutreachEmail(buildPayload(htmlBody));

      const recipient = result?.recipient ? ` to ${result.recipient}` : '';

      window.alert(result?.message ? `${result.message}${recipient}` : 'Email sent successfully');

      return result?.status === 'success' || result?.sent === true;

    } catch (err) {

      window.alert(formatApiError(err));

      return false;

    } finally {

      setSending(false);

    }

  };



  const scheduleEmail = async (htmlBody, sendAtIso) => {

    if (!validateBeforeSend()) return false;

    setScheduling(true);

    try {

      const result = await scheduleOutreachEmail({ ...buildPayload(htmlBody), send_at: sendAtIso });

      window.alert(result?.message || 'Email scheduled successfully.');

      return true;

    } catch (err) {

      window.alert(formatApiError(err));

      return false;

    } finally {

      setScheduling(false);

    }

  };



  return {

    to,

    setTo,

    cc,

    setCc,

    bcc,

    setBcc,

    subject,

    setSubject,

    body,

    setBody,

    leadId,

    showCc,

    setShowCc,

    showBcc,

    setShowBcc,

    sendEmail,

    scheduleEmail,

    sending,

    scheduling,

  };

}


