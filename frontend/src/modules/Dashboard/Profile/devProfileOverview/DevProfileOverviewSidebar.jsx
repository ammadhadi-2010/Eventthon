import React, { useMemo } from 'react';
import { API_BASE_URL } from '../../../../api/axiosConfig';
import { postProfileSocialAction } from '../services/profileOverviewService';
import DevProfileOverviewSidebarCard from './DevProfileOverviewSidebarCard';
import DevProfileOverviewFacepile from './DevProfileOverviewFacepile';
import { viewAllHrefForSidebarKey } from '../connectionsPage/connectionsListConfig';

function resolveAvatar(url) {
  if (!url || typeof url !== 'string') return '';
  const v = url.trim();
  if (!v) return '';
  if (v.startsWith('http') || v.startsWith('blob:')) return v;
  return `${API_BASE_URL}${v.startsWith('/') ? v : `/${v}`}`;
}

function avatarOrSeed(u) {
  const r = resolveAvatar(u.avatar);
  if (r) return r;
  return `https://api.dicebear.com/8.x/avataaars/svg?seed=${encodeURIComponent(u.name || u.id)}`;
}

function fmtCountLabel(n) {
  const x = Math.max(0, Math.floor(Number(n) || 0));
  if (x >= 1000) return `${(x / 1000).toFixed(1)}K`.replace('.0K', 'K');
  return String(x);
}

const QUICK_CONNECT_FALLBACK = [];

export default function DevProfileOverviewSidebar({ bundle, identifier, onAfterFollow }) {
  const stats = bundle?.stats || {};
  const suggested = bundle?.suggested_connects || [];

  const quickRows = useMemo(() => {
    const out = [];
    const seen = new Set();
    for (const u of suggested) {
      if (out.length >= 4) break;
      out.push(u);
      seen.add(u.id);
    }
    for (const row of QUICK_CONNECT_FALLBACK) {
      if (out.length >= 4) break;
      if (!seen.has(row.id)) out.push(row);
    }
    return out;
  }, [suggested]);

  const followOne = async (targetId) => {
    if (!identifier || !targetId) return;
    try {
      await postProfileSocialAction(identifier, { action: 'follow', target_user_id: targetId });
      onAfterFollow?.();
    } catch (e) {
      window.alert(e?.response?.data?.detail || e?.message || 'Could not follow');
    }
  };

  const topCommanders = stats.top_commanders ?? 0;
  const mutual = stats.connections_mutual ?? 0;
  const followers = stats.followers ?? 0;
  const following = stats.following ?? 0;
  const connections = stats.connections ?? 0;

  return (
    <aside className="dpo-sidebar-stack">
      <section className="dpo-panel dpo-sidebar-card">
        <DevProfileOverviewSidebarCard title="Quick Connect" onViewAll={() => window.alert('Discovery list coming soon.')} />
        <ul className="dpo-suggest-list">
          {quickRows.map((u) => (
            <li key={u.id} className="dpo-suggest-row">
              <img className="dpo-suggest-av" src={avatarOrSeed(u)} alt="" />
              <div className="dpo-suggest-mid">
                <div className="dpo-suggest-name">{u.name}</div>
                <div className="dpo-muted-sm">{u.headline}</div>
              </div>
              <button type="button" className="dpo-btn-mini" onClick={() => followOne(u.id)}>
                Connect
              </button>
            </li>
          ))}
        </ul>
      </section>

      <section className="dpo-panel dpo-sidebar-card">
        <DevProfileOverviewSidebarCard
          title={`Top Commanders (${fmtCountLabel(topCommanders)})`}
          viewAllTo={viewAllHrefForSidebarKey('commanders')}
        />
        <DevProfileOverviewFacepile
          suggested={suggested}
          total={topCommanders}
          seedPrefix="cmd"
        />
      </section>

      <section className="dpo-panel dpo-sidebar-card">
        <DevProfileOverviewSidebarCard
          title={`Mutual Connections (${fmtCountLabel(mutual)})`}
          viewAllTo={viewAllHrefForSidebarKey('mutual')}
        />
        <DevProfileOverviewFacepile suggested={suggested} total={mutual} seedPrefix="mutual" />
      </section>

      <section className="dpo-panel dpo-sidebar-card">
        <DevProfileOverviewSidebarCard
          title={`Followers (${fmtCountLabel(followers)})`}
          viewAllTo={viewAllHrefForSidebarKey('followers')}
        />
        <DevProfileOverviewFacepile suggested={suggested} total={followers} seedPrefix="fol" />
      </section>

      <section className="dpo-panel dpo-sidebar-card">
        <DevProfileOverviewSidebarCard
          title={`Following (${fmtCountLabel(following)})`}
          viewAllTo={viewAllHrefForSidebarKey('following')}
        />
        <DevProfileOverviewFacepile suggested={suggested} total={following} seedPrefix="fing" />
      </section>

      <section className="dpo-panel dpo-sidebar-card">
        <DevProfileOverviewSidebarCard
          title={`Connections (${fmtCountLabel(connections)})`}
          viewAllTo={viewAllHrefForSidebarKey('connections')}
        />
        <DevProfileOverviewFacepile suggested={suggested} total={connections} seedPrefix="conn" />
      </section>
    </aside>
  );
}
