import React from 'react';
import { DEFAULT_DISCUSSIONS, SQUAD_FEATURE_CARDS } from './squadWorkspaceData';
import SquadOverviewProjectCard from './SquadOverviewProjectCard';
import '../../styles/squad-workspace.css';

const SQUAD_STATS = [
  { label: 'Total Members', value: '0', delta: '+12%' },
  { label: 'Active Members', value: '0', delta: '+8%' },
  { label: 'Total Projects', value: '0', delta: '+15%' },
  { label: 'Completed Tasks', value: '24', delta: '+22%' },
  { label: 'Files Shared', value: '15', delta: '+5%' },
  { label: 'Activity Score', value: '98%', delta: '+3%' },
];

export default function SquadOverviewMain({ squad, state }) {
  const projects = state?.projects || [];
  const members = state?.members || [];
  const feed = state?.activityFeed || [];
  const files = state?.files || [];
  const tags = [squad?.niche, 'SEO', 'Digital Marketing', 'Content Strategy'].filter(Boolean);

  const stats = state?.squadStats?.length
    ? state.squadStats
    : SQUAD_STATS.map((row, i) => {
        if (i === 0) return { ...row, value: String(members.length) };
        if (i === 1) return { ...row, value: String(members.filter((m) => m.online).length) };
        if (i === 2) return { ...row, value: String(projects.length) };
        if (i === 5) return { ...row, value: squad?.efficiency || '98%' };
        return row;
      });

  return (
    <div className="sq-ws-stack">
      <section className="sq-ws-glass sq-ws-pad">
        <h3 className="sq-ws-card-title">About Squad</h3>
        <p className="sq-ws-text-body">
          {squad?.description ||
            'A squad for SEO experts and marketers to share knowledge, strategies and grow together.'}
        </p>
        <div className="sq-ws-tags">
          {tags.map((tag) => (
            <span key={tag} className="sq-ws-tag">
              {tag}
            </span>
          ))}
        </div>
        <div className="sq-ws-features">
          {SQUAD_FEATURE_CARDS.map((f) => (
            <div key={f.title} className="sq-ws-feature">
              <strong>{f.title}</strong>
              <span>{f.subtitle}</span>
              <span
                style={{
                  color: f.tone === 'gold' ? '#fbbf24' : '#34d399',
                  fontSize: '0.65rem',
                  fontWeight: 700,
                }}
              >
                {f.status}
              </span>
            </div>
          ))}
        </div>
      </section>

      <section className="sq-ws-glass sq-ws-pad">
        <h3 className="sq-ws-card-title">Active Projects</h3>
        {projects.length === 0 ? (
          <p className="sq-ws-text-meta">No projects yet.</p>
        ) : (
          <div className="sq-ws-mini-project-grid">
            {projects.slice(0, 5).map((project) => (
              <SquadOverviewProjectCard key={project.id || project.title} project={project} />
            ))}
          </div>
        )}
      </section>

      <div className="sq-ws-triple">
        <section className="sq-ws-glass sq-ws-pad">
          <h3 className="sq-ws-card-title">Recent Activity</h3>
          {(feed.length ? feed : [{ text: 'No activity yet', actor_name: '—', time: '' }])
            .slice(0, 4)
            .map((item) => (
              <div key={item.id || item.text} className="sq-ws-feed-item">
                <strong>{item.actor_name || item.actor || 'Member'}</strong>{' '}
                {item.text || item.message}
                <div className="sq-ws-text-meta">
                  {item.time || item.created_at || 'Recently'}
                </div>
              </div>
            ))}
        </section>
        <section className="sq-ws-glass sq-ws-pad">
          <h3 className="sq-ws-card-title">Latest Discussions</h3>
          {DEFAULT_DISCUSSIONS.map((d) => (
            <div key={d.id} className="sq-ws-feed-item">
              <strong>{d.title}</strong>
              <div className="sq-ws-text-meta">
                {d.author} · {d.comments} comments
              </div>
            </div>
          ))}
        </section>
        <section className="sq-ws-glass sq-ws-pad">
          <h3 className="sq-ws-card-title">Recent Files</h3>
          {(files.length ? files : [{ name: 'No files uploaded', size: '—' }])
            .slice(0, 3)
            .map((f) => (
              <div key={f.id || f.name} className="sq-ws-feed-item">
                <strong>{f.name}</strong>
                <div className="sq-ws-text-meta">{f.size || '—'}</div>
              </div>
            ))}
        </section>
      </div>

      <section className="sq-ws-glass sq-ws-pad sq-ws-stats-section">
        <h3 className="sq-ws-card-title">Squad Statistics</h3>
        <div className="sq-ws-stats-grid sq-ws-stats-grid--responsive">
          {stats.map((stat) => (
            <div key={stat.label} className="sq-ws-stat-box">
              <small>{stat.delta}</small>
              <strong>{stat.value}</strong>
              <span className="sq-ws-text-meta">{stat.label}</span>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
