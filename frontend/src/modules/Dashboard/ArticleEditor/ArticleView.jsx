import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { FiArrowLeft, FiBookOpen, FiClock, FiEdit2, FiShare2, FiTrash2, FiTrendingUp } from 'react-icons/fi';
import ProfileCard from '../components/ProfileCard';
import WalletCard from '../components/WalletCard';
import { resolveDashboardMediaUrl } from '../utils/dashboardMedia';
import { deleteArticleById, fetchArticleById, incrementArticleMetric } from './articleApi';
import './article-view-mobile.css';

const ArticleView = ({ userData }) => {
  const { articleId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [article, setArticle] = useState(null);
  const [loading, setLoading] = useState(true);
  const returnTo = location.state?.returnTo;
  const isEditorPreview = Boolean(location.state?.livePreview?._previewFromEditor);

  useEffect(() => {
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

  const handleDelete = async () => {
    if (!window.confirm('Permanently delete this article?')) return;
    try {
      await deleteArticleById(articleId, userData);
      navigate('/article/list');
    } catch (error) {
      console.error('Delete failed:', error);
      alert(error?.response?.data?.detail || error?.message || 'Delete failed');
    }
  };

  const handleBack = () => {
    if (returnTo) {
      navigate(returnTo);
      return;
    }
    navigate('/article/list');
  };

  if (loading) return <div style={stateWrap}>Loading article...</div>;
  if (!article) return <div style={stateWrap}>Article not found.</div>;

  const coverSrc = resolveDashboardMediaUrl(article.imageurl || article.cover_image);

  return (
    <div className="article-view__page" style={pageWrap}>
      <div className="article-view__layout" style={layout}>
        <aside className="article-view__left-rail" style={leftColumn}>
          <ProfileCard userData={userData} />
          <WalletCard userData={userData} />
        </aside>

        <main className="article-view__main" style={centerColumn}>
          <div className="article-view__top-bar" style={topBar}>
            <button type="button" style={backBtn} onClick={handleBack}>
              <FiArrowLeft /> {isEditorPreview ? 'Back to Editor' : 'Back to Articles'}
            </button>
            {!isEditorPreview ? (
              <div className="article-view__top-actions" style={topActions}>
                <button type="button" style={editBtn} onClick={() => navigate(`/article/edit/${articleId}`)}>
                  <FiEdit2 /> Edit
                </button>
                <button type="button" style={deleteBtn} onClick={handleDelete}>
                  <FiTrash2 /> Delete
                </button>
              </div>
            ) : null}
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
            {coverSrc ? (
              <img
                className="article-view__cover"
                src={coverSrc}
                alt={article.title}
                style={coverImage}
              />
            ) : null}

            <div
              className="article-view__content"
              style={contentWrap}
              dangerouslySetInnerHTML={{ __html: article.content }}
            />
          </article>
        </main>

        <aside className="article-view__right-rail" style={rightColumn}>
          <div className="article-view__side-card" style={sideCard}>
            <h4 className="article-view__side-title" style={sideTitle}>Article Performance</h4>
            <div className="article-view__side-stat" style={sideStat}><span>SEO Score</span><strong>{article.seo_score || 0}/100</strong></div>
            <div className="article-view__side-stat" style={sideStat}><span>Word Count</span><strong>{article.word_count || 0}</strong></div>
            <div className="article-view__side-stat" style={sideStat}><span>Reading Time</span><strong>{article.reading_time || 1} min</strong></div>
          </div>
          <div className="article-view__side-card" style={sideCard}>
            <h4 className="article-view__side-title" style={sideTitle}>Metadata</h4>
            <div className="article-view__tag-wrap" style={tagWrap}>
              {(article.tags || []).map((tag) => (
                <span key={tag} className="article-view__tag-pill" style={tagPill}>{tag}</span>
              ))}
            </div>
            <div className="article-view__side-action" style={sideAction}><FiTrendingUp /> Keyword: {article.primary_keyword || 'N/A'}</div>
            <div className="article-view__side-action" style={sideAction}><FiShare2 /> Share-ready article</div>
            <div className="article-view__side-action" style={sideAction}><FiBookOpen /> Slug: {article.slug}</div>
          </div>
        </aside>
      </div>
    </div>
  );
};

const pageWrap = { background: '#020617', minHeight: '100vh', color: '#fff', padding: '20px' };
const layout = { display: 'grid', gridTemplateColumns: '280px 1fr 320px', gap: '24px', maxWidth: '1400px', margin: '0 auto' };
const leftColumn = { display: 'flex', flexDirection: 'column', gap: '20px' };
const centerColumn = { display: 'flex', flexDirection: 'column', gap: '16px' };
const rightColumn = { display: 'flex', flexDirection: 'column', gap: '16px' };
const topBar = { display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px' };
const backBtn = { background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', color: '#e2e8f0', borderRadius: '12px', padding: '12px 14px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: '700' };
const topActions = { display: 'flex', gap: '8px' };
const editBtn = { background: 'rgba(59,130,246,0.12)', border: '1px solid rgba(59,130,246,0.3)', color: '#93c5fd', borderRadius: '10px', padding: '10px 12px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', fontWeight: '700' };
const deleteBtn = { background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.3)', color: '#fca5a5', borderRadius: '10px', padding: '10px 12px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', fontWeight: '700' };
const articleCard = { background: 'rgba(15,23,42,0.68)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '24px', padding: '24px', boxShadow: '0 24px 60px rgba(2,6,23,0.35)' };
const heroMeta = { display: 'flex', gap: '8px', marginBottom: '14px' };
const pill = { background: 'rgba(59,130,246,0.12)', color: '#93c5fd', padding: '6px 10px', borderRadius: '999px', fontSize: '11px', fontWeight: '700' };
const statusPill = (status) => ({ background: status === 'published' ? 'rgba(16,185,129,0.12)' : 'rgba(245,158,11,0.12)', color: status === 'published' ? '#6ee7b7' : '#fcd34d', padding: '6px 10px', borderRadius: '999px', fontSize: '11px', fontWeight: '700' });
const title = { fontSize: '40px', lineHeight: '1.15', margin: '0 0 14px', fontWeight: '900' };
const metaLine = { color: '#94a3b8', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' };
const coverImage = { width: '100%', maxHeight: '360px', objectFit: 'cover', borderRadius: '18px', marginBottom: '22px' };
const contentWrap = { fontSize: '17px', lineHeight: '1.9', color: '#e2e8f0' };
const sideCard = { background: 'rgba(15,23,42,0.6)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '20px', padding: '20px' };
const sideTitle = { fontSize: '12px', color: '#64748b', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '16px' };
const sideStat = { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid rgba(255,255,255,0.05)', color: '#cbd5e1' };
const tagWrap = { display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '14px' };
const tagPill = { background: 'rgba(255,255,255,0.05)', color: '#cbd5e1', borderRadius: '999px', padding: '6px 10px', fontSize: '11px' };
const sideAction = { color: '#cbd5e1', fontSize: '13px', display: 'flex', gap: '8px', alignItems: 'center', padding: '10px 0' };
const stateWrap = { minHeight: '100vh', background: '#020617', color: '#cbd5e1', display: 'flex', alignItems: 'center', justifyContent: 'center' };

export default ArticleView;
