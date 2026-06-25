import React, { useState } from 'react';
import {
  FiGlobe, FiAward, FiUsers, FiPlusCircle, FiFileText,
} from 'react-icons/fi';
import EventThonBadge from '../../../../components/EventThonBadge';
import { rankCodeToBadgeProps } from '../../../../components/badgeTierProps';
import EventThonLogo from '../../../../components/brand/EventThonLogo';
import PostActions from './PostActions';
import PostAuthorAvatar from './PostAuthorAvatar';
import PostMediaBlock from './PostMediaBlock';
import PostExpandableText from './PostExpandableText';
import PostArticleHeading from './PostArticleHeading';
import PostHeaderControls from './PostHeaderControls';
import PostAuthorRankBadge from './PostAuthorRankBadge';
import { resolveAuthorRankMeta } from './postAuthorRank';
import {
  getPostMediaItems,
  normalizeFeedLabel,
  sanitizeFeedPostText,
} from './feedPostMedia';
import './post-item.css';

const PostItem = ({ post, userData, onDeleted }) => {
  const [dismissed, setDismissed] = useState(false);
  const mediaItems = getPostMediaItems(post);
  const displayContent = sanitizeFeedPostText(post.content);
  const isArticle = post.post_type === 'ARTICLE';
  const rankMeta = resolveAuthorRankMeta(post, userData);
  const badgeProps = rankCodeToBadgeProps(rankMeta.code, { label: rankMeta.label });
  const authorName = post.author_name || 'EventThon Member';

  const getPostTypeDetails = (type) => {
    switch (type) {
      case 'ARTICLE':
        return { icon: <FiFileText size={12} />, color: '#ec4899', label: 'Article', glow: 'rgba(236, 72, 153, 0.05)' };
      case 'WIN':
        return { icon: <FiAward size={12} />, color: '#f59e0b', label: 'Achievement', glow: 'rgba(245, 158, 11, 0.05)' };
      case 'SQUAD':
        return { icon: <FiUsers size={12} />, color: '#a855f7', label: 'Squad Ask', glow: 'rgba(168, 85, 247, 0.05)' };
      case 'PROJECT':
        return { icon: <FiPlusCircle size={12} />, color: '#10b981', label: 'New Project', glow: 'rgba(16, 185, 129, 0.05)' };
      default:
        return { icon: <FiGlobe size={12} />, color: '#3b82f6', label: 'Update', glow: 'transparent' };
    }
  };

  const typeConfig = getPostTypeDetails(post.post_type);
  const articleTitle = String(post.article_title || '').trim();
  const previewText = isArticle
    ? [articleTitle, displayContent].filter(Boolean).join('\n')
    : displayContent;

  if (dismissed) return null;

  return (
    <div
      className="feed-post-card"
      style={{ borderTop: `2px solid ${typeConfig.color}`, background: typeConfig.glow || undefined }}
    >
      <div className="feed-post-header">
        <PostAuthorAvatar post={post} userData={userData} borderColor={typeConfig.color} />
        <div className="feed-post-header__main">
          <h4 className="feed-post-header__name-row">
            <span className="feed-post-header__name">{authorName}</span>
            <EventThonBadge
              tier={badgeProps.tier}
              label={badgeProps.label}
              variant="sm"
              imgClassName="et-rank-badge-img feed-post-header__rank-badge"
            />
            <EventThonLogo variant="feed" />
          </h4>
          <div className="feed-post-header__meta-row">
            <p className="feed-post-header__title">{post.author_title || 'Developer'}</p>
            <PostAuthorRankBadge rankMeta={rankMeta} />
          </div>
          <p className="feed-post-header__time">
            Just now • <FiGlobe size={10} />
            <span className="feed-post-header__type" style={{ color: typeConfig.color }}>
              {typeConfig.icon} {normalizeFeedLabel(typeConfig.label)}
            </span>
          </p>
        </div>
        <PostHeaderControls
          postId={post._id}
          postType={post.post_type || 'POST'}
          onDeleted={onDeleted}
          userData={userData}
          onDismiss={() => setDismissed(true)}
          authorName={authorName}
        />
      </div>

      <div className="feed-post-content">
        {isArticle ? (
          <>
            <PostArticleHeading title={post.article_title} />
            <PostExpandableText text={displayContent} lineClamp={3} />
          </>
        ) : (
          <PostExpandableText text={displayContent} lineClamp={3} />
        )}
        <PostMediaBlock items={mediaItems} />
      </div>

      <PostActions
        postId={post._id}
        initialLikes={post.likes_count || 0}
        initialComments={post.comments || []}
        initialCommentsCount={post.comments_count || (post.comments ? post.comments.length : 0)}
        initialSendCount={post.send_count || 0}
        initialViewsCount={post.views_count || 0}
        userData={userData}
        postContent={previewText}
        postAuthor={authorName}
        localOnly={isArticle}
        sharePath={isArticle ? `${window.location.origin}/article/view/${post._id}` : ''}
        entityLabel={isArticle ? 'Article' : 'Post'}
        entityType={isArticle ? 'article' : 'post'}
      />
    </div>
  );
};

export default PostItem;
