import React, { useState } from 'react';
import { FiBookOpen, FiShare2, FiTrendingUp } from 'react-icons/fi';
import { buildArticleShareUrl } from './articleContentUtils';
import { incrementArticleMetric } from './articleApi';
import ArticleViewRelatedPanel from './ArticleViewRelatedPanel';

export default function ArticleViewSidebar({ article, articleId, onArticleUpdate }) {
  const [shareNotice, setShareNotice] = useState('');

  const handleShare = async () => {
    const url = buildArticleShareUrl(articleId || article?._id);
    if (!url) return;
    try {
      await navigator.clipboard.writeText(url);
      setShareNotice('Link copied!');
      const updated = await incrementArticleMetric(articleId || article?._id, 'share');
      if (updated) onArticleUpdate?.(updated);
    } catch {
      setShareNotice('Copy failed — try again.');
    }
    window.setTimeout(() => setShareNotice(''), 2500);
  };

  const views = article?.metadata?.views ?? 0;
  const likes = article?.metadata?.likes ?? 0;
  const shares = article?.metadata?.shares ?? 0;

  return (
    <aside className="article-view__right-rail">
      <div className="article-view__side-card">
        <h4 className="article-view__side-title">Article Performance</h4>
        <div className="article-view__side-stat"><span>SEO Score</span><strong>{article.seo_score || 0}/100</strong></div>
        <div className="article-view__side-stat"><span>Word Count</span><strong>{article.word_count || 0}</strong></div>
        <div className="article-view__side-stat"><span>Reading Time</span><strong>{article.reading_time || 1} min</strong></div>
        <div className="article-view__side-stat"><span>Views</span><strong>{views}</strong></div>
        <div className="article-view__side-stat"><span>Likes</span><strong>{likes}</strong></div>
        <div className="article-view__side-stat"><span>Shares</span><strong>{shares}</strong></div>
      </div>

      <div className="article-view__side-card">
        <h4 className="article-view__side-title">Metadata</h4>
        <div className="article-view__tag-wrap">
          {(article.tags || []).map((tag) => (
            <span key={tag} className="article-view__tag-pill">{tag}</span>
          ))}
        </div>

        <ArticleViewRelatedPanel relatedContent={article.related_content} />

        <div className="article-view__side-action">
          <FiTrendingUp aria-hidden />
          Keyword: {article.primary_keyword || 'N/A'}
        </div>
        <button type="button" className="article-view__side-action-btn" onClick={handleShare}>
          <FiShare2 aria-hidden />
          Copy share link
        </button>
        {shareNotice ? <p className="article-view__share-notice">{shareNotice}</p> : null}
        <div className="article-view__side-action">
          <FiBookOpen aria-hidden />
          Slug: {article.slug || '—'}
        </div>
      </div>
    </aside>
  );
}
