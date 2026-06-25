import React from 'react';
import { FiArrowLeft, FiCompass, FiEdit2, FiUserPlus, FiUsers, FiX } from 'react-icons/fi';
import EmojiPicker from '../../../../components/Global/EmojiPicker';
import '../../../../Messages/styles/MessagesInbox.chat.css';
import SquadChatArea from '../../../SquadChatArea';
import SquadInputBar from '../../../SquadInputBar';
import InviteMembersModal from '../../InviteMembersModal';
import ProjectsTab from '../ProjectsTab';
import MembersTab from '../MembersTab';
import ActivityTab from '../ActivityTab';
import FilesTab from '../FilesTab';
import SettingsTab from '../SettingsTab';
import SquadOverviewTab from '../SquadOverviewTab';
import { SQUAD_HUB_TABS, resolveTabCounts } from '../squadWorkspaceTabs';
import useSquadChatData from '../../hooks/useSquadChatData';
import useSquadMessageMenu from '../../hooks/useSquadMessageMenu';
import { isSquadLeader, canInviteSquadMembers } from '../../../utils/squadPermissions';
import { canOpenPublicExplore } from '../../../utils/squadPermissions';
import { openSquadPublicShowroom } from '../../../utils/squadExplore';
import SquadAvatar from '../../SquadAvatar';
import SquadHeaderMenu from '../../SquadHeaderMenu';
import { SquadMobileActionToolbar } from '../../SquadMobileChrome';
import styles from '../../squadChatStyles';
import '../../../styles/squad-avatar.css';
import '../../../styles/squad-header-menu.css';
import '../../../styles/squad-chat-mobile.css';
import '../../../styles/squad-members-tab.css';
import '../../../styles/squad-members-projects-mobile.css';

