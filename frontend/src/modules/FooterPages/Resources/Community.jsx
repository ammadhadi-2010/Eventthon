import React, { useMemo, useState } from 'react';
import FooterPageShell from '../components/FooterPageShell';
import CommunityLeftNav from '../components/CommunityLeftNav';
import CommunityRightRail from '../components/CommunityRightRail';
import CommunityHubFeed from '../components/CommunityHubFeed';
import CommunityCreatePostModal from '../components/CommunityCreatePostModal';
import useResourcesFooterContent from '../hooks/useResourcesFooterContent';
import {
  COMMUNITY_ACTIONS,
  COMMUNITY_CATEGORIES,
  COMMUNITY_FOOTER_STATS,
  COMMUNITY_HIGHLIGHTS,
  COMMUNITY_NAV,
  COMMUNITY_STATS,
  COMMUNITY_SUBTITLE,
  FEATURED_DISCUSSIONS,
  TOP_MEMBERS,
  TRENDING_TOPICS,
  UPCOMING_EVENTS,
} from '../data/communityData';
import { readViewerAvatar } from '../utils/communityAvatar';
import '../styles/community.css';

export default function Community() {
  const { data, loading } = useResourcesFooterContent('Community');
  const [section, setSection] = useState('overview');
  const [createOpen, setCreateOpen] = useState(false);
  const [userPosts, setUserPosts] = useState([]);

  const subtitle = data?.subtitle || COMMUNITY_SUBTITLE;
  const discordUrl = data?.discordUrl || 'https://discord.com/invite/eventthon';
  const members = data?.topMembers?.length || data?.members?.length
    ? (data.topMembers || data.members)
    : TOP_MEMBERS;
  const baseDiscussions = data?.discussions?.length ? data.discussions : FEATURED_DISCUSSIONS;
  const discussions = useMemo(
    () => [...userPosts, ...baseDiscussions],
    [userPosts, baseDiscussions],
  );
  const trending = data?.trending?.length ? data.trending : TRENDING_TOPICS;
  const events = data?.events?.length ? data.events : UPCOMING_EVENTS;
  const actions = data?.actions?.length ? data.actions : COMMUNITY_ACTIONS;
  const categories = data?.categories?.length ? data.categories : COMMUNITY_CATEGORIES;
  const stats = data?.stats?.length ? data.stats : COMMUNITY_STATS;

  const onPublish = ({ title, summary, body, category }) => {
    const viewerAvatar = readViewerAvatar();
    setUserPosts((prev) => [
      {
        id: `user-${Date.now()}`,
        title,
        summary,
        body,
        replies: 0,
        icon: 'star',
        tone: 'violet',
        avatars: [viewerAvatar],
        category,
      },
      ...prev,
    ]);
    setCreateOpen(false);
    setSection('discussions');
    window.setTimeout(() => {
      document.getElementById('comm-discussions')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 80);
  };

  const onSelect = (id) => {
    setSection(id);
    const map = {
      events: 'comm-events',
      discussions: 'comm-discussions',
      announcements: 'comm-discussions',
      members: 'comm-categories',
    };
    const el = map[id];
    if (el) {
      window.setTimeout(() => {
        document.getElementById(el)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 40);
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <FooterPageShell
      variant="resources"
      leftSlot={(
        <CommunityLeftNav
          nav={COMMUNITY_NAV}
          activeId={section}
          stats={stats}
          discordUrl={discordUrl}
          onSelect={onSelect}
          onCreatePost={() => setCreateOpen(true)}
        />
      )}
      rightSlot={<CommunityRightRail members={members} highlights={COMMUNITY_HIGHLIGHTS} />}
    >
      {loading ? <p className="comm-empty">Loading community…</p> : null}
      <CommunityHubFeed
        subtitle={subtitle}
        actions={actions}
        discussions={discussions}
        categories={categories}
        trending={trending}
        events={events}
        footerStats={COMMUNITY_FOOTER_STATS}
        section={section}
        onSelectSection={onSelect}
      />
      <CommunityCreatePostModal
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        onPublish={onPublish}
        categories={categories}
      />
    </FooterPageShell>
  );
}
