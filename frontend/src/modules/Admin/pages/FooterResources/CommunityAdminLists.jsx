import React from 'react';
import { FooterTextInput, FooterTextArea } from './FooterResourceFieldKit';

const BTN =
  'rounded-lg border border-slate-600 bg-slate-800/80 px-2.5 py-1 text-[11px] font-bold text-slate-100 hover:bg-slate-700';
const DEL =
  'rounded-lg border border-rose-500/40 bg-rose-500/10 px-2 py-1 text-[11px] font-bold text-rose-200';

function RowShell({ children, onRemove }) {
  return (
    <div className="rounded-xl border border-slate-700 bg-[#0b1220] p-3 space-y-2">
      {children}
      <button type="button" className={DEL} onClick={onRemove}>Remove</button>
    </div>
  );
}

export function CommDiscussionsEditor({ items, onChange }) {
  const update = (index, patch) => onChange(items.map((row, i) => (i === index ? { ...row, ...patch } : row)));
  return (
    <div className="space-y-3">
      {items.map((item, index) => (
        <RowShell key={`cd-${index}`} onRemove={() => onChange(items.filter((_, i) => i !== index))}>
          <FooterTextInput
            id={`cd-t-${index}`}
            value={item.title || ''}
            onChange={(e) => update(index, { title: e.target.value })}
            placeholder="Discussion title"
            maxLength={160}
          />
          <FooterTextArea
            id={`cd-s-${index}`}
            value={item.summary || ''}
            onChange={(e) => update(index, { summary: e.target.value })}
            placeholder="Short summary"
            maxLength={500}
            rows={2}
          />
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            <FooterTextInput
              id={`cd-r-${index}`}
              type="number"
              value={String(item.replies ?? 0)}
              onChange={(e) => update(index, { replies: Number(e.target.value) || 0 })}
              placeholder="Replies"
              maxLength={8}
            />
            <FooterTextInput
              id={`cd-i-${index}`}
              value={item.icon || ''}
              onChange={(e) => update(index, { icon: e.target.value })}
              placeholder="icon"
              maxLength={40}
            />
            <FooterTextInput
              id={`cd-tone-${index}`}
              value={item.tone || ''}
              onChange={(e) => update(index, { tone: e.target.value })}
              placeholder="tone"
              maxLength={40}
            />
            <FooterTextInput
              id={`cd-a-${index}`}
              value={(item.avatars || []).join(',')}
              onChange={(e) => update(index, {
                avatars: e.target.value.split(',').map((a) => a.trim()).filter(Boolean).slice(0, 3),
              })}
              placeholder="A,B,C"
              maxLength={20}
            />
          </div>
        </RowShell>
      ))}
      <button
        type="button"
        className={BTN}
        onClick={() => onChange([...items, {
          title: '', summary: '', replies: 0, icon: 'star', tone: 'violet', avatars: ['A', 'B', 'C'],
        }])}
      >
        + Add discussion
      </button>
    </div>
  );
}

export function CommEventsEditor({ items, onChange }) {
  const update = (index, patch) => onChange(items.map((row, i) => (i === index ? { ...row, ...patch } : row)));
  return (
    <div className="space-y-3">
      {items.map((item, index) => (
        <RowShell key={`ce-${index}`} onRemove={() => onChange(items.filter((_, i) => i !== index))}>
          <FooterTextInput
            id={`ce-t-${index}`}
            value={item.title || ''}
            onChange={(e) => update(index, { title: e.target.value })}
            placeholder="Event title"
            maxLength={160}
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <FooterTextInput
              id={`ce-w-${index}`}
              value={item.when || ''}
              onChange={(e) => update(index, { when: e.target.value })}
              placeholder="Tomorrow · 6:00 PM"
              maxLength={80}
            />
            <FooterTextInput
              id={`ce-c-${index}`}
              value={item.cta || ''}
              onChange={(e) => update(index, { cta: e.target.value })}
              placeholder="Register"
              maxLength={40}
            />
            <FooterTextInput
              id={`ce-i-${index}`}
              value={item.icon || ''}
              onChange={(e) => update(index, { icon: e.target.value })}
              placeholder="calendar | mic | award"
              maxLength={40}
            />
            <FooterTextInput
              id={`ce-tone-${index}`}
              value={item.tone || ''}
              onChange={(e) => update(index, { tone: e.target.value })}
              placeholder="violet | blue | amber"
              maxLength={40}
            />
          </div>
        </RowShell>
      ))}
      <button
        type="button"
        className={BTN}
        onClick={() => onChange([...items, {
          title: '', when: '', cta: 'Register', icon: 'calendar', tone: 'violet',
        }])}
      >
        + Add event
      </button>
    </div>
  );
}

