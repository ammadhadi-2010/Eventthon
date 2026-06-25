import React, { useMemo } from 'react';
import { buildDonutGradient, resolveActivityOverview } from './activityDonutUtils';

export default function SquadActivityDonut({ activityOverview = [], hubMetrics = null }) {
  const stats = useMemo(
    () => resolveActivityOverview(activityOverview, hubMetrics),
    [activityOverview, hubMetrics]
  );
  const total = stats.reduce((sum, item) => sum + (item.value || 0), 0);
  const chartBackground = useMemo(() => buildDonutGradient(stats), [stats]);

  if (!stats.length) return null;

  return (
    <div style={panel}>
      <h4 style={title}>Activity Overview (7 Days)</h4>
      <div style={overviewWrap}>
        <div style={donutOuter(chartBackground)}>
          <div style={donutInner}>
            <strong style={donutTotal}>{total}</strong>
            <span style={donutLabel}>Activities</span>
          </div>
        </div>
        <div style={legend}>
          {stats.map((item) => (
            <div key={item.label} style={legendRow}>
              <span style={{ ...legendDot, background: item.color }} />
              <span style={legendLabel}>{item.label}</span>
              <strong style={legendValue}>{item.value}</strong>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

const panel = {
  background: '#0f1117',
  borderRadius: '10px',
  padding: '12px 14px',
  border: '1px solid #1e2130',
};
const title = {
  margin: '0 0 12px',
  fontSize: '12px',
  fontWeight: '800',
  color: '#94a3b8',
  letterSpacing: '0.6px',
  textTransform: 'uppercase',
};
const overviewWrap = { display: 'grid', gridTemplateColumns: '120px 1fr', gap: '12px', alignItems: 'center' };
const donutOuter = (background) => ({
  width: '112px',
  height: '112px',
  borderRadius: '50%',
  background,
  display: 'grid',
  placeItems: 'center',
});
const donutInner = {
  width: '72px',
  height: '72px',
  borderRadius: '50%',
  background: '#0a1427',
  border: '1px solid rgba(148,163,184,0.2)',
  display: 'grid',
  placeItems: 'center',
};
const donutTotal = { color: '#f8fafc', fontSize: '28px', lineHeight: 1 };
const donutLabel = { color: '#a5b4cf', fontSize: '11px' };
const legend = { display: 'flex', flexDirection: 'column', gap: '8px' };
const legendRow = { display: 'grid', gridTemplateColumns: '10px 1fr auto', gap: '6px', alignItems: 'center' };
const legendDot = { width: '8px', height: '8px', borderRadius: '50%' };
const legendLabel = { color: '#d2dcf4', fontSize: '12px' };
const legendValue = { color: '#f1f5ff', fontSize: '12px' };
