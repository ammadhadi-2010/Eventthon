import { useEffect, useRef, useState } from 'react';
import axios from 'axios';
import { getAuthorAvatarForSubmit } from './commentIdentity';
import { buildReplyKey, getCommentApiRoute, getCommentsListRoute, normalizeComments } from './commentUtils';

export function usePostComments({ postId, userData, comments = [], onCommentsChange, entityType = 'post' }) {
  const [commentText, setCommentText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [localComments, setLocalComments] = useState(() => normalizeComments(comments));
  const [openMenuId, setOpenMenuId] = useState(null);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [pickerTab, setPickerTab] = useState('emoji');
  const [pendingStickers, setPendingStickers] = useState([]);
  const [selectedImageName, setSelectedImageName] = useState('');
  const [selectedImageFile, setSelectedImageFile] = useState(null);
  const [selectedImagePreview, setSelectedImagePreview] = useState('');
  const [replyingToId, setReplyingToId] = useState(null);
  const [replyText, setReplyText] = useState('');
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (entityType === 'article') return;
    setLocalComments(normalizeComments(comments));
  }, [comments, entityType]);

  useEffect(() => {
    const loadComments = async () => {
      if (entityType !== 'article') return;
      try {
        const res = await axios.get(getCommentsListRoute(entityType, postId));
        const next = normalizeComments(res?.data?.data || []);
        setLocalComments(next);
        onCommentsChange?.(next);
      } catch (err) {
        console.error('Article comments fetch error:', err);
      }
    };
    loadComments();
  }, [entityType, postId, onCommentsChange]);

  const openPicker = (tab) => {
    setPickerTab(tab);
    setPickerOpen(true);
  };

  const addWorkingSticker = (sticker) => {
    setPendingStickers((prev) => [
      ...prev,
      { ...sticker, uid: `${sticker.id}-${Date.now()}-${prev.length}` },
    ]);
  };

  const removePendingSticker = (uid) => {
    setPendingStickers((prev) => prev.filter((s) => s.uid !== uid));
  };

  const handleLike = (id) => {
    setLocalComments((prev) => {
      let likedNext = false;
      const next = prev.map((comment) => {
        if (comment.id !== id) return comment;
        const nextLiked = !comment.likedByMe;
        likedNext = nextLiked;
        return {
          ...comment,
          likedByMe: nextLiked,
          likes_count: Math.max(0, comment.likes_count + (nextLiked ? 1 : -1)),
        };
      });
      if (entityType === 'article') {
        const data = new FormData();
        data.append('liked', String(likedNext));
        axios.put(getCommentApiRoute(entityType, postId, 'like', id), data).catch(console.error);
      }
      return next;
    });
  };

  const handleReply = (commentId, name, parentReplyId = null) => {
    setReplyingToId(buildReplyKey(commentId, parentReplyId || 'root'));
    setReplyText(`@${name} `);
    setOpenMenuId(null);
  };

  const handleReplySubmit = async (commentId, parentReplyId = null) => {
    if (!replyText.trim()) return;
    const authorName = `${userData?.first_name || ''} ${userData?.last_name || ''}`.trim() || 'You';
    const payload = {
      text: replyText.trim(),
      userId: userData?._id,
      author_name: authorName,
      author_avatar_url: getAuthorAvatarForSubmit(userData),
      parent_reply_id: parentReplyId || undefined,
    };
    try {
      const res = await axios.post(getCommentApiRoute(entityType, postId, 'reply', commentId), payload);
      if (res.data.status === 'success') {
        const reply = res.data.reply || {
          id: `reply-${Date.now()}`,
          author_name: authorName,
          author_avatar_url: payload.author_avatar_url,
          text: payload.text,
        };
        setLocalComments((prev) => {
          const next = prev.map((comment) => {
            if (comment.id !== commentId) return comment;
            const existingReplies = Array.isArray(comment.replies) ? comment.replies : [];
            return { ...comment, replies: [...existingReplies, reply] };
          });
          onCommentsChange?.(next);
          return next;
        });
        setReplyText('');
        setReplyingToId(null);
      }
    } catch (err) {
      console.error('Reply error:', err);
    }
  };

  const handleCommentMenuAction = (action, commentId) => {
    if (action === 'copy') {
      const target = localComments.find((c) => c.id === commentId);
      if (target?.text) navigator.clipboard.writeText(target.text);
    }
    if (action === 'delete') {
      setLocalComments((prev) => {
        const next = prev.filter((c) => c.id !== commentId);
        onCommentsChange?.(next);
        return next;
      });
    }
    setOpenMenuId(null);
  };

  const handleImageSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setSelectedImageName(file.name);
    setSelectedImageFile(file);
    setSelectedImagePreview(URL.createObjectURL(file));
  };

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    const hasContent = commentText.trim() || selectedImageFile || pendingStickers.length > 0;
    if (!hasContent || isSubmitting) return;
    setIsSubmitting(true);
    try {
      const authorName = `${userData?.first_name || ''} ${userData?.last_name || ''}`.trim() || 'You';
      const data = new FormData();
      data.append('text', commentText);
      data.append('userId', String(userData?._id || ''));
      data.append('author_name', authorName);
      data.append('author_title', userData?.designation || 'Member');
      const avatarUrl = getAuthorAvatarForSubmit(userData);
      if (avatarUrl) data.append('author_avatar_url', avatarUrl);
      if (selectedImageFile) data.append('image', selectedImageFile);
      if (pendingStickers.length) {
        data.append(
          'working_stickers',
          JSON.stringify(pendingStickers.map(({ id, src, label }) => ({ id, src, label }))),
        );
      }

      const res = await axios.post(getCommentApiRoute(entityType, postId, 'comment'), data, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      if (res.data.status === 'success') {
        const saved = res.data.comment || {};
        const stickers = pendingStickers.map(({ id, src, label }) => ({ id, src, label }));
        const newC = {
          id: saved._id || `new-${Date.now()}`,
          author_name: saved.author_name || authorName,
          author_title: saved.author_title || userData?.designation || 'Member',
          author_avatar_url: saved.author_avatar_url || getAuthorAvatarForSubmit(userData),
          userId: userData?._id,
          text: saved.text || commentText,
          likes_count: saved.likes_count || 0,
          likedByMe: false,
          created_at: saved.created_at || new Date().toISOString(),
          image_url: saved.image_url || selectedImagePreview || null,
          working_stickers: saved.working_stickers || stickers,
        };
        const nextComments = [newC, ...localComments];
        setLocalComments(nextComments);
        onCommentsChange?.(nextComments);
        setCommentText('');
        setPendingStickers([]);
        setSelectedImageName('');
        setSelectedImageFile(null);
        setSelectedImagePreview('');
        setPickerOpen(false);
      }
    } catch (err) {
      console.error('Comment error:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    commentText,
    setCommentText,
    isSubmitting,
    localComments,
    openMenuId,
    setOpenMenuId,
    pickerOpen,
    setPickerOpen,
    pickerTab,
    openPicker,
    pendingStickers,
    removePendingSticker,
    addWorkingSticker,
    selectedImageName,
    selectedImagePreview,
    fileInputRef,
    handleImageSelect,
    handleSubmit,
    replyingToId,
    replyText,
    setReplyText,
    handleLike,
    handleReply,
    handleReplySubmit,
    handleCommentMenuAction,
    buildReplyKey,
    userData,
  };
}
