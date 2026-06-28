import API from '../../../../api/axiosConfig';
import React, { useEffect, useRef, useState } from 'react';
import { FiThumbsUp, FiMessageSquare, FiRepeat, FiSend } from 'react-icons/fi';
import CommentModal from './CommentModal';
import RepostMenu from '../Global/RepostMenu';
import RepostThoughtModal from '../Global/RepostThoughtModal';
import SendPostModal from '../Global/SendPostModal';
import PostActionsStats from './PostActionsStats';
import { incrementArticleMetric } from '../../ArticleEditor/articleApi';
import './post-actions.css';

const PostActions = ({
  postId,
  initialLikes = 0,
  initialComments = [],
  initialCommentsCount = 0,
  initialSendCount = 0,
  initialViewsCount = 0,
  userData,
  postContent = '',
  postAuthor = '',
  localOnly = false,
  sharePath = '',
  entityLabel = 'post',
  entityType = 'post',
}) => {
  const [liked, setLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(initialLikes);
  const [comments, setComments] = useState(initialComments);
  const [commentsCount, setCommentsCount] = useState(initialCommentsCount || initialComments.length);
  const [showComments, setShowComments] = useState(false);
  const [showRepostMenu, setShowRepostMenu] = useState(false);
  const [showThoughtModal, setShowThoughtModal] = useState(false);
  const [repostText, setRepostText] = useState('');
  const [sendCount, setSendCount] = useState(initialSendCount);
  const [viewCount] = useState(initialViewsCount);
  const [showSendModal, setShowSendModal] = useState(false);
  const [sendTargets, setSendTargets] = useState([]);
  const [selectedSendIds, setSelectedSendIds] = useState([]);
  const [sendSearch, setSendSearch] = useState('');
  const repostWrapRef = useRef(null);

  useEffect(() => {
    setComments(initialComments || []);
    setCommentsCount(initialCommentsCount || (initialComments ? initialComments.length : 0));
  }, [initialComments, initialCommentsCount]);

  useEffect(() => {
    const closeOnOutside = (event) => {
      if (repostWrapRef.current && !repostWrapRef.current.contains(event.target)) {
        setShowRepostMenu(false);
      }
    };
    document.addEventListener('mousedown', closeOnOutside);
    return () => document.removeEventListener('mousedown', closeOnOutside);
  }, []);

  const handleLike = async () => {
    const isCurrentlyLiked = liked;
    setLiked(!isCurrentlyLiked);
    setLikesCount((prev) => (isCurrentlyLiked ? prev - 1 : prev + 1));

    if (localOnly) {
      try {
        await incrementArticleMetric(postId, 'like');
      } catch (error) {
        console.error('Article like metric failed:', error);
      }
      return;
    }

    try {
      await API.put(`/api/posts/like/${postId}`);
    } catch (error) {
      console.error('Like update failed:', error);
      setLiked(isCurrentlyLiked);
      setLikesCount(initialLikes);
    }
  };

  const handleRepost = async (caption = '') => {
    if (localOnly) {
      setShowRepostMenu(false);
      setShowThoughtModal(false);
      setRepostText('');
      try {
        await incrementArticleMetric(postId, 'share');
      } catch (error) {
        console.error('Article share metric failed:', error);
      }
      return;
    }

    try {
      const response = await API.post(`/api/posts/${postId}/repost`, {
        user_id: String(userData?._id),
        caption,
      });
      if (response.data.status === 'success') {
        setShowRepostMenu(false);
        setShowThoughtModal(false);
        setRepostText('');
        window.location.reload();
      }
    } catch (error) {
      console.error('Repost API error:', error);
    }
  };

  const handleSend = () => {
    const postUrl = sharePath || `${window.location.origin}/post/${postId}`;
    navigator.clipboard.writeText(postUrl);
    if (localOnly) {
      setSendCount((prev) => prev + 1);
      incrementArticleMetric(postId, 'send').catch((error) => console.error('Article send metric failed:', error));
    }
    alert(`${entityLabel} link copied to clipboard!`);
  };

  const loadSendTargets = async (queryText = '') => {
    try {
      const response = await API.get('/api/posts/send-targets', {
        params: { query: queryText, limit: 80 },
      });
      if (response.data.status === 'success') setSendTargets(response.data.data || []);
    } catch (error) {
      console.error('Send targets load error:', error);
    }
  };

  const openSendModal = () => {
    setShowSendModal(true);
    if (!localOnly) loadSendTargets('');
  };

  const handleSendToUsers = async () => {
    if (localOnly) {
      setSendCount((prev) => prev + Math.max(selectedSendIds.length, 1));
      setShowSendModal(false);
      setSelectedSendIds([]);
      return;
    }

    try {
      const response = await API.post(`/api/posts/${postId}/send`, {
        sender_id: String(userData?._id),
        recipient_ids: selectedSendIds,
      });
      if (response.data.status === 'success') {
        setSendCount((prev) => prev + (response.data.sent_count || 0));
        setShowSendModal(false);
        setSelectedSendIds([]);
      }
    } catch (error) {
      console.error('Send post error:', error);
    }
  };

  return (
    <div className="post-actions__container">
      <PostActionsStats
        likesCount={likesCount}
        commentsCount={commentsCount}
        sendCount={sendCount}
        viewCount={viewCount}
      />

      <div className="post-actions__buttons-row">
        <button
          type="button"
          onClick={handleLike}
          className={`post-actions__btn${liked ? ' post-actions__btn--liked' : ''}`}
        >
          <FiThumbsUp style={{ fill: liked ? '#3b82f6' : 'none' }} size={18} />
          <span>Like</span>
        </button>

        <button type="button" onClick={() => setShowComments(true)} className="post-actions__btn">
          <FiMessageSquare size={18} />
          <span>Comment</span>
        </button>

        <div className="post-actions__repost-wrap" ref={repostWrapRef}>
          <button type="button" onClick={() => setShowRepostMenu((prev) => !prev)} className="post-actions__btn">
            <FiRepeat size={18} />
            <span>Repost</span>
          </button>
          <RepostMenu
            isOpen={showRepostMenu}
            onQuickRepost={() => handleRepost('')}
            onRepostWithThoughts={() => {
              setShowRepostMenu(false);
              setShowThoughtModal(true);
            }}
          />
        </div>

        <button type="button" onClick={openSendModal} className="post-actions__btn">
          <FiSend size={18} />
          <span>Send</span>
        </button>
      </div>

      <CommentModal
        isOpen={showComments}
        onClose={() => setShowComments(false)}
        postId={postId}
        userData={userData}
        comments={comments}
        likesCount={likesCount}
        commentsCount={commentsCount}
        entityType={entityType}
        onCommentsChange={(nextComments) => {
          setComments(nextComments);
          setCommentsCount(nextComments.length);
        }}
      />
      <RepostThoughtModal
        isOpen={showThoughtModal}
        onClose={() => setShowThoughtModal(false)}
        value={repostText}
        onChange={setRepostText}
        onSubmit={() => handleRepost(repostText)}
        previewText={postContent}
        authorName={postAuthor}
      />
      <SendPostModal
        isOpen={showSendModal}
        onClose={() => setShowSendModal(false)}
        users={sendTargets}
        selectedIds={selectedSendIds}
        search={sendSearch}
        onSearchChange={(value) => {
          setSendSearch(value);
          loadSendTargets(value);
        }}
        onToggleUser={(id) =>
          setSelectedSendIds((prev) => (prev.includes(id) ? prev.filter((value) => value !== id) : [...prev, id]))
        }
        onSend={handleSendToUsers}
        onCopyLink={handleSend}
      />
    </div>
  );
};

export default PostActions;
