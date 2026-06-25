import React, { memo } from 'react';
import { Mail, Send } from 'lucide-react';
import { EVENTTHON_OUTREACH } from './leadHunterBranding';

function LeadHunterPitchPanel({ pitch, lead, busy, onSend }) {
  if (!pitch || !lead) {
    return (
      <section className="um-card lh-card lh-pitch lh-pitch--empty">
        <h2 className="auto-card-title">Outreach Pitch</h2>
        <p className="lh-card-sub">Run Quick Hunter to preview an EventThon Network pitch.</p>
      </section>
    );
  }

  return (
    <section className="um-card lh-card lh-pitch">
      <div className="lh-card-head">
        <Mail size={18} aria-hidden />
        <div>
          <h2 className="auto-card-title">Outreach Pitch</h2>
          <p className="lh-card-sub">Preview email metadata before sending.</p>
        </div>
      </div>

      <div className="lh-meta-grid">
        <div>
          <span className="lh-meta-label">From</span>
          <p>{EVENTTHON_OUTREACH.fromName} &lt;{EVENTTHON_OUTREACH.fromEmail}&gt;</p>
        </div>
        <div>
          <span className="lh-meta-label">Reply-To</span>
          <p>{EVENTTHON_OUTREACH.replyTo}</p>
        </div>
        <div>
          <span className="lh-meta-label">To</span>
          <p>{lead.email}</p>
        </div>
        <div>
          <span className="lh-meta-label">Subject</span>
          <p>{pitch.subject}</p>
        </div>
      </div>

      <div className="lh-email-preview">
        <div className="lh-email-preview__head">
          <strong>{pitch.headerTitle}</strong>
          <span>{pitch.headerSubtitle}</span>
        </div>
        <p className="lh-email-preview__greet">{pitch.greeting}</p>
        {pitch.body.split('\n\n').map((para) => (
          <p key={para.slice(0, 24)} className="lh-email-preview__para">
            {para}
          </p>
        ))}
        <p className="lh-email-preview__sign">{pitch.signoff}</p>
        <p className="lh-email-preview__foot">{pitch.footer}</p>
      </div>

      <button type="button" className="um-btn um-btn--primary" disabled={busy} onClick={onSend}>
        <Send size={14} aria-hidden />
        {busy ? 'Sending…' : 'Send Pitch'}
      </button>
    </section>
  );
}

export default memo(LeadHunterPitchPanel);
