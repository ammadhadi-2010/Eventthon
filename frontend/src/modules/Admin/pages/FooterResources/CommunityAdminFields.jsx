import React, { useMemo, useState } from 'react';
import {
  defaultCommunityFormFields,
  parseCommunityContent,
  serializeCommunityContent,
} from '../../../FooterPages/utils/communityCmsUtils';
import { FooterField, FooterTextInput } from './FooterResourceFieldKit';
import {
  CommActionsEditor,
  CommDiscussionsEditor,
  CommEventsEditor,
  CommMembersEditor,
} from './CommunityAdminLists';

const TABS = [
  { id: 'discussions', label: 'Discussions' },
  { id: 'events', label: 'Events' },
  { id: 'members', label: 'Members' },
  { id: 'actions', label: 'Action cards' },
];

export default function CommunityAdminFields({ formData, onChange }) {
  const [tab, setTab] = useState('discussions');
  const parsed = useMemo(() => parseCommunityContent(formData.content), [formData.content]);
  const patch = (partial) => onChange({ ...formData, ...partial });

  const write = (next) => {
    patch({
      content: serializeCommunityContent({
        actions: next.actions ?? parsed.actions,
        discussions: next.discussions ?? parsed.discussions,
        categories: parsed.categories,
        trending: parsed.trending,
        events: next.events ?? parsed.events,
        members: next.members ?? parsed.members,
        stats: parsed.stats,
      }),
    });
  };

  return (
    <>
      <div className="rounded-xl border border-violet-400/40 bg-violet-500/10 px-4 py-3 text-[12px] text-violet-100 space-y-2">
        <p>
          <strong className="text-white">Community Hub editor</strong> — one entry powers{' '}
          <a href="/resources/community" target="_blank" rel="noreferrer" className="underline font-bold">
            /resources/community
          </a>
          . Edit cards below, then Save.
        </p>
        <button
          type="button"
          onClick={() => patch({ ...defaultCommunityFormFields(), category: 'Community' })}
          className="rounded-lg border border-violet-500/60 bg-violet-600/25 px-3 py-1.5 text-[11px] font-bold text-white"
        >
          Load Community defaults
        </button>
      </div>

      <FooterField id="comm-sub" label="Subtitle" hint="Shown under the Community heading.">
        <FooterTextInput
          id="comm-sub"
          value={formData.excerpt}
          onChange={(e) => patch({ excerpt: e.target.value })}
          placeholder="Connect, learn and grow…"
          maxLength={2000}
        />
      </FooterField>

      <FooterField id="comm-discord" label="Discord invite URL">
        <FooterTextInput
          id="comm-discord"
          value={formData.externalUrl}
          onChange={(e) => patch({ externalUrl: e.target.value })}
          placeholder="https://discord.com/invite/…"
          maxLength={500}
        />
      </FooterField>

      <div className="flex flex-wrap gap-2">
        {TABS.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => setTab(item.id)}
            className={`rounded-lg px-3 py-1.5 text-[11px] font-bold border ${
              tab === item.id
                ? 'border-violet-400 bg-violet-600/40 text-white'
                : 'border-slate-600 bg-slate-800/60 text-slate-200'
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>

      {tab === 'discussions' ? (
        <FooterField id="comm-disc" label="Featured discussions">
          <CommDiscussionsEditor
            items={parsed.discussions}
            onChange={(discussions) => write({ discussions })}
          />
        </FooterField>
      ) : null}

      {tab === 'events' ? (
        <FooterField id="comm-ev" label="Upcoming events">
          <CommEventsEditor items={parsed.events} onChange={(events) => write({ events })} />
        </FooterField>
      ) : null}

      {tab === 'members' ? (
        <FooterField id="comm-mem" label="Top community members">
          <CommMembersEditor
            items={parsed.members}
            onChange={(members) => write({
              members: members.map((m) => ({
                ...m,
                initial: m.initial || (m.name || '?')[0].toUpperCase(),
              })),
            })}
          />
        </FooterField>
      ) : null}

      {tab === 'actions' ? (
        <FooterField id="comm-act" label="Quick action cards" hint="Links under the Community hero.">
          <CommActionsEditor items={parsed.actions} onChange={(actions) => write({ actions })} />
        </FooterField>
      ) : null}
    </>
  );
}
