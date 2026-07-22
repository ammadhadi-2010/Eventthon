import React, { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { FiClock } from 'react-icons/fi';
import ProfileCard from '../components/ProfileCard';
import WalletCard from '../components/WalletCard';
import { belongsToCurrentUser } from '../accountHub/profilePosts/profilePostsUtils';
import { resolveDashboardMediaUrl } from '../utils/dashboardMedia';
import { deleteArticleById, fetchArticleById, incrementArticleMetric } from './articleApi';
import { resolveArticleHtmlContent } from './articleContentUtils';
import ArticleViewBreadcrumb from './ArticleViewBreadcrumb';
import ArticleViewSidebar from './ArticleViewSidebar';
import ArticleViewTopActions from './ArticleViewTopActions';
import './article-view-shared.css';
import './article-view-mobile.css';

const ArticleView = ({ userData }) => {
  const { articleId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [article, setArticle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [coverBroken, setCoverBroken] = useState(false);
  const isEditorPreview = Boolean(location.state?.livePreview?._previewFromEditor);

  useEffect(() => {
    setCoverBroken(false);
    const livePreview = location.state?.livePreview;
    if (livePreview) {
      setArticle(livePreview);
      setLoading(false);
      return undefined;
    }

    if (!articleId) {
      setLoading(false);
      return undefined;
    }

    const load = async () => {
      try {
        const data = await fetchArticleById(articleId);
        setArticle(data);
        if (data?._id) {
          const updated = await incrementArticleMetric(data._id, 'view');
          if (updated) setArticle(updated);
        }
      } catch (error) {
        console.error('Article view load failed:', error);
      } finally {
        setLoading(false);
      }
    };
    load();
    return undefined;
  }, [articleId, location.key]);

  const canManage = !isEditorPreview && belongsToCurrentUser(article || {}, userData);
  const resolvedContent = useMemo(
    () => resolveArticleHtmlContent(article?.content || ''),
    [article?.content],
  );
  const coverSrc = resolveDashboardMediaUrl(article?.imageurl || article?.cover_image);
  const showCoverFallback = Boolean(coverSrc && coverBroken);

  const handleDelete = async () => {
    if (!window.confirm('Permanently delete this article?')) return;
    try {
      await deleteArticleById(articleId, userData);
      navigate('/article');
    } catch (error) {
      console.error('Delete failed:', error);
      alert(error?.response?.data?.detail || error?.message || 'Delete failed');
    }
  };

  if (loading) return <div style={stateWrap}>Loading article...</div>;
  if (!article) return <div style={stateWrap}>Article not found.</div>;

  return (
    <div className="article-view__page" style={pageWrap}>
      <div className="article-view__layout" style={layout}>
        <aside className="article-view__left-rail" style={leftColumn}>
          <ProfileCard userData={userData} />
          <WalletCard userData={userData} />
        </aside>

        <main className="article-view__main" style={centerColumn}>
          <div className="article-view__top-bar" style={topBar}>
            <ArticleViewBreadcrumb
              title={article.title}
              isPreview={isEditorPreview}
              editPath={articleId ? `/article/edit/${articleId}` : ''}
            />
            <ArticleViewTopActions
              articleId={articleId}
              canManage={canManage}
              onDelete={handleDelete}
            />
          </div>

          <article className="article-view__card" style={articleCard}>
            <div className="article-view__hero-meta" style={heroMeta}>
              <span style={pill}>{article.category || 'General'}</span>
              <span style={statusPill(article.status)}>{article.status || 'draft'}</span>
            </div>
            <h1 className="article-view__title" style={title}>{article.title}</h1>
            <p className="article-view__meta-line" style={metaLine}>
              {article.author_name} • <FiClock style={{ display: 'inline' }} /> {article.reading_time || 1} min read
            </p>
            {coverSrc && !coverBroken ? (
              <img
                className="article-view__cover"
                src={coverSrc}
                alt={article.title}
                style={coverImage}
                onError={() => setCoverBroken(true)}
              />
            ) : null}
            {showCoverFallback ? <div className="article-view__cover-fallback" aria-hidden /> : null}

            <div
              className="article-view__content"
              style={contentWrap}
              dangerouslySetInnerHTML={{ __html: resolvedContent }}
            />
          </article>
        </main>

        <ArticleViewSidebar
          article={article}
          articleId={articleId || article._id}
          onArticleUpdate={setArticle}
        />
      </div>
    </div>
  );
};

const pageWrap = { background: '#020617', minHeight: '100vh', color: '#fff', padding: '20px' };
const layout = { display: 'grid', gridTemplateColumns: '280px 1fr 320px', gap: '24px', maxWidth: '1400px', margin: '0 auto' };
const leftColumn = { display: 'flex', flexDirection: 'column', gap: '20px' };
const centerColumn = { display: 'flex', flexDirection: 'column', gap: '16px' };
const topBar = { display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px' };
const articleCard = { background: 'rgba(15,23,42,0.68)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '24px', padding: '24px', boxShadow: '0 24px 60px rgba(2,6,23,0.35)' };
const heroMeta = { display: 'flex', gap: '8px', marginBottom: '14px' };
const pill = { background: 'rgba(59,130,246,0.12)', color: '#93c5fd', padding: '6px 10px', borderRadius: '999px', fontSize: '11px', fontWeight: '700' };
const statusPill = (status) => ({ background: status === 'published' ? 'rgba(16,185,129,0.12)' : 'rgba(245,158,11,0.12)', color: status === 'published' ? '#6ee7b7' : '#fcd34d', padding: '6px 10px', borderRadius: '999px', fontSize: '11px', fontWeight: '700' });
const title = { fontSize: '40px', lineHeight: '1.15', margin: '0 0 14px', fontWeight: '900' };
const metaLine = { color: '#94a3b8', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' };
const coverImage = { width: '100%', maxHeight: '360px', objectFit: 'cover', borderRadius: '18px', marginBottom: '22px' };
const contentWrap = { fontSize: '17px', lineHeight: '1.9', color: '#e2e8f0' };
const stateWrap = { minHeight: '100vh', background: '#020617', color: '#cbd5e1', display: 'flex', alignItems: 'center', justifyContent: 'center' };

export default ArticleView;
