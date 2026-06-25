import React from 'react';
import SquadOverviewMain from './SquadOverviewMain';
import SquadOverviewRail from './SquadOverviewRail';
import '../../styles/squad-workspace.css';

export default function SquadOverviewDashboard({
  squad,
  state,
  onTabChange,
  onInvite,
  onQuickAction,
}) {
  return (
    <div className="sq-ws-dashboard sq-ws-dashboard-layout">
      <div className="sq-ws-dashboard-main">
        <SquadOverviewMain squad={squad} state={state} />
      </div>
      <aside className="sq-ws-dashboard-rail">
        <SquadOverviewRail
          members={state?.members || []}
          onTabChange={onTabChange}
          onInvite={onInvite}
          onQuickAction={onQuickAction}
        />
      </aside>
    </div>
  );
}
