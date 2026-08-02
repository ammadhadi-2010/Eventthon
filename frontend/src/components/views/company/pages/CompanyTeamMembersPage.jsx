import React, { useCallback, useEffect, useMemo, useState } from 'react';
import CompanyBreadcrumb, { companyHubCrumbs } from '../components/CompanyBreadcrumb';
import TeamInviteModal from '../team/TeamInviteModal';
import TeamTransferModal from '../team/TeamTransferModal';
import TeamMemberRow from '../team/TeamMemberRow';
import TeamPendingRow from '../team/TeamPendingRow';
import TeamAuditList from '../team/TeamAuditList';
import {
  changeCompanyMemberRole,
  fetchCompanyTeam,
  removeCompanyMember,
  revokeCompanyInvite,
  suspendCompanyMember,
  unsuspendCompanyMember,
} from '../services/companyTeamApi';
import '../styles/company-jobs-pages.css';
import '../styles/company-recent-apps.css';
import '../styles/company-team.css';

const TABS = [
  { id: 'active', label: 'Active Members' },
  { id: 'pending', label: 'Pending Invites' },
  { id: 'suspended', label: 'Suspended' },
  { id: 'audit', label: 'Activity Logs' },
];

export default function CompanyTeamMembersPage() {
  const [tab, setTab] = useState('active');
  const [data, setData] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [inviteOpen, setInviteOpen] = useState(false);
  const [transferTarget, setTransferTarget] = useState(null);

  const reload = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const payload = await fetchCompanyTeam();
      setData(payload);
    } catch (err) {
      setError(err?.response?.data?.detail || 'Unable to load team.');
      setData(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    reload();
  }, [reload]);

  const permissions = data?.permissions || [];
  const canInvite = Boolean(data?.canInvite);
  const canRevoke = canInvite || permissions.includes('remove_members');
  const canViewAudit = permissions.includes('view_audit');

  const counts = useMemo(() => ({
    active: data?.activeMembers?.length || 0,
    pending: data?.pendingInvites?.length || 0,
    suspended: data?.suspendedMembers?.length || 0,
    audit: data?.auditLogs?.length || 0,
  }), [data]);

  const visibleTabs = TABS.filter((t) => t.id !== 'audit' || canViewAudit);

  const run = async (fn) => {
    try {
      await fn();
      await reload();
    } catch (err) {
      setError(err?.response?.data?.detail || 'Action failed.');
    }
  };

  return (
    <div className="cp-hub-page">
      <CompanyBreadcrumb items={companyHubCrumbs('Team Members')} />
      <section className="cp-section cp-glass cp-hub-page__panel">
        <header className="cp-hub-page__intro">
          <div>
            <h1>Team Members</h1>
            <p>
              Invite-only access for {data?.companyName || 'your company'}. Roles use permission-based RBAC.
            </p>
          </div>
          <div className="cp-team-header-actions">
            <span className="cp-hub-page__count">{counts.active} active</span>
            {canInvite ? (
              <button type="button" className="cp-team-invite-btn" onClick={() => setInviteOpen(true)}>
                Invite member
              </button>
            ) : null}
          </div>
        </header>

        {error ? <p className="cp-team-banner">{error}</p> : null}
        {loading ? <p className="cp-empty">Loading team…</p> : null}

        {!loading && data ? (
          <>
            <div className="cp-hub-page__filters" role="tablist" aria-label="Team sections">
              {visibleTabs.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  role="tab"
                  aria-selected={tab === item.id}
                  className={`cp-hub-page__chip${tab === item.id ? ' is-active' : ''}`}
                  onClick={() => setTab(item.id)}
                >
                  {item.label}
                  <em>{counts[item.id] || 0}</em>
                </button>
              ))}
            </div>

            {tab === 'active' ? (
              <ul className="cp-apps-list">
                {(data.activeMembers || []).length === 0 ? (
                  <li className="cp-empty">No active members yet.</li>
                ) : (
                  data.activeMembers.map((member, index) => (
                    <TeamMemberRow
                      key={member.id}
                      member={member}
                      index={index}
                      roles={data.roles || []}
                      permissions={permissions}
                      meId={data.me?.id}
                      onRoleChange={(m, role) => run(() => changeCompanyMemberRole(m.id, role))}
                      onSuspend={(m) => {
                        const reason = window.prompt('Suspension reason (optional):', '') || '';
                        return run(() => suspendCompanyMember(m.id, reason));
                      }}
                      onRemove={(m) => {
                        if (!window.confirm(`Remove ${m.name || m.email} from the company?`)) return;
                        return run(() => removeCompanyMember(m.id));
                      }}
                      onTransfer={setTransferTarget}
                    />
                  ))
                )}
              </ul>
            ) : null}

            {tab === 'pending' ? (
              <ul className="cp-apps-list">
                {(data.pendingInvites || []).length === 0 ? (
                  <li className="cp-empty">No pending invitations.</li>
                ) : (
                  data.pendingInvites.map((invite) => (
                    <TeamPendingRow
                      key={invite.id}
                      invite={invite}
                      canRevoke={canRevoke}
                      onRevoke={(row) => run(() => revokeCompanyInvite(row.id))}
                    />
                  ))
                )}
              </ul>
            ) : null}

            {tab === 'suspended' ? (
              <ul className="cp-apps-list">
                {(data.suspendedMembers || []).length === 0 ? (
                  <li className="cp-empty">No suspended members.</li>
                ) : (
                  data.suspendedMembers.map((member, index) => (
                    <TeamMemberRow
                      key={member.id}
                      member={member}
                      index={index}
                      roles={data.roles || []}
                      permissions={permissions}
                      meId={data.me?.id}
                      onUnsuspend={(m) => run(() => unsuspendCompanyMember(m.id))}
                      onRemove={(m) => {
                        if (!window.confirm(`Remove ${m.name || m.email}?`)) return;
                        return run(() => removeCompanyMember(m.id));
                      }}
                    />
                  ))
                )}
              </ul>
            ) : null}

            {tab === 'audit' && canViewAudit ? (
              <TeamAuditList logs={data.auditLogs || []} />
            ) : null}
          </>
        ) : null}
      </section>

      {inviteOpen ? (
        <TeamInviteModal
          roles={data?.roles || []}
          onClose={() => setInviteOpen(false)}
          onInvited={reload}
        />
      ) : null}
      {transferTarget ? (
        <TeamTransferModal
          target={transferTarget}
          onClose={() => setTransferTarget(null)}
          onDone={reload}
        />
      ) : null}
    </div>
  );
}
