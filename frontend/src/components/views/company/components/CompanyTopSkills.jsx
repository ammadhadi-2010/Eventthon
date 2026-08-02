import React from 'react';

const TONES = ['violet', 'cyan', 'green', 'violet', 'cyan'];

export default function CompanyTopSkills({ skills }) {
  const list = Array.isArray(skills) ? skills : [];

  return (
    <section className="cp-section cp-glass">
      <div className="cp-section__head">
        <h2>Top Applicant Skills</h2>
      </div>
      {list.length === 0 ? (
        <p className="cp-empty">Skills appear once candidates apply to your jobs.</p>
      ) : (
        <div className="cp-skills-panel">
          <div className="cp-skill-capsules">
            {list.map((skill, i) => (
              <span
                key={skill.name || i}
                className={`cp-skill-capsule cp-skill-capsule--${TONES[i % TONES.length]}`}
              >
                {skill.name}
                <em style={{ marginLeft: 6, opacity: 0.8 }}>{skill.percent}%</em>
              </span>
            ))}
          </div>
          <ul className="cp-skills-panel" style={{ listStyle: 'none', margin: 0, padding: 0, gap: 10 }}>
            {list.map((skill, i) => (
              <li key={`bar-${skill.name || i}`}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 4 }}>
                  <span>{skill.name}</span>
                  <span>{skill.percent}%</span>
                </div>
                <div
                  className={`cp-skill-bar--${TONES[i % TONES.length]}`}
                  style={{ height: 6, borderRadius: 999, background: 'rgba(148,163,184,0.15)', overflow: 'hidden' }}
                >
                  <span style={{ display: 'block', height: '100%', width: `${Math.min(100, skill.percent || 0)}%` }} />
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </section>
  );
}
