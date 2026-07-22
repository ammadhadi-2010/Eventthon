import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PostModal from '../../components/PostSystem/PostModal';
import { hardDeleteFeedItem } from '../../components/FeedSystem/feedDeleteApi';
import PostCardItem from './PostCardItem';
import ProfilePostsFilterTabs, { buildTabCounts } from './ProfilePostsFilterTabs';
import ProfilePostsHeader from './ProfilePostsHeader';
import useProfilePostsData from './useProfilePostsData';
import './profile-posts.css';

export default function ProfilePostsSection({ userData, variant = 'default' }) {
  const navigate = useNavigate();
  const isProfile = variant === 'profile';
  const {
    items,
    filteredItems,
    totalCount,
    loading,
    error,
    query,
    setQuery,
    activeTab,
    setActiveTab,
    reload,
    removeItem,
  } = useProfilePostsData(userData);

  const [postModalOpen, setPostModalOpen] = useState(false);
  const tabCounts = useMemo(() => buildTabCounts(items), [items]);

  const handleCardAction = async (actionKey, item) => {
    if (!item?.id) return;

    if (actionKey === 'view') {
      if (item.kind === 'article') navigate(`/article/view/${item.id}`);
      else navigate('/dashboard');
      return;
    }

    if (actionKey === 'edit') {
      if (item.kind === 'article') navigate(`/article/edit/${item.id}`);
      else setPostModalOpen(true);
      return;
    }

    if (actionKey === 'analytics') {
      window.alert('Analytics dashboard for this item is coming soon.');
      return;
    }

    if (actionKey === 'delete') {
      const label = item.title || 'this item';
      if (!window.confirm(`Permanently delete "${label}"?`)) return;
      try {
        await hardDeleteFeedItem(item.raw, userData);
        removeItem(item.id);
      } catch (err) {
        console.error('Delete failed:', err);
        window.alert(err?.message || 'Delete failed. Please try again.');
      }
    }
  };

  return (
    <section
      className={`pposts-section${isProfile ? ' pposts-section--profile' : ''}`}
      aria-label="My posts"
    >
      <ProfilePostsHeader
        totalCount={totalCount}
        query={query}
        onQueryChange={setQuery}
        onCreatePost={() => setPostModalOpen(true)}
        onWriteArticle={() => navigate('/article/new')}
      />

      <ProfilePostsFilterTabs activeTab={activeTab} onChange={setActiveTab} counts={tabCounts} />

      {loading ? <p className="pposts-state pposts-state--loading">Loading your posts…</p> : null}
      {error ? <p className="pposts-state pposts-state--error">{error}</p> : null}

      {!loading && !error && filteredItems.length === 0 ? (
        <div className="pposts-empty">
          <p className="pposts-empty__title">No posts found</p>
          <p className="pposts-empty__text">Create a post or write an article to see it here.</p>
        </div>
      ) : null}

      <ul className="pposts-list">
        {filteredItems.map((item) => (
          <li key={item.id}>
            <PostCardItem item={item} onAction={handleCardAction} />
          </li>
        ))}
      </ul>

      <PostModal
        isOpen={postModalOpen}
        onClose={() => setPostModalOpen(false)}
        type="POST"
        userData={userData}
        onSuccess={() => {
          setPostModalOpen(false);
          reload();
        }}
      />
    </section>
  );
}
