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

export function HelpFeaturedEditor({ items, onChange }) {
  const update = (index, patch) => {
    onChange(items.map((row, i) => (i === index ? { ...row, ...patch } : row)));
  };
  return (
    <div className="space-y-3">
      {items.map((item, index) => (
        <RowShell key={`feat-${index}`} onRemove={() => onChange(items.filter((_, i) => i !== index))}>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <FooterTextInput
              id={`hf-t-${index}`}
              value={item.title || ''}
              onChange={(e) => update(index, { title: e.target.value })}
              placeholder="Article title"
              maxLength={160}
            />
            <FooterTextInput
              id={`hf-c-${index}`}
              value={item.category || ''}
              onChange={(e) => update(index, { category: e.target.value })}
              placeholder="category id (e.g. gigs)"
              maxLength={60}
            />
          </div>
          <FooterTextInput
            id={`hf-s-${index}`}
            value={item.summary || ''}
            onChange={(e) => update(index, { summary: e.target.value })}
            placeholder="Short summary"
            maxLength={300}
          />
          <FooterTextArea
            id={`hf-b-${index}`}
            value={item.body || ''}
            onChange={(e) => update(index, { body: e.target.value })}
            placeholder="Full article body"
            maxLength={4000}
            rows={3}
          />
        </RowShell>
      ))}
      <button
        type="button"
        className={BTN}
        onClick={() => onChange([...items, { title: '', category: 'getting-started', summary: '', body: '' }])}
      >
        + Add article
      </button>
    </div>
  );
}

export function HelpFaqEditor({ items, onChange }) {
  const update = (index, patch) => {
    onChange(items.map((row, i) => (i === index ? { ...row, ...patch } : row)));
  };
  return (
    <div className="space-y-3">
      {items.map((item, index) => (
        <RowShell key={`faq-${index}`} onRemove={() => onChange(items.filter((_, i) => i !== index))}>
          <FooterTextInput
            id={`hq-${index}`}
            value={item.q || ''}
            onChange={(e) => update(index, { q: e.target.value })}
            placeholder="Question"
            maxLength={200}
          />
          <FooterTextArea
            id={`ha-${index}`}
            value={item.a || ''}
            onChange={(e) => update(index, { a: e.target.value })}
            placeholder="Answer"
            maxLength={2000}
            rows={2}
          />
          <FooterTextInput
            id={`hc-${index}`}
            value={item.category || ''}
            onChange={(e) => update(index, { category: e.target.value })}
            placeholder="category id (optional)"
            maxLength={60}
          />
        </RowShell>
      ))}
      <button
        type="button"
        className={BTN}
        onClick={() => onChange([...items, { q: '', a: '', category: '' }])}
      >
        + Add question
      </button>
    </div>
  );
}

export function HelpCategoriesEditor({ items, onChange }) {
  const update = (index, patch) => {
    onChange(items.map((row, i) => (i === index ? { ...row, ...patch } : row)));
  };
  return (
    <div className="space-y-3">
      {items.map((item, index) => (
        <RowShell key={`cat-${index}`} onRemove={() => onChange(items.filter((_, i) => i !== index))}>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <FooterTextInput
              id={`cid-${index}`}
              value={item.id || ''}
              onChange={(e) => update(index, { id: e.target.value })}
              placeholder="id (e.g. squads)"
              maxLength={60}
            />
            <FooterTextInput
              id={`cl-${index}`}
              value={item.label || ''}
              onChange={(e) => update(index, { label: e.target.value })}
              placeholder="Label"
              maxLength={80}
            />
            <FooterTextInput
              id={`ci-${index}`}
              value={item.icon || ''}
              onChange={(e) => update(index, { icon: e.target.value })}
              placeholder="icon (zap, user…)"
              maxLength={40}
            />
            <FooterTextInput
              id={`cto-${index}`}
              value={item.to || ''}
              onChange={(e) => update(index, { to: e.target.value })}
              placeholder="/path"
              maxLength={200}
            />
          </div>
        </RowShell>
      ))}
      <button
        type="button"
        className={BTN}
        onClick={() => onChange([...items, { id: '', label: '', icon: 'zap', to: '' }])}
      >
        + Add category
      </button>
    </div>
  );
}

export function HelpStatusEditor({ items, onChange }) {
  const update = (index, patch) => {
    onChange(items.map((row, i) => (i === index ? { ...row, ...patch } : row)));
  };
  return (
    <div className="space-y-3">
      {items.map((item, index) => (
        <RowShell key={`st-${index}`} onRemove={() => onChange(items.filter((_, i) => i !== index))}>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 items-center">
            <FooterTextInput
              id={`sid-${index}`}
              value={item.id || ''}
              onChange={(e) => update(index, { id: e.target.value })}
              placeholder="id"
              maxLength={40}
            />
            <FooterTextInput
              id={`sl-${index}`}
              value={item.label || ''}
              onChange={(e) => update(index, { label: e.target.value })}
              placeholder="Label"
              maxLength={80}
            />
            <label className="flex items-center gap-2 text-xs font-bold text-white cursor-pointer">
              <input
                type="checkbox"
                checked={item.online !== false}
                onChange={(e) => update(index, { online: e.target.checked })}
              />
              Online
            </label>
          </div>
        </RowShell>
      ))}
      <button
        type="button"
        className={BTN}
        onClick={() => onChange([...items, { id: '', label: '', online: true }])}
      >
        + Add status row
      </button>
    </div>
  );
}
