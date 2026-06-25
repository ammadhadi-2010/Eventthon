import React from 'react';
import {
  INTERVIEW_PREP_FEATURES,
  INTERVIEW_RECENT_ACTIVITY,
} from '../data/interviewPrepData';

export default function InterviewPrep() {
  return (
    <section className="jh-view jh-view--interview">
      <div className="gigs-card jh-interview-panel">
        <header className="jh-interview-panel__header">
          <h2>Interview Preparation</h2>
          <p>Prepare for your next interview with confidence.</p>
        </header>

        <div className="jh-interview-features">
          {INTERVIEW_PREP_FEATURES.map((item) => (
            <article key={item.id} className="jh-interview-feature">
              <h3>{item.title}</h3>
              <p>{item.description}</p>
              <button type="button" className="jobs-alert-btn jh-interview-feature__btn">
                {item.action}
              </button>
            </article>
          ))}
        </div>

        <div className="jh-interview-activity">
          <h3 className="jh-interview-activity__title">Recent Activity</h3>
          <ul>
            {INTERVIEW_RECENT_ACTIVITY.map((row) => (
              <li key={row.id} className="jh-interview-activity__row">
                <span className="jh-interview-activity__name">{row.title}</span>
                <span className="jh-interview-activity__status">{row.status}</span>
                <div className="jh-interview-activity__progress">
                  <em>{row.percent}%</em>
                  <div className="jh-interview-activity__bar">
                    <span style={{ width: `${row.percent}%` }} />
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
