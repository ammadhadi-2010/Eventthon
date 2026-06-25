import React from 'react';
import CommentInput from './CommentInput';
import CommentList from './CommentList';
import { usePostComments } from './usePostComments';
import './comment-modal.css';

const PostComments = ({ postId, userData, comments = [], onCommentsChange, entityType = 'post', layout = 'inline' }) => {
  const state = usePostComments({ postId, userData, comments, onCommentsChange, entityType });

  if (layout === 'modal') {
    return (
      <div className="cm-modal-stack">
        <div className="cm-body">
          <CommentList
            comments={state.localComments}
            userData={state.userData}
            openMenuId={state.openMenuId}
            setOpenMenuId={state.setOpenMenuId}
            replyingToId={state.replyingToId}
            replyText={state.replyText}
            setReplyText={state.setReplyText}
            onLike={state.handleLike}
            onReplyStart={state.handleReply}
            onReplySubmit={state.handleReplySubmit}
            onMenuAction={state.handleCommentMenuAction}
            buildReplyKey={state.buildReplyKey}
          />
        </div>
        <CommentInput
          userData={state.userData}
          commentText={state.commentText}
          setCommentText={state.setCommentText}
          isSubmitting={state.isSubmitting}
          pickerOpen={state.pickerOpen}
          setPickerOpen={state.setPickerOpen}
          pickerTab={state.pickerTab}
          openPicker={state.openPicker}
          pendingStickers={state.pendingStickers}
          removePendingSticker={state.removePendingSticker}
          addWorkingSticker={state.addWorkingSticker}
          selectedImageName={state.selectedImageName}
          selectedImagePreview={state.selectedImagePreview}
          fileInputRef={state.fileInputRef}
          handleImageSelect={state.handleImageSelect}
          handleSubmit={state.handleSubmit}
        />
      </div>
    );
  }

  return (
    <div className="cm-inline-wrap">
      <CommentInput
        userData={state.userData}
        commentText={state.commentText}
        setCommentText={state.setCommentText}
        isSubmitting={state.isSubmitting}
        pickerOpen={state.pickerOpen}
        setPickerOpen={state.setPickerOpen}
        pickerTab={state.pickerTab}
        openPicker={state.openPicker}
        pendingStickers={state.pendingStickers}
        removePendingSticker={state.removePendingSticker}
        addWorkingSticker={state.addWorkingSticker}
        selectedImageName={state.selectedImageName}
        selectedImagePreview={state.selectedImagePreview}
        fileInputRef={state.fileInputRef}
        handleImageSelect={state.handleImageSelect}
        handleSubmit={state.handleSubmit}
      />
      <CommentList
        comments={state.localComments}
        userData={state.userData}
        openMenuId={state.openMenuId}
        setOpenMenuId={state.setOpenMenuId}
        replyingToId={state.replyingToId}
        replyText={state.replyText}
        setReplyText={state.setReplyText}
        onLike={state.handleLike}
        onReplyStart={state.handleReply}
        onReplySubmit={state.handleReplySubmit}
        onMenuAction={state.handleCommentMenuAction}
        buildReplyKey={state.buildReplyKey}
      />
    </div>
  );
};

export default PostComments;
