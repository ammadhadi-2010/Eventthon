import React, { useMemo, useState } from 'react';
import { Megaphone, X } from 'lucide-react';
import { broadcastBlogMessage } from './blogBroadcastApi';

export default function BlogBroadcastBar({
  editingId = '',
  postTitle = '',
  postExcerpt = '',
}) {
  const [open, setOpen] = useState(false);
  const [audience, setAudience] = useState('all');
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [resultText, setResultText] = useState('');
  const [errorText, setErrorText] = useState('');

  const defaultMessage = useMemo(() => {
    const headline = String(postTitle || '').trim() || 'our latest blog post';
    const teaser = String(postExcerpt || '').trim();
    if (teaser) return `We just published "${headline}".\n\n${teaser}\n\nRead it on EventThon Blog.`;
    return `We just published "${headline}" on the EventThon Blog. Open it to read the full post.`;
  }, [postTitle, postExcerpt]);

  const openModal = () => {
    setTitle(postTitle ? `New on EventThon Blog: ${postTitle}` : 'Message from EventThon');
    setMessage(defaultMessage);
    setAudience('all');
    setResultText('');
    setErrorText('');
    setOpen(true);
  };

  const onSend = async () => {
    const body = message.trim();
    if (!body) {
      setErrorText('Write a message first.');
      return;
    }
    if (!window.confirm('Send this message to everyone in the selected audience? This cannot be undone.')) {
      return;
    }
    setSending(true);
    setErrorText('');
    setResultText('');
    try {
      const res = await broadcastBlogMessage({
        resourceId: editingId,
        title: title.trim(),
        message: body,
        audience,
        sendChat: true,
        sendAlert: true,
      });
      setResultText(
        `Sent to ${res.recipients || 0} users · ${res.chat_count || 0} inbox msgs · ${res.alert_count || 0} alerts`,
      );
    } catch (err) {
      setErrorText(err?.response?.data?.detail || err?.message || 'Broadcast failed.');
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="rounded-2xl border border-cyan-500/35 bg-cyan-500/10 px-4 py-3">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h2 className="text-sm font-extrabold text-white inline-flex items-center gap-2">
            <Megaphone size={15} aria-hidden />
            Message everyone
          </h2>
          <p className="text-[11px] text-cyan-100/90 mt-1 max-w-2xl">
            Send this blog update to all members (inbox + notification). Save the post first for a linked announce.
          </p>
        </div>
        <button
          type="button"
          onClick={openModal}
          className="inline-flex items-center justify-center gap-2 rounded-xl border border-cyan-400/50 bg-cyan-600/30 px-3 py-2 text-[11px] font-bold text-cyan-50 hover:bg-cyan-600/45"
        >
          <Megaphone size={13} aria-hidden />
          {editingId ? 'Send post to everyone' : 'Compose broadcast'}
        </button>
      </div>

      {open ? (
        <div className="fixed inset-0 z-[80] flex items-center justify-center p-4 bg-black/60" role="dialog" aria-modal="true">
          <div className="w-full max-w-lg rounded-2xl border border-slate-600 bg-slate-900 shadow-2xl">
            <header className="flex items-center justify-between gap-3 px-4 py-3 border-b border-slate-700">
              <h3 className="text-sm font-bold text-white">Send message to everyone</h3>
              <button
                type="button"
                className="text-slate-300 hover:text-white"
                onClick={() => setOpen(false)}
                aria-label="Close"
              >
                <X size={16} />
              </button>
            </header>
            <div className="p-4 flex flex-col gap-3">
              <label className="text-[11px] font-bold text-slate-300">
                Audience
                <select
                  className="mt-1 w-full rounded-lg border border-slate-600 bg-slate-950 px-3 py-2 text-xs text-white"
                  value={audience}
                  onChange={(e) => setAudience(e.target.value)}
                >
                  <option value="all">Everyone</option>
                  <option value="members">Members only</option>
                  <option value="employers">Companies / employers</option>
                </select>
              </label>
              <label className="text-[11px] font-bold text-slate-300">
                Notification title
                <input
                  className="mt-1 w-full rounded-lg border border-slate-600 bg-slate-950 px-3 py-2 text-xs text-white"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  maxLength={200}
                />
              </label>
              <label className="text-[11px] font-bold text-slate-300">
                Message
                <textarea
                  className="mt-1 w-full min-h-[120px] rounded-lg border border-slate-600 bg-slate-950 px-3 py-2 text-xs text-white"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  maxLength={4000}
                />
              </label>
              {errorText ? <p className="text-[11px] font-semibold text-rose-300">{errorText}</p> : null}
              {resultText ? <p className="text-[11px] font-semibold text-emerald-300">{resultText}</p> : null}
            </div>
            <footer className="flex justify-end gap-2 px-4 py-3 border-t border-slate-700">
              <button
                type="button"
                className="rounded-lg px-3 py-2 text-[11px] font-bold text-slate-300 hover:text-white"
                onClick={() => setOpen(false)}
                disabled={sending}
              >
                Close
              </button>
              <button
                type="button"
                className="rounded-lg bg-cyan-600 hover:bg-cyan-500 disabled:opacity-60 px-3 py-2 text-[11px] font-bold text-white"
                onClick={onSend}
                disabled={sending}
              >
                {sending ? 'Sending…' : 'Send to everyone'}
              </button>
            </footer>
          </div>
        </div>
      ) : null}
    </div>
  );
}