export function CommMembersEditor({ items, onChange }) {
  const update = (index, patch) => onChange(items.map((row, i) => (i === index ? { ...row, ...patch } : row)));
  return (
    <div className="space-y-3">
      {items.map((item, index) => (
        <RowShell key={`cm-${index}`} onRemove={() => onChange(items.filter((_, i) => i !== index))}>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <FooterTextInput
              id={`cm-n-${index}`}
              value={item.name || ''}
              onChange={(e) => update(index, { name: e.target.value })}
              placeholder="Name"
              maxLength={80}
            />
            <FooterTextInput
              id={`cm-r-${index}`}
              value={item.role || ''}
              onChange={(e) => update(index, { role: e.target.value })}
              placeholder="Top Contributor"
              maxLength={80}
            />
            <FooterTextInput
              id={`cm-p-${index}`}
              type="number"
              value={String(item.points ?? 0)}
              onChange={(e) => update(index, { points: Number(e.target.value) || 0 })}
              placeholder="Points"
              maxLength={10}
            />
            <FooterTextInput
              id={`cm-m-${index}`}
              value={item.medal || ''}
              onChange={(e) => update(index, { medal: e.target.value })}
              placeholder="gold | silver | bronze"
              maxLength={20}
            />
          </div>
        </RowShell>
      ))}
      <button
        type="button"
        className={BTN}
        onClick={() => onChange([...items, {
          name: '', role: 'Active Member', points: 0, medal: '', initial: '?',
        }])}
      >
        + Add member
      </button>
    </div>
  );
}

export function CommActionsEditor({ items, onChange }) {
  const update = (index, patch) => onChange(items.map((row, i) => (i === index ? { ...row, ...patch } : row)));
  return (
    <div className="space-y-3">
      {items.map((item, index) => (
        <RowShell key={`ca-${index}`} onRemove={() => onChange(items.filter((_, i) => i !== index))}>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <FooterTextInput
              id={`ca-t-${index}`}
              value={item.title || ''}
              onChange={(e) => update(index, { title: e.target.value })}
              placeholder="Ask the Community"
              maxLength={80}
            />
            <FooterTextInput
              id={`ca-to-${index}`}
              value={item.to || ''}
              onChange={(e) => update(index, { to: e.target.value })}
              placeholder="/company/contact"
              maxLength={200}
            />
          </div>
          <FooterTextInput
            id={`ca-tx-${index}`}
            value={item.text || ''}
            onChange={(e) => update(index, { text: e.target.value })}
            placeholder="Short description"
            maxLength={160}
          />
          <div className="grid grid-cols-3 gap-2">
            <FooterTextInput
              id={`ca-cta-${index}`}
              value={item.cta || ''}
              onChange={(e) => update(index, { cta: e.target.value })}
              placeholder="Ask Now →"
              maxLength={40}
            />
            <FooterTextInput
              id={`ca-tone-${index}`}
              value={item.tone || ''}
              onChange={(e) => update(index, { tone: e.target.value })}
              placeholder="violet"
              maxLength={40}
            />
            <FooterTextInput
              id={`ca-i-${index}`}
              value={item.icon || ''}
              onChange={(e) => update(index, { icon: e.target.value })}
              placeholder="help"
              maxLength={40}
            />
          </div>
        </RowShell>
      ))}
      <button
        type="button"
        className={BTN}
        onClick={() => onChange([...items, {
          id: `a-${items.length}`, title: '', text: '', cta: 'Open →', tone: 'violet', icon: 'help', to: '/',
        }])}
      >
        + Add action card
      </button>
    </div>
  );
}
