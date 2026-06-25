import React from 'react';

export default function SquadShowroomMain({ data }) {
  return (
    <div>
      <section className="sq-card">
        <h3>About Squad</h3>
        <p style={{ margin: '0 0 0.75rem', color: '#cbd5e1', fontSize: '0.86rem', lineHeight: 1.55 }}>{data.dynamicBio}</p>
        <div className="sq-tags">
          {(data.aboutTags || []).map((tag) => (
            <span key={tag} className="sq-tag">{tag}</span>
          ))}
        </div>
        <div className="sq-features">
          {(data.featureCards || []).map((item) => (
            <div key={item.title} className="sq-feature">
              <strong>{item.title}</strong>
              <span>{item.subtitle}</span>
            </div>
          ))}
        </div>
      </section>

      <section className="sq-card">
        <h3>Active Projects</h3>
        {(data.activeProjects || []).map((project) => (
          <div key={project.id || project.title} className="sq-project">
            <div>
              <strong>{project.title}</strong>
              <div style={{ fontSize: '0.72rem', color: '#94a3b8' }}>{project.status} · {project.owner}</div>
            </div>
            <div className="sq-progress" aria-hidden>
              <span style={{ width: `${project.progress || 0}%` }} />
            </div>
            <span style={{ fontSize: '0.78rem', fontWeight: 700 }}>{project.progress || 0}%</span>
          </div>
        ))}
      </section>

      <section className="sq-card">
        <h3>Recent Activity</h3>
        {(data.recentActivity || []).map((item) => (
          <div key={item.id} className="sq-feed-item">
            <strong>{item.actor}</strong> — {item.text}
            <div style={{ fontSize: '0.72rem', color: '#64748b', marginTop: 2 }}>{item.time}</div>
          </div>
        ))}
      </section>

      <section className="sq-card">
        <h3>Latest Discussions</h3>
        {(data.discussions || []).map((item) => (
          <div key={item.id} className="sq-discussion">
            <span style={{ marginRight: 6 }}>{item.icon}</span>
            <strong>{item.title}</strong>
            <div style={{ fontSize: '0.72rem', color: '#94a3b8' }}>
              {item.author} · {item.comments} comments
            </div>
          </div>
        ))}
      </section>

      <section className="sq-card">
        <h3>Recent Files</h3>
        {(data.recentFiles || []).map((file) => (
          <div key={file.id} className="sq-file">
            <strong>{file.name}</strong>
            <div style={{ fontSize: '0.72rem', color: '#94a3b8' }}>{file.size} · {file.uploaded}</div>
          </div>
        ))}
      </section>

      <section className="sq-card">
        <h3>Squad Statistics</h3>
        <div className="sq-stats-grid">
          {(data.squadStats || []).map((stat) => (
            <div key={stat.label} className="sq-stat-box">
              <small>{stat.delta}</small>
              <strong>{stat.value}</strong>
              <span style={{ fontSize: '0.72rem', color: '#94a3b8' }}>{stat.label}</span>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
