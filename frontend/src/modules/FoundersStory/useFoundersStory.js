import { useCallback, useEffect, useState } from 'react';
import {
  fetchFoundersStory,
  postFoundersStoryComment,
  toggleFoundersStoryLike,
} from './foundersStoryApi';
import { getFoundersStoryVisitorId, resolveCommentAuthorName } from './foundersStoryVisitor';

export default function useFoundersStory(userData) {
  const [content, setContent] = useState('');
  const [likesCount, setLikesCount] = useState(0);
  const [liked, setLiked] = useState(false);
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [likeBusy, setLikeBusy] = useState(false);
  const [commentBusy, setCommentBusy] = useState(false);

  const visitorId = getFoundersStoryVisitorId();

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const data = await fetchFoundersStory(visitorId);
      setContent(data.content || '');
      setLikesCount(Number(data.likes_count) || 0);
      setLiked(Boolean(data.liked));
      setComments(Array.isArray(data.comments) ? data.comments : []);
    } catch (e) {
      setError(e?.response?.data?.detail || e?.message || 'Could not load the story.');
    } finally {
      setLoading(false);
    }
  }, [visitorId]);

  useEffect(() => {
    load();
  }, [load]);

  const onLike = async () => {
    if (likeBusy) return;
    setLikeBusy(true);
    try {
      const result = await toggleFoundersStoryLike(visitorId);
      setLikesCount(Number(result.likes_count) || 0);
      setLiked(Boolean(result.liked));
    } catch (e) {
      setError(e?.response?.data?.detail || e?.message || 'Like action failed.');
    } finally {
      setLikeBusy(false);
    }
  };

  const onComment = async (text, authorName) => {
    const trimmed = String(text || '').trim();
    if (!trimmed || commentBusy) return false;
    const name = String(authorName || resolveCommentAuthorName(userData) || 'Guest').trim();
    setCommentBusy(true);
    setError('');
    try {
      const result = await postFoundersStoryComment({
        author_name: name || 'Guest',
        text: trimmed,
        visitor_id: visitorId,
      });
      if (result?.comment) {
        setComments((prev) => [result.comment, ...prev]);
      }
      if (typeof result?.likes_count === 'number') {
        setLikesCount(result.likes_count);
      }
      return true;
    } catch (e) {
      setError(e?.response?.data?.detail || e?.message || 'Could not post comment.');
      return false;
    } finally {
      setCommentBusy(false);
    }
  };

  return {
    content,
    likesCount,
    liked,
    comments,
    loading,
    error,
    likeBusy,
    commentBusy,
    onLike,
    onComment,
    reload: load,
  };
}
