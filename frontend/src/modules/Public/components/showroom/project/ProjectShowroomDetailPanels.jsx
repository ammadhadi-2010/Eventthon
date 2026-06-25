import React from 'react';
import { Activity, BarChart3, CheckCircle2 } from 'lucide-react';
import ShowroomStackTag from '../ShowroomStackTag';
import { metricBarWidth } from './mapPublicProjectShowroom';

function activityStatusLabel(item) {
  const status = String(item?.status || '').toLowerCase();
  if (status === 'completed') return 'Completed';
  if (status === 'in-progress') return 'In progress';
  if (status === 'pending') return 'Queued';
  return item?.detail || 'Updated';
}

export function OverviewPanel({ data }) {
  return (
    <section className="ps-aside-card" id="showroom-overview">
      <h2>
        <CheckCircle2 size={14} aria-hidden /> Project Description
      </h2>
      <p>{data.longDescription || data.summary}</p>
      {data.features?.length > 0 ? (
        <ul className="ps-feature-list">
          {data.features.map((feature) => (
            <li key={feature}>{feature}</li>
          ))}
        </ul>
      ) : null}
      <h3 className="ps-subhead">Tech Stack</h3>
      <div className="ps-stack-grid">
        {(data.techStackTags || []).map((tag) => (
          <ShowroomStackTag key={tag} label={tag} />
        ))}
      </div>
    </section>
  );
}

export function AnalyticsPanel({ data }) {
  const metrics = data.metrics?.length ? data.metrics : [];
  return (
    <section className="ps-aside-card" id="showroom-analytics">
      <h2>
        <BarChart3 size={14} aria-hidden /> Analytics Snapshot
      </h2>
      <div className="ps-analytics-bars">
        {metrics.slice(0, 5).map((metric) => (
          <div key={metric.id || metric.label} className="ps-analytics-row">
            <span>{metric.label}</span>
            <div className="ps-analytics-track">
              <div
                className="ps-analytics-fill"
                style={{ width: `${metricBarWidth(metric, data)}%` }}
              />
            </div>
            <strong>{metric.value}</strong>
          </div>
        ))}
      </div>
    </section>
  );
}

export function ActivityPanel({ data }) {
  const activityRows = data.recentActivity?.length
    ? data.recentActivity
    : (data.milestones || []).map((milestone) => ({
        title: milestone.title,
        detail: milestone.description || milestone.title,
        status: milestone.status,
      }));

  return (
    <section className="ps-aside-card" id="showroom-activity">
      <h2>
        <Activity size={14} aria-hidden /> Recent Activity
      </h2>
      <ul className="ps-activity-feed">
        {activityRows.map((item) => (
          <li key={`${item.title}-${item.detail}`}>
            <span className={`ps-activity-dot ps-activity-dot--${item.status || 'pending'}`} />
            <div>
              <strong>{item.title}</strong>
              <p>{activityStatusLabel(item)}</p>
            </div>
          </li>
        ))}
      </ul>
      <div className="ps-meta-footer">
        <p><span>Created</span> {data.createdLabel}</p>
        <p><span>Updated</span> {data.updatedLabel}</p>
        <p><span>License</span> {data.license}</p>
        <p><span>Squad</span> {data.squadName}</p>
      </div>
    </section>
  );
}
