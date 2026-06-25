import React, { useCallback, useEffect, useState } from 'react';
import PostItem from '../../../components/FeedSystem/PostItem';
import { fetchSquadFeedPosts } from '../../api/squadActivityPostsApi';
import { readSquadFeedCache, writeSquadFeedCache } from './squadFeedCache';

export default function SquadActivityFeed({ squadId, userData, isActive = true }) {
  const cached = squadId ? readSquadFeedCache(squadId) : null;
  const [posts, setPosts] = useState(cached || []);
  const [loading, setLoading] = useState(!cached?.length);

  const loadFeed = useCallback(async (showSpinner = false) => {
    if (!squadId) {
      setPosts([]);
      setLoading(false);
      return;
    }
    if (showSpinner && !readSquadFeedCache(squadId)?.length) {
      setLoading(true);
    }
    try {
      const rows = await fetchSquadFeedPosts(squadId);
      const safeRows = Array.isArray(rows) ? rows : [];
      writeSquadFeedCache(squadId, safeRows);
      setPosts(safeRows);
    } catch (err) {
      console.error('Squad feed load failed:', err);
      if (!readSquadFeedCache(squadId)?.length) setPosts([]);
    } finally {
      setLoading(false);
    }
  }, [squadId]);

  useEffect(() => {
    if (!isActive || !squadId) return undefined;
    const hasCache = Boolean(readSquadFeedCache(squadId)?.length);
    loadFeed(!hasCache);
    return undefined;
  }, [isActive, squadId, loadFeed]);

  const handleDeleted = (postId) => {
    setPosts((prev) => {
      const next = prev.filter((row) => row._id !== postId);
      writeSquadFeedCache(squadId, next);
      return next;
    });
  };

  if (loading && !posts.length) {
    return <div style={emptyState}>Loading squad activity feed...</div>;
  }

  if (!posts.length) {
    return (
      <div style={emptyState}>
        No squad posts yet. Share a Squad update from the home feed to start activity here.
      </div>
    );
  }

  return (
    <div style={list}>
      {loading ? <div style={refreshHint}>Refreshing feed...</div> : null}
      {posts.map((post) => (
        <PostItem
          key={post._id || post.id}
          post={post}
          userData={userData}
          onDeleted={handleDeleted}
        />
      ))}
    </div>
  );
}

const list = { display: 'flex', flexDirection: 'column', gap: '12px' };
const refreshHint = {
  color: '#64748b',
  fontSize: '12px',
  fontWeight: '600',
  textAlign: 'right',
  padding: '0 4px',
};
const emptyState = {
  color: '#64748b',
  textAlign: 'center',
  padding: '48px 20px',
  fontSize: '14px',
  fontWeight: '600',
  borderRadius: '14px',
  border: '1px dashed rgba(148,163,184,0.25)',
  background: 'rgba(15,23,42,0.35)',
};