const QUICK_REACTIONS = ['👍', '❤️', '😂', '😮', '😢', '🙏'];

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
  const [headerToast, setHeaderToast] = React.useState('');
  const squadId = selectedSquad?._id;
  const { state, actions } = useSquadChatData({ squadId, userData, refreshToken: projectsRefreshToken });
  const menu = useSquadMessageMenu();

  const tabs = SQUAD_HUB_TABS.map((tab) => ({
    ...tab,
    count: resolveTabCounts(tab, state),
    color: TAB_COLORS[tab.label] || '#3b82f6',
  }));

  const currentUserId = userData?._id || userData?.id;
  const currentUserName = `${userData?.first_name || 'Member'} ${userData?.last_name || ''}`.trim();
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
    state.members.length,
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
      <div className="squad-hub__header" style={styles.header}>
        <div className="squad-hub__header-brand">
          <button
            type="button"
            className="squad-hub__header-back"
            onClick={() => onMobileBack?.()}
            aria-label="Back to squads list"
          >
            <FiArrowLeft size={18} aria-hidden />
          </button>
          <SquadAvatar
            squad={selectedSquad}
            size="lg"
            showOnlineDot
            className="squad-hub__header-avatar"
          />
          <div className="squad-hub__header-copy" style={styles.squadInfo}>
            <div className="squad-hub__squad-title" style={styles.squadName}>
              {selectedSquad.squad_name} 👑
            </div>
            <div className="squad-hub__header-meta" style={styles.squadMeta}>
              {selectedSquad.niche || 'Squad'} • {memberCount} Members
            </div>
          </div>
          <button
            type="button"
            className="squad-hub__squad-menu-toggle"
            onClick={() => onMobileBack?.()}
            aria-label="Open squads panel"
          >
            <FiUsers size={18} />
          </button>
        </div>
        <div className="squad-hub__header-actions squad-hub__header-actions--desktop" style={styles.actions}>
          {canInviteMembers ? (
            <button type="button" className="squad-hub__header-btn" style={styles.inviteBtn} onClick={actions.openInvite}>
              <FiUserPlus size={15} /> Invite
            </button>
          ) : null}
          {canEditSquad ? (
            <button
              type="button"
              className="squad-hub__header-btn"
              style={styles.inviteBtn}
              onClick={() => onEditSquad?.()}
            >
              <FiEdit2 size={15} /> Edit Squad
            </button>
          ) : null}
          <button
            type="button"
            className="squad-hub__header-btn"
            style={styles.inviteBtn}
            onClick={() => openSquadPublicShowroom({ selectedSquad })}
            disabled={!canExploreSquad}
            title={canExploreSquad ? 'Open public showroom' : 'Enable Public listing in Settings to explore'}
          >
            <FiCompass size={15} /> Explore Squad
          </button>
          <SquadHeaderMenu
            squadId={squadId}
            onCopyInvite={(msg) => {
              setHeaderToast(msg);
              window.setTimeout(() => setHeaderToast(''), 2200);
            }}
            onSettings={() => onOpenSettings?.()}
            onLeave={actions.leaveSquad}
          />
        </div>

        <SquadMobileActionToolbar
          tabs={tabs}
          activeTab={activeTab}
          onTabChange={onTabChange}
          onInvite={canInviteMembers ? actions.openInvite : undefined}
          onExplore={() => openSquadPublicShowroom({ selectedSquad })}
          canExplore={canExploreSquad}
          canInvite={canInviteMembers}
          onEditSquad={() => onEditSquad?.()}
          canEditSquad={canEditSquad}
          headerMenu={
            <SquadHeaderMenu
              squadId={squadId}
              onCopyInvite={(msg) => {
                setHeaderToast(msg);
                window.setTimeout(() => setHeaderToast(''), 2200);
              }}
              onSettings={() => onOpenSettings?.()}
              onLeave={actions.leaveSquad}
            />
          }
        />
      </div>
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

      <div className="squad-hub__mobile-pane">
      {state.showPinned && activeTab === 'Chat' ? (
        <div className="squad-chat-pinned" style={styles.pinned}>
          📌 <span style={styles.pinnedText}>
            Welcome to {selectedSquad.squad_name}! Read guidelines and introduce yourself.
          </span>
          <FiX
            size={13}
            color="#4a5070"
            style={{ cursor: 'pointer', marginLeft: 'auto' }}
            onClick={() => actions.setShowPinned(false)}
          />
        </div>
      ) : null}

      {activeTab === 'Chat' ? (
        <div className="squad-hub__chat-pane" style={styles.chatPane}>
          {state.loading ? (
            <div className="squad-chat-messages squad-chat-loading">
              Loading squad chat...
            </div>
          ) : (
            <SquadChatArea
              messages={state.chatMessages}
              currentUserId={currentUserId}
              currentUserName={currentUserName}
              onOpenMessageMenu={menu.openMessageMenuAt}
            />
          )}
        </div>
      ) : (
        <div className="squad-hub__content-scroll" style={styles.content}>
          {activeTab === 'Overview' ? (
            <SquadOverviewTab squad={selectedSquad} state={state} />
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
            <SettingsTab selectedSquad={selectedSquad} members={state.members} onEditSquad={onEditSquad} />
          ) : null}
        </div>
      )}

      {state.chatNotice ? <div className="squad-chat-notice">{state.chatNotice}</div> : null}

      {activeTab === 'Chat' ? (
        <SquadInputBar
          message={state.message}
          setMessage={actions.setMessage}
          squadName={selectedSquad?.squad_name}
          onSend={actions.sendMessage}
          onFileSelect={actions.uploadSquadFile}
          editingMessage={state.editingMessage}
          onCancelEdit={actions.cancelEdit}
        />
      ) : null}

      {menu.menuState.open ? (
        <div
          ref={menu.menuRef}
          className="msgx-msg-menu"
          style={{ left: `${menu.menuState.x}px`, top: `${menu.menuState.y}px` }}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="msgx-msg-react-row">
            {QUICK_REACTIONS.map((emoji) => (
              <button
                key={emoji}
                type="button"
                onClick={() => {
                  actions.reactToMessage(menu.menuState.messageId, emoji);
                  menu.closeMenu();
                }}
              >
                {emoji}
              </button>
            ))}
          </div>
          <div className="msgx-msg-menu-list">
            <button
              type="button"
              onClick={() => {
                actions.shareMessage(menu.menuState.messageId);
                menu.closeMenu();
              }}
            >
              Share
            </button>
            {menu.menuState.isOwn ? (
              <button
                type="button"
                onClick={() => {
                  actions.startEditMessage(menu.menuState.messageId);
                  menu.closeMenu();
                }}
              >
                Edit
              </button>
            ) : null}
            {menu.menuState.isOwn ? (
              <button
                type="button"
                onClick={() => {
                  if (window.confirm('Delete this message?')) {
                    actions.deleteMessage(menu.menuState.messageId);
                  }
                  menu.closeMenu();
                }}
              >
                Delete
              </button>
            ) : null}
          </div>
        </div>
      ) : null}
      </div>

      {menu.emojiPickerFor ? (
        <div
          ref={menu.pickerRef}
          className="msgx-msg-emoji-float"
          style={{
            left: `${Math.max(10, menu.emojiAnchor.x)}px`,
            top: `${Math.max(10, menu.emojiAnchor.y)}px`,
          }}
        >
          <EmojiPicker
            width={300}
            height={360}
            onSelect={(emoji) => {
              actions.reactToMessage(menu.emojiPickerFor, emoji);
              menu.closeMenu();
            }}
          />
        </div>
      ) : null}

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
