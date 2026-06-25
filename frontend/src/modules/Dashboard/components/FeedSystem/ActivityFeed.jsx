import React, { useMemo, useState } from 'react';
import PostItem from './PostItem';
import { normalizeFeedLabel } from './feedPostMedia';
import { filterTimelinePosts } from './feedTabFilters';
import { buildFeedRenderSequence } from './buildFeedRenderSequence';
import './activity-feed-mobile.css';
import './feed-home-spacing.css';

const FEED_TABS = ['All', 'Posts', 'Squad', 'Project', 'Win', 'Articles'];

const ActivityFeed = ({
  userData,
  posts = [],
  onItemDeleted,
  mobileWidgets = null,
}) => {
  const [activeFilter, setActiveFilter] = useState('All');
  const safePosts = useMemo(
    () => (Array.isArray(posts) ? posts.filter(Boolean) : []),
    [posts],
  );
  const filteredPosts = useMemo(
    () => filterTimelinePosts(safePosts, activeFilter),
    [safePosts, activeFilter],
  );

  const filterConfig = {
    All: { color: '#2563eb', glow: 'rgba(37, 99, 235, 0.16)' },
    Posts: { color: '#1d4ed8', glow: 'rgba(29, 78, 216, 0.16)' },
    Squad: { color: '#7c3aed', glow: 'rgba(124, 58, 237, 0.16)' },
    Project: { color: '#059669', glow: 'rgba(5, 150, 105, 0.16)' },
    Win: { color: '#d97706', glow: 'rgba(217, 119, 6, 0.16)' },
    Articles: { color: '#db2777', glow: 'rgba(219, 39, 119, 0.16)' },
  };

  const includeMobileWidgets = Boolean(mobileWidgets) && activeFilter === 'All';
  const feedSequence = useMemo(
    () => buildFeedRenderSequence(filteredPosts, includeMobileWidgets),
    [filteredPosts, includeMobileWidgets],
  );

  return (
    <div className="dash-activity-feed__shell">
      <div className="dash-activity-feed__filter-row" style={feedFilterRow}>
        <div className="dash-activity-feed__filters" style={filterTabs}>
          {FEED_TABS.map((tabName) => (
            <span
              key={tabName}
              className="dash-activity-feed__tab"
              onClick={() => setActiveFilter(tabName)}
              style={activeFilter === tabName ? activeTab(filterConfig[tabName]) : tab(filterConfig[tabName])}
            >
              {tabName === 'Articles' ? 'Article' : normalizeFeedLabel(tabName)}
            </span>
          ))}
        </div>
      </div>

      <div className="dash-activity-feed__list" style={postsList}>
        {safePosts.length > 0 && feedSequence.length > 0 ? (
          feedSequence.map((entry) => {
            if (entry.kind === 'post') {
              return (
                <PostItem
                  key={entry.key}
                  post={entry.post}
                  userData={userData}
                  onDeleted={onItemDeleted}
                />
              );
            }
            if (entry.kind === 'mobile_suggested_squads') {
              return <React.Fragment key={entry.key}>{mobileWidgets.suggestedSquads}</React.Fragment>;
            }
            if (entry.kind === 'mobile_people_you_may_know') {
              return <React.Fragment key={entry.key}>{mobileWidgets.peopleYouMayKnow}</React.Fragment>;
            }
            return null;
          })
        ) : (
          <div style={emptyState}>
            {safePosts.length > 0 && activeFilter !== 'All'
              ? `No ${activeFilter.toLowerCase()} posts yet.`
              : 'No activity yet.'}
          </div>
        )}
      </div>
    </div>
  );
};

const feedFilterRow = { display: 'flex', justifyContent: 'flex-start', alignItems: 'center', padding: '0 2px 6px', marginBottom: 0 };
const filterTabs = { display: 'flex', gap: '10px', flexWrap: 'wrap' };
const activeTab = (config) => ({ color: '#fff', background: config?.glow || 'rgba(59,130,246,0.16)', border: `1px solid ${config?.color || '#3b82f6'}`, boxShadow: `0 8px 20px ${config?.glow || 'rgba(59,130,246,0.16)'}`, padding: '8px 14px', borderRadius: '999px', fontSize: '13px', fontWeight: '700', cursor: 'pointer' });
const tab = (config) => ({ color: config?.color || '#94a3b8', background: 'rgba(255,255,255,0.03)', border: `1px solid ${config?.glow || 'rgba(255,255,255,0.06)'}`, padding: '8px 14px', borderRadius: '999px', fontSize: '13px', fontWeight: '700', cursor: 'pointer' });
const postsList = { display: 'flex', flexDirection: 'column', gap: '8px' };
const emptyState = { color: '#64748b', textAlign: 'center', padding: '40px' };

export default ActivityFeed;
