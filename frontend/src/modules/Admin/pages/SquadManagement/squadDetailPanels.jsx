import { resolveSquadImageurl } from './squadData';

export function SquadKpi({ label, value }) {
  return (
    <div className="sd-kpi">
      <strong>{value}</strong>
      <span>{label}</span>
    </div>
  );
}

export function SquadDetailItem({ label, value }) {
  return (
    <div className="sd-item">
      <dt>{label}</dt>
      <dd>{value}</dd>
    </div>
  );
}

export function SquadMembersPanel({ members, resolveImageurl }) {
  return (
    <div className="sd-list">
      {members.map((member) => (
        <article key={member.id} className="sd-list__row">
          <div className="sd-leader">
            <img src={resolveImageurl(member)} alt="" className="um-avatar sd-profile-avatar" />
            <div>
              <p>{member.name}</p>
              <span>{member.handle}</span>
            </div>
          </div>
          <span className="um-role-pill">{member.role}</span>
          <span className="sd-muted">{member.status}</span>
        </article>
      ))}
    </div>
  );
}

export function SquadProjectsPanel({ projects }) {
  return (
    <div className="sd-list">
      {projects.map((project) => (
        <article key={project.id} className="sd-list__row sd-list__row--project">
          <div>
            <p className="sd-list__title">{project.title}</p>
            <span>Owner: {project.owner}</span>
          </div>
          <span className="um-role-pill">{project.status}</span>
          <span className="sd-muted">{project.due}</span>
        </article>
      ))}
    </div>
  );
}

export function SquadActivityPanel({ activities }) {
  return (
    <ul className="sd-activity">
      {activities.map((item) => (
        <li key={item.id} className="sd-activity__item">
          <p>{item.message}</p>
          <span>{item.time}</span>
        </li>
      ))}
    </ul>
  );
}

export function SquadSettingsPanel({ squad }) {
  return (
    <div className="sd-panel">
      <h3>Squad Settings</h3>
      <dl>
        <SquadDetailItem label="Visibility" value={squad.visibility || 'Public'} />
        <SquadDetailItem label="Join Policy" value="Approval required" />
        <SquadDetailItem label="Posting Permissions" value="Leader and senior members" />
        <SquadDetailItem label="Moderation Mode" value="Enabled" />
      </dl>
    </div>
  );
}

export function buildSquadMembers(squad) {
  if (Array.isArray(squad.membersList) && squad.membersList.length) {
    return squad.membersList.map((member, index) => ({
      ...member,
      imageurl: member.imageurl || resolveSquadImageurl(member),
      id: member.id || `member-${index}`,
    }));
  }
  const leaderRow = {
    id: 'leader',
    name: squad.leader || 'Squad Leader',
    handle: squad.leaderHandle || '@leader',
    role: 'Leader',
    status: 'Online',
    imageurl: squad.leaderImageurl || '',
  };
  return [
    { ...leaderRow, imageurl: resolveSquadImageurl(leaderRow) },
    {
      id: 2,
      name: 'Amna Riaz',
      handle: '@amna.r',
      role: 'Senior Member',
      status: 'Online',
      imageurl: resolveSquadImageurl({ name: 'Amna Riaz' }),
    },
    {
      id: 3,
      name: 'Hamza Tariq',
      handle: '@hamza.t',
      role: 'Member',
      status: 'Away',
      imageurl: resolveSquadImageurl({ name: 'Hamza Tariq' }),
    },
    {
      id: 4,
      name: 'Noor Fatima',
      handle: '@noor.f',
      role: 'Member',
      status: 'Offline',
      imageurl: resolveSquadImageurl({ name: 'Noor Fatima' }),
    },
  ];
}

export function buildSquadProjects(squad) {
  return [
    { id: 1, title: 'SEO Sprint Q2', owner: squad.leader, status: 'Active', due: 'Jun 03, 2026' },
    { id: 2, title: 'Backlink Audit', owner: 'Amna Riaz', status: 'In Review', due: 'Jun 08, 2026' },
    { id: 3, title: 'Content Cluster Build', owner: 'Hamza Tariq', status: 'Planned', due: 'Jun 14, 2026' },
  ];
}

export function buildSquadActivities(squad) {
  if (Array.isArray(squad.activityList) && squad.activityList.length) {
    return squad.activityList.map((item, index) => ({
      id: item.id || `act-${index}`,
      message: item.message || item.text || 'Squad activity',
      time: item.time || '—',
    }));
  }
  return [
    { id: 1, message: `${squad.leader} approved a project roadmap`, time: '2 hours ago' },
    { id: 2, message: 'Weekly squad sync completed', time: '5 hours ago' },
    { id: 3, message: 'Two new members joined the squad', time: '1 day ago' },
  ];
}
