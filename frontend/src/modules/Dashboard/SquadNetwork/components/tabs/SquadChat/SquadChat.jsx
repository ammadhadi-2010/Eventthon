import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FiArrowLeft, FiUsers } from 'react-icons/fi';
import InviteMembersModal from '../../InviteMembersModal';
import ProjectsTab from '../ProjectsTab';
import MembersTab from '../MembersTab';
import ActivityTab from '../ActivityTab';
import FilesTab from '../FilesTab';
import SettingsTab from '../SettingsTab';
import SquadOverviewTab from '../SquadOverviewTab';
import { SQUAD_HUB_TABS, resolveTabCounts } from '../squadWorkspaceTabs';
import useSquadChatData from '../../hooks/useSquadChatData';
import { isSquadLeader, canInviteSquadMembers } from '../../../utils/squadPermissions';
import { canOpenPublicExplore } from '../../../utils/squadPermissions';
import { openSquadPublicShowroom } from '../../../utils/squadExplore';
import { hireSquad } from '../../../api/squadsApi';
import { sendChatMessage } from '../../../../Messages/services/chatApi';
import { getMessagesSenderId } from '../../../../Messages/utils/messagesSession';
import { readStoredUserStub } from '../../../../../../utils/storedUser';
import SquadHubHero from '../../SquadHubHero';
import SquadHeaderMenu from '../../SquadHeaderMenu';
import { SquadMobileActionToolbar } from '../../SquadMobileChrome';
import SquadChatInbox from '../../chat/SquadChatInbox';
import styles from '../../squadChatStyles';
import '../../../styles/squad-avatar.css';
import '../../../styles/squad-header-menu.css';
import '../../../styles/squad-chat-mobile.css';
import '../../../styles/squad-members-tab.css';
import '../../../styles/squad-members-projects-mobile.css';

const TAB_COLORS = {
  Overview: '#38bdf8',
  Chat: '#3b82f6',
  Projects: '#10b981',
  Members: '#a855f7',
  Activity: '#f59e0b',
  Files: '#06b6d4',
  Settings: '#64748b',
};

const TAB_ICON_SIZE = 15;

