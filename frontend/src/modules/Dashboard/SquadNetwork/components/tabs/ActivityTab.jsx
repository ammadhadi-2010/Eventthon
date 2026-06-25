import React from 'react';
import SquadActivityFeed from '../activity/SquadActivityFeed';

const ActivityTab = ({ squadId, userData, isActive = true }) => (
  <div style={wrap}>
    <div style={headerRow}>
      <h3 style={heading}>Squad Activity Feed</h3>
      <span style={hint}>Ask Squad posts from your squads appear here</span>
    </div>
    <SquadActivityFeed squadId={squadId} userData={userData} isActive={isActive} />
  </div>
);

const wrap = {
  display: 'flex',
  flexDirection: 'column',
  gap: '12px',
  width: '100%',
};
const headerRow = {
  display: 'flex',
  alignItems: 'baseline',
  justifyContent: 'space-between',
  gap: '12px',
  flexWrap: 'wrap',
};
const heading = {
  margin: 0,
  fontSize: '18px',
  color: '#e2e8f0',
  fontWeight: '700',
};
const hint = {
  color: '#64748b',
  fontSize: '12px',
  fontWeight: '600',
};

export default ActivityTab;
