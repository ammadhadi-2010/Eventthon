import React from 'react';
import '../../styles/squad-workspace.css';
import SquadOverviewMain from '../workspace/SquadOverviewMain';

/** Center column overview — right rail holds SquadOverview sidebar. */
export default function SquadOverviewTab({ squad, state }) {
  return (
    <div className="sq-ws-overview-pane">
      <SquadOverviewMain squad={squad} state={state} />
    </div>
  );
}
