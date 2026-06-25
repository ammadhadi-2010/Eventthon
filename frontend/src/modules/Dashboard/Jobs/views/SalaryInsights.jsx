import React, { useState } from 'react';
import SalaryTrendChart from '../components/SalaryTrendChart';
import {
  AVERAGE_SALARY,
  SALARY_BY_EXPERIENCE,
  SALARY_BY_ROLE,
  SALARY_TABS,
  SALARY_TREND_POINTS,
  experienceBarPercent,
  formatMoney,
} from '../data/salaryInsightsData';

function ExperienceBars({ rows }) {
  const max = rows[rows.length - 1]?.amount || 150000;
  return (
    <ul className="jh-salary-exp-list">
      {rows.map((row) => (
        <li key={row.id || row.label}>
          <span className="jh-salary-exp-list__label">{row.label}</span>
          <div className="jh-salary-exp-list__track">
            <span style={{ width: `${experienceBarPercent(row.amount, max)}%` }} />
          </div>
          <strong>{formatMoney(row.amount)}</strong>
        </li>
      ))}
    </ul>
  );
}

export default function SalaryInsights() {
  const [activeTab, setActiveTab] = useState('overview');

  return (
    <section className="jh-view jh-view--salary">
      <div className="gigs-card jh-salary-panel">
        <header className="jh-salary-panel__header">
          <h2>Salary Insights</h2>
          <p>Explore salary trends and insights.</p>
        </header>

        <div className="jh-salary-tabs" role="tablist">
          {SALARY_TABS.map((tab) => (
            <button
              key={tab.id}
              type="button"
              role="tab"
              aria-selected={activeTab === tab.id}
              className={`jh-salary-tabs__item${activeTab === tab.id ? ' is-active' : ''}`}
              onClick={() => setActiveTab(tab.id)}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {activeTab === 'overview' ? (
          <div className="jh-salary-grid">
            <article className="jh-salary-card jh-salary-card--avg">
              <h3>Average Salary</h3>
              <strong className="jh-salary-card__value">{formatMoney(AVERAGE_SALARY.value)}</strong>
              <span className="jh-salary-card__change">{AVERAGE_SALARY.change}</span>
              <SalaryTrendChart points={SALARY_TREND_POINTS} />
            </article>
            <article className="jh-salary-card jh-salary-card--exp">
              <h3>Salary by Experience</h3>
              <ExperienceBars rows={SALARY_BY_EXPERIENCE} />
            </article>
          </div>
        ) : null}

        {activeTab === 'role' ? (
          <article className="jh-salary-card jh-salary-card--full">
            <h3>Salary by Role</h3>
            <ExperienceBars
              rows={SALARY_BY_ROLE.map((r) => ({
                id: r.role,
                label: r.role,
                amount: r.amount,
              }))}
            />
          </article>
        ) : null}

        {activeTab === 'location' ? (
          <article className="jh-salary-card jh-salary-card--full">
            <h3>Salary by Location</h3>
            <ExperienceBars
              rows={[
                { id: 'remote', label: 'Remote', amount: 105000 },
                { id: 'sf', label: 'San Francisco, CA', amount: 145000 },
                { id: 'ny', label: 'New York, NY', amount: 132000 },
                { id: 'lon', label: 'London, UK', amount: 98000 },
              ]}
            />
          </article>
        ) : null}

        {activeTab === 'experience' ? (
          <article className="jh-salary-card jh-salary-card--full">
            <h3>Salary by Experience</h3>
            <ExperienceBars rows={SALARY_BY_EXPERIENCE} />
          </article>
        ) : null}
      </div>
    </section>
  );
}