const SquadChat = ({
  selectedSquad,
  userData,
  activeTab = 'Overview',
  onTabChange,
  projectsRefreshToken = 0,
  onEditSquad,
  onHubMetrics,
  onOpenSettings,
  onToggleMobileList,
  onMobileBack,
}) => {
  const navigate = useNavigate();
  const [headerToast, setHeaderToast] = React.useState('');
  const [hireBusy, setHireBusy] = React.useState(false);
  const squadId = selectedSquad?._id;
  const { state, actions } = useSquadChatData({
    squadId,
    userData,
    projectsRefreshToken,
  });

  const showToast = (msg) => {
    setHeaderToast(msg);
    window.setTimeout(() => setHeaderToast(''), 2400);
  };

  const handleHireSquad = async () => {
    if (!squadId || hireBusy) return;
    if (!canExploreSquad) {
      showToast('Enable Public listing to hire this squad');
      return;
    }
    setHireBusy(true);
    try {
      const buyerId =
        getMessagesSenderId(readStoredUserStub() || userData) ||
        userData?._id ||
        userData?.id ||
        '';
      const res = await hireSquad(squadId, {
        buyer_user_id: buyerId,
        message: `I'd like to hire ${selectedSquad?.squad_name || 'this squad'}.`,
      });
      showToast(res?.message || 'Hire request sent');
      const route = res?.data?.messages_route || '/messages';
      window.setTimeout(() => navigate(route), 700);
    } catch (err) {
      showToast(
        err?.response?.data?.detail ||
          err?.response?.data?.message ||
          err?.message ||
          'Could not send hire request',
      );
    } finally {
      setHireBusy(false);
    }
  };

  const handleSendMemberMessage = async (member, body) => {
    const peerId = String(member?.id || member?._id || member?.email || member?.mobile || '').trim();
    if (!peerId) throw new Error('Member id missing');
    const senderId =
      getMessagesSenderId(readStoredUserStub() || userData) ||
      userData?._id ||
      userData?.id ||
      '';
    if (!senderId) throw new Error('Sign in again to message members');
    await sendChatMessage({
      seller_user_id: senderId,
      from_user_id: senderId,
      chat_type: 'job',
      context_title: selectedSquad?.squad_name || 'Squad Chat',
      context_id: `squad-${squadId}`,
      body,
      candidate_user_id: peerId,
      attachments: [],
      message_type: 'text',
    });
    onTabChange?.('Chat');
    window.setTimeout(() => {
      window.dispatchEvent(
        new CustomEvent('msgx:select-peer', {
          detail: { peerId, contextId: `squad-${squadId}` },
        }),
      );
    }, 350);
  };

  const tabs = SQUAD_HUB_TABS.map((tab) => ({
    ...tab,
    count: resolveTabCounts(tab, state),
    color: TAB_COLORS[tab.label] || '#3b82f6',
  }));

  const currentUserId = userData?._id || userData?.id;
  const memberCount = state.members.length || selectedSquad?.members_count || 0;
  const onlineCount = state.members.filter((m) => m?.online).length;
  const canEditSquad = isSquadLeader(selectedSquad, userData);
  const canInviteMembers = canInviteSquadMembers(selectedSquad, userData);
  const canExploreSquad = canOpenPublicExplore(selectedSquad);

  React.useEffect(() => {
    onHubMetrics?.({
      members: state.members.length,
      membersList: state.members,
      online: onlineCount,
      projects: state.projects.length,
      messages: state.chatMessages.length,
      files: state.files.length,
      activityOverview: state.activityOverview,
    });
  }, [
    onHubMetrics,
    state.members,
    onlineCount,
    state.projects.length,
    state.chatMessages.length,
    state.files.length,
    state.activityOverview,
  ]);

  if (!selectedSquad) {
    return (
      <div className="squad-hub__center" style={styles.container}>
        <div className="squad-hub__empty" style={styles.empty}>Select a squad to begin</div>
      </div>
    );
  }

  return (
    <div className="squad-hub__center" style={styles.container}>
      <SquadHubHero
        squad={selectedSquad}
        members={state.members}
        memberCount={memberCount}
        canInvite={canInviteMembers}
        canEdit={canEditSquad}
        canExplore={canExploreSquad}
        onInvite={actions.openInvite}
        onEdit={() => onEditSquad?.()}
        onExplore={() => openSquadPublicShowroom({ selectedSquad })}
        onHire={handleHireSquad}
        headerMenu={
          <SquadHeaderMenu
            squadId={squadId}
            onCopyInvite={(msg) => showToast(msg)}
            onSettings={() => onOpenSettings?.()}
            onLeave={actions.leaveSquad}
          />
        }
        mobileBack={
          <button
            type="button"
            className="squad-hub__header-back"
            onClick={() => onMobileBack?.()}
            aria-label="Back to squads list"
          >
            <FiArrowLeft size={18} aria-hidden />
          </button>
        }
        mobileListToggle={
          <button
            type="button"
            className="squad-hub__squad-menu-toggle"
            onClick={() => onMobileBack?.()}
            aria-label="Open squads panel"
          >
            <FiUsers size={18} />
          </button>
        }
        mobileToolbar={
          <SquadMobileActionToolbar
            tabs={tabs}
            activeTab={activeTab}
            onTabChange={onTabChange}
            onInvite={canInviteMembers ? actions.openInvite : undefined}
            onExplore={() => openSquadPublicShowroom({ selectedSquad })}
            onHire={handleHireSquad}
            canExplore={canExploreSquad}
            canInvite={canInviteMembers}
            onEditSquad={() => onEditSquad?.()}
            canEditSquad={canEditSquad}
            headerMenu={
              <SquadHeaderMenu
                squadId={squadId}
                onCopyInvite={(msg) => showToast(msg)}
                onSettings={() => onOpenSettings?.()}
                onLeave={actions.leaveSquad}
              />
            }
          />
        }
      />
      {headerToast ? <div className="sq-header-toast">{headerToast}</div> : null}

      <div className="squad-hub__tabs" style={styles.tabs}>
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const active = activeTab === tab.label;
          return (
            <button
              key={tab.label}
              type="button"
              onClick={() => onTabChange?.(tab.label)}
              style={styles.tab(active, tab.color)}
            >
              {Icon ? <Icon size={TAB_ICON_SIZE} strokeWidth={2} /> : null}
              {tab.label}
              {tab.count != null && tab.count > 0 ? (
                <span style={styles.tabCount}>{tab.count}</span>
              ) : null}
            </button>
          );
        })}
      </div>

      <div
        className={`squad-hub__mobile-pane${
          activeTab === 'Chat' ? ' squad-hub__mobile-pane--chat-inbox' : ''
        }`}
      >
        {activeTab === 'Chat' ? (
          <SquadChatInbox
            key={`squad-member-inbox-${squadId || 'none'}`}
            squad={selectedSquad}
            onOpenMembers={() => onTabChange?.('Members')}
          />
        ) : (
          <div className="squad-hub__content-scroll" style={styles.content}>
            {activeTab === 'Overview' ? (
              <SquadOverviewTab
                squad={selectedSquad}
                state={state}
                onTabChange={onTabChange}
                userData={userData}
              />
            ) : null}
            {activeTab === 'Projects' ? (
              <ProjectsTab
                projects={state.projects}
                squad={selectedSquad}
                userData={userData}
                onUpdateProject={actions.updateProject}
                onDeleteProject={actions.deleteProject}
                onSyncProject={actions.syncProject}
              />
            ) : null}
          {activeTab === 'Members' ? (
            <MembersTab
              members={state.members}
              canInvite={canInviteMembers}
              onInvite={canInviteMembers ? actions.openInvite : undefined}
              onUpdateMemberRole={actions.updateMemberRole}
              onRemoveMember={actions.removeMember}
              onSendMemberMessage={handleSendMemberMessage}
            />
          ) : null}
            {activeTab === 'Activity' ? (
              <ActivityTab squadId={squadId} userData={userData} isActive />
            ) : null}
            {activeTab === 'Files' ? (
              <FilesTab
                files={state.files}
                onUploadFile={actions.uploadSquadFile}
                onDeleteFile={actions.deleteSquadFile}
              />
            ) : null}
            {activeTab === 'Settings' ? (
              <SettingsTab
                selectedSquad={selectedSquad}
                members={state.members}
                onEditSquad={onEditSquad}
              />
            ) : null}
          </div>
        )}
      </div>

      <InviteMembersModal
        isOpen={state.inviteModalOpen}
        squadId={squadId}
        invitedBy={currentUserId}
        onClose={(invited) => {
          actions.closeInvite();
          if (invited) actions.refreshMembersAfterInvite();
        }}
      />
    </div>
  );
};

export default SquadChat;
