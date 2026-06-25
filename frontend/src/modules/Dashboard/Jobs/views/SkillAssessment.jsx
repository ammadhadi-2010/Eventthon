import React from 'react';
import { FiHexagon } from 'react-icons/fi';
import AssessmentProgressRing from '../components/AssessmentProgressRing';
import {
  ASSESSMENT_OVERALL_PERCENT,
  ASSESSMENT_SKILL_ROWS,
  SUGGESTED_SKILLS,
} from '../data/assessmentData';

export default function SkillAssessment() {
  return (
    <section className="jh-view jh-view--assessment">
      <div className="gigs-card jh-assess-panel">
        <header className="jh-assess-panel__header">
          <div>
            <h2>Skill Assessment</h2>
            <p>Test your skills and get personalized job recommendations.</p>
          </div>
          <button type="button" className="jobs-alert-btn jh-assess-panel__cta">
            Take Assessment
          </button>
        </header>

        <div className="gigs-card jh-assess-block">
          <p className="jh-assess-block__label">Assessment Progress</p>
          <div className="jh-assess-progress">
            <AssessmentProgressRing percent={ASSESSMENT_OVERALL_PERCENT} />
            <ul className="jh-assess-metrics">
              {ASSESSMENT_SKILL_ROWS.map((row) => {
                const pct = Math.round((row.current / row.total) * 100);
                return (
                  <li key={row.id}>
                    <div className="jh-assess-metrics__head">
                      <span>
                        <FiHexagon size={12} aria-hidden /> {row.label}
                      </span>
                      <em>
                        {row.current}/{row.total}
                      </em>
                    </div>
                    <div className="jh-assess-metrics__bar">
                      <span style={{ width: `${pct}%` }} />
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>
        </div>

        <div className="gigs-card jh-assess-block">
          <p className="jh-assess-block__label">Suggested Skills to Improve</p>
          <div className="jh-assess-tags">
            {SUGGESTED_SKILLS.map((skill) => (
              <span key={skill} className="jh-assess-tag">
                <FiHexagon size={10} aria-hidden /> {skill}
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
