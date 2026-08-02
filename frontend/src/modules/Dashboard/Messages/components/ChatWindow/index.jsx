import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import EmojiPicker from '../../../components/Global/EmojiPicker';
import CompanyAiPanel from '../companyCollab/CompanyAiPanel';
import '../companyCollab/company-collab.css';
import ChatComposer from './ChatComposer';
import ChatHeader from './ChatHeader';
import SmartConversationHeader from './smartHeader/SmartConversationHeader';
import ChatThreadSection from './ChatThreadSection';
import useChatWindowState from './useChatWindowState';
import useCompanyChatCollab from './useCompanyChatCollab';

const ChatWindow = ({
  selectedMessage,
  allMessages,
  currentUserId,
  onSendMessage,
  onUpdateDeliveryStatus,
  onUploadAttachment,
  onMessageAction,
  onDeleteMessage,
  onConversationPreference,
  onFetchConversationPreference,
  sending,
  onBack,
  onOpenWorkspace,
  companyMode = false,
  squadMode = false,
}) => {
  const navigate = useNavigate();
  const [aiOpen, setAiOpen] = useState(false);
  const richMode = companyMode || squadMode;
  const state = useChatWindowState({
    selectedMessage,
    allMessages,
    currentUserId,
    onSendMessage,
    onUpdateDeliveryStatus,
    onUploadAttachment,
    onMessageAction,
    onDeleteMessage,
    onConversationPreference,
    onFetchConversationPreference,
    sending,
    navigate,
  });
  const collab = useCompanyChatCollab(selectedMessage, companyMode && !squadMode);

  useEffect(() => {
    setAiOpen(false);
  }, [selectedMessage?._id]);

  if (!selectedMessage) {
    return (
      <section className="msgx-chat">
        <p className="msgx-empty">Select a chat to open conversation.</p>
      </section>
    );
  }

  const headerProps = {
    selectedMessage,
    headerMenuOpen: state.headerMenuOpen,
    headerMenuRef: state.headerMenuRef,
    onOpenAudioCall: () => state.setCallModalType('audio'),
    onOpenVideoCall: () => state.setCallModalType('video'),
    onToggleHeaderMenu: () => state.setHeaderMenuOpen((prev) => !prev),
    onHeaderMenuAction: state.handleHeaderMenuAction,
    onBack,
    onOpenWorkspace,
  };

  const insertDraftText = (text) => {
    const chunk = String(text || '').trim();
    if (!chunk) return;
    state.setDraft((prev) => {
      const base = String(prev || '');
      if (!base.trim()) return chunk;
      const needsSpace = !/\s$/.test(base);
      return `${base}${needsSpace ? ' ' : ''}${chunk}`;
    });
  };

  return (
    <section className={`msgx-chat${richMode ? ' msgx-chat--company' : ''}`}>
      {companyMode && !squadMode ? (
        <SmartConversationHeader
          {...headerProps}
          onScheduleInterview={() => state.setCallModalType('interview')}
          assignment={collab.assignment}
          isTyping={Boolean(String(state.draft || '').trim())}
          onAssignmentChange={collab.setAssignment}
          onInsertMention={insertDraftText}
          aiOpen={aiOpen}
          onToggleAi={() => setAiOpen((v) => !v)}
        />
      ) : (
        <ChatHeader {...headerProps} />
      )}

      {companyMode && !squadMode ? (
        <CompanyAiPanel
          open={aiOpen}
          selectedMessage={selectedMessage}
          thread={state.thread}
          profile={collab.profile}
          draft={state.draft}
          onInsertText={insertDraftText}
        />
      ) : null}

      <ChatThreadSection
        orderInfo={state.orderInfo}
        selectedMessage={selectedMessage}
        thread={state.thread}
        toAbsoluteUrl={state.toAbsoluteUrl}
        onOpenOrderModal={() => state.setOrderModalOpen(true)}
        onShowNotice={state.showNotice}
        onOpenMessageMenu={state.openMessageMenuAt}
        onToggleLike={state.toggleLike}
        richStatus={richMode}
        peerTyping={richMode && Boolean(String(state.draft || '').trim())}
      />

      <ChatComposer
        replyTo={state.replyTo}
        onCancelReply={() => state.setReplyTo(null)}
        fileInputRef={state.fileInputRef}
        imageInputRef={state.imageInputRef}
        onPickFile={state.handlePickFile}
        onDropFiles={state.handleDropFiles}
        pendingAttachments={state.pendingAttachments}
        onRemovePendingAttachment={(idx) =>
          state.setPendingAttachments((prev) => prev.filter((_, rowIdx) => rowIdx !== idx))
        }
        draft={state.draft}
        onDraftChange={state.setDraft}
        onSend={state.handleSend}
        sending={sending}
        isDraftConversation={state.isDraftConversation}
        companyMode={richMode}
        squadMode={squadMode}
        toAbsoluteUrl={state.toAbsoluteUrl}
        onOpenEmoji={state.handleOpenComposerEmoji}
        onInsertCode={state.handleInsertCode}
        onToggleRecording={state.toggleRecording}
        isRecording={state.isRecording}
        recordingSecs={state.recordingSecs}
        typingVisible={false}
        onPickGif={(url, label) => {
          state.setPendingAttachments((prev) => [
            ...prev,
            { name: `${label || 'gif'}.gif`, url, imageurl: url, type: 'image', kind: 'gif' },
          ]);
          state.showNotice('GIF attached.');
        }}
      />

      {state.chatNotice ? <div className="msgx-chat-notice">{state.chatNotice}</div> : null}
      {state.callModalType ? (
        <div className="msgx-call-backdrop" onClick={() => state.setCallModalType('')}>
          <div className="msgx-call-modal" onClick={(event) => event.stopPropagation()}>
            {state.callModalType === 'interview' ? (
              <>
                <h4>Schedule Interview</h4>
                <p>
                  Propose an interview slot with{' '}
                  <strong>{selectedMessage.from_user_name || selectedMessage.from_user_id || 'the candidate'}</strong>.
                  Confirm the time in chat to keep the hiring thread audit-ready.
                </p>
                <div className="msgx-call-actions">
                  <button
                    type="button"
                    onClick={() => {
                      state.showNotice('Interview request drafted — send timing details in chat to confirm.');
                      state.setCallModalType('');
                    }}
                  >
                    Draft in chat
                  </button>
                  <button type="button" onClick={() => state.setCallModalType('')}>Cancel</button>
                </div>
              </>
            ) : (
              <>
                <h4>{state.callModalType === 'audio' ? 'Start Voice Call' : 'Start Video Call'}</h4>
                <p>Direct telecom calling is not built in here. Standard chat products usually use browser-based WebRTC calling.</p>
                <div className="msgx-call-actions">
                  <button type="button" onClick={() => state.startBrowserCall(state.callModalType)}>Open Browser Call</button>
                  <button type="button" onClick={() => state.copyCallLink(state.callModalType)}>Copy Call Link</button>
                  <button type="button" onClick={() => state.setCallModalType('')}>Cancel</button>
                </div>
              </>
            )}
          </div>
        </div>
      ) : null}
      {state.composerEmojiOpen ? (
        <div
          ref={state.composerPickerRef}
          className="msgx-compose-emoji-float"
          style={{ left: `${Math.max(10, state.composerEmojiAnchor.x)}px`, top: `${Math.max(10, state.composerEmojiAnchor.y)}px` }}
        >
          <EmojiPicker
            width={300}
            height={360}
            onSelect={(emoji) => {
              state.appendToDraft(emoji);
              state.setComposerEmojiOpen(false);
            }}
          />
        </div>
      ) : null}
      {state.menuState.open ? (
        <div
          ref={state.menuRef}
          className="msgx-msg-menu"
          style={{ left: `${state.menuState.x}px`, top: `${state.menuState.y}px` }}
          onClick={(event) => event.stopPropagation()}
        >
          <div className="msgx-msg-react-row">
            {['👍', '❤️', '😂', '😮', '😢', '🙏'].map((emoji) => (
              <button
                key={emoji}
                type="button"
                onClick={() => {
                  state.setReaction(state.menuState.messageId, emoji);
                  state.setMenuState((prev) => ({ ...prev, open: false }));
                }}
              >
                {emoji}
              </button>
            ))}
            <button
              type="button"
              onClick={(event) => {
                const rect = event.currentTarget.getBoundingClientRect();
                state.setEmojiAnchor({ x: rect.left - 308, y: rect.bottom + 6 });
                state.setEmojiPickerFor((prev) => (prev === state.menuState.messageId ? '' : state.menuState.messageId));
              }}
            >
              +
            </button>
          </div>
          <div className="msgx-msg-menu-list">
            <button type="button" onClick={() => state.handleReplyToMessage(state.menuState.messageId)}>Reply</button>
            <button type="button" onClick={() => state.handleCopyMessage(state.menuState.messageId)}>Copy</button>
            <button type="button" onClick={() => state.handleContextAction('React')}>React</button>
            <button type="button" onClick={() => state.handleContextAction('Forward')}>Forward</button>
            <button type="button" onClick={() => state.handleContextAction('Pin')}>Pin</button>
            <button type="button" onClick={() => state.handleStarMessage(state.menuState.messageId)}>Star</button>
            <button type="button" onClick={() => state.handleContextAction('Report')}>Report</button>
            <button type="button" onClick={() => state.handleDeleteMessage(state.menuState.messageId)}>Delete</button>
          </div>
        </div>
      ) : null}
      {state.emojiPickerFor ? (
        <div
          ref={state.pickerRef}
          className="msgx-msg-emoji-float"
          style={{ left: `${Math.max(10, state.emojiAnchor.x)}px`, top: `${Math.max(10, state.emojiAnchor.y)}px` }}
        >
          <EmojiPicker
            width={300}
            height={360}
            onSelect={(emoji) => {
              state.setReaction(state.emojiPickerFor, emoji);
              state.setEmojiPickerFor('');
              state.setMenuState((prev) => ({ ...prev, open: false }));
            }}
          />
        </div>
      ) : null}
      {state.orderModalOpen ? (
        <div className="msgx-order-modal-backdrop" onClick={() => state.setOrderModalOpen(false)}>
          <div className="msgx-order-modal" onClick={(event) => event.stopPropagation()}>
            <h4>Order Details</h4>
            <p><strong>Order ID:</strong> {state.orderInfo.orderId || 'N/A'}</p>
            <p><strong>Title:</strong> {state.orderInfo.title}</p>
            <p><strong>Chat Type:</strong> {selectedMessage.chat_type || 'gig'}</p>
            <div className="msgx-order-modal-actions">
              <button type="button" onClick={() => state.openRelatedGigSurfaceFromModal()}>Open in Gigs Hub</button>
              <button type="button" onClick={() => state.setOrderModalOpen(false)}>Close</button>
            </div>
          </div>
        </div>
      ) : null}
    </section>
  );
};

export default ChatWindow;
