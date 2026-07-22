import { useCallback, useEffect, useMemo, useState } from 'react';
import { fetchProfilePostsFeed } from './profilePostsApi';
import { filterProfilePosts, mergeProfilePosts } from './profilePostsUtils';

export default function useProfilePostsData(userData) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [query, setQuery] = useState('');
  const [activeTab, setActiveTab] = useState('all');

  const loadItems = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const { posts, articles } = await fetchProfilePostsFeed();
      setItems(mergeProfilePosts(posts, articles, userData));
    } catch (err) {
      console.error('Profile posts load failed:', err);
      setError('Could not load your posts. Please try again.');
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, [userData]);

  useEffect(() => {
    loadItems();
  }, [loadItems]);

  const filteredItems = useMemo(
    () => filterProfilePosts(items, { tab: activeTab, query }),
    [items, activeTab, query],
  );

  const removeItem = useCallback((itemId) => {
    setItems((prev) => prev.filter((row) => row.id !== itemId));
  }, []);

  return {
    items,
    filteredItems,
    totalCount: items.length,
    loading,
    error,
    query,
    setQuery,
    activeTab,
    setActiveTab,
    reload: loadItems,
    removeItem,
  };
}
