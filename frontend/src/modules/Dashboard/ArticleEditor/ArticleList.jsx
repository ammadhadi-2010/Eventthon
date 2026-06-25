import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiArrowRight, FiBookOpen, FiClock, FiEdit2, FiEye, FiSearch, FiTrash2 } from 'react-icons/fi';
import ProfileCard from '../components/ProfileCard';
import WalletCard from '../components/WalletCard';
import { resolveDashboardMediaUrl } from '../utils/dashboardMedia';
import { deleteArticleById, fetchArticles } from './articleApi';
import { ARTICLE_CATEGORIES } from './articleCategories';

const normalizeTitle = (title) =>
  String(title || '')
    .trim()
    .replace(/^artucle$/i, 'Article');

const ArticleList = ({ userData }) => {
  const navigate = useNavigate();
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const loadArticles = async () => {
    try {
      const data = await fetchArticles();
      setArticles(data);
    } catch (error) {
      console.error('Article list load failed:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadArticles();
  }, []);

  const filteredArticles = useMemo(() => {
    const term = query.trim().toLowerCase();
    const statusMatched = statusFilter === 'all' ? articles : articles.filter((item) => (item.status || 'draft') === statusFilter);
    if (!term) return statusMatched;
    return statusMatched.filter((article) =>
      [article.title, article.author_name, article.category, article.primary_keyword]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(term))
    );
  }, [articles, query, statusFilter]);

  const handleDelete = async (articleId, articleTitle) => {
    const label = normalizeTitle(articleTitle) || 'this article';
    if (!window.confirm(`Permanently delete "${label}"? This cannot be undone.`)) return;
    try {
      await deleteArticleById(articleId, userData);
      setArticles((prev) => prev.filter((item) => item._id !== articleId));
    } catch (error) {
      console.error('Delete article failed:', error);
      const msg = error?.response?.data?.detail || error?.message || 'Delete failed';
      alert(msg);
    }
  };

  return (
    <div style={pageWrap}>
      <div style={layout}>
        <aside style={leftColumn}>
          <ProfileCard userData={userData} />
          <WalletCard userData={userData} />
        </aside>

        <main style={centerColumn}>
          <section style={heroCard}>
            <div>
              <div style={heroIcon}><FiBookOpen /></div>
              <h1 style={heroTitle}>Article Library</h1>
              <p style={heroText}>Explore premium articles, SEO playbooks, and content systems built for EventThon Network.</p>
            </div>
            <button style={heroBtn} onClick={() => navigate('/article/new')}>Write New Article</button>
          </section>

          <section style={searchCard}>
            <FiSearch color="#94a3b8" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search title, author, keyword..."
              style={searchInput}
            />
          </section>
          <section style={statusTabsRow}>
            {[
              { key: 'all', label: `All (${articles.length})` },
              { key: 'published', label: `Published (${articles.filter((a) => a.status === 'published').length})` },
              { key: 'draft', label: `Drafts (${articles.filter((a) => a.status !== 'published').length})` },
            ].map((item) => (
              <button key={item.key} style={statusFilter === item.key ? statusActiveBtn : statusBtn} onClick={() => setStatusFilter(item.key)}>
                {item.label}
              </button>
            ))}
          </section>

          {loading ? (
            <div style={emptyCard}>Loading articles...</div>
          ) : filteredArticles.length === 0 ? (
            <div style={emptyCard}>No articles found.</div>
          ) : (
            <div style={articleGrid}>
              {filteredArticles.map((article) => {
                const coverSrc = resolveDashboardMediaUrl(article.imageurl || article.cover_image);
                const displayTitle = normalizeTitle(article.title);
                return (
                <article key={article._id} style={articleCard} onClick={() => navigate(`/article/view/${article._id}`)}>
                  <div style={articleThumb}>
                    {coverSrc ? (
                      <img src={coverSrc} alt={displayTitle} style={articleImage} onError={(e) => { e.target.style.display = 'none'; }} />
                    ) : (
                      <div style={articleGradient} />
                    )}
                  </div>
                  <div style={articleBody}>
                    <div style={articleMetaTop}>
                      <span style={pill}>{article.category || 'General'}</span>
                      <span style={statusPill(article.status)}>{article.status || 'draft'}</span>
                    </div>
                    <h3 style={articleTitle}>{displayTitle}</h3>
                    <p style={articleExcerpt}>{article.excerpt || 'No excerpt available.'}</p>
                    <div style={articleMetaBottom}>
                      <span><FiClock /> {article.reading_time || 1} min</span>
                      <span><FiEye /> {article.metadata?.views || 0}</span>
                    </div>
                    <button style={openBtn}>
                      Open Article <FiArrowRight />
                    </button>
                    <div style={cardActions}>
                      <button
                        style={editBtn}
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/article/edit/${article._id}`);
                        }}
                      >
                        <FiEdit2 /> Edit
                      </button>
                      <button
                        style={deleteBtn}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(article._id, article.title);
                        }}
                      >
                        <FiTrash2 /> Delete
                      </button>
                    </div>
                  </div>
                </article>
              );
              })}
            </div>
          )}
        </main>

        <aside style={rightColumn}>
          <div style={sideCard}>
            <h4 style={sideTitle}>Publishing Pulse</h4>
            <div style={sideStat}><span>Total Articles</span><strong>{articles.length}</strong></div>
            <div style={sideStat}><span>Published</span><strong>{articles.filter((a) => a.status === 'published').length}</strong></div>
            <div style={sideStat}><span>Drafts</span><strong>{articles.filter((a) => a.status === 'draft').length}</strong></div>
          </div>
          <div style={sideCard}>
            <h4 style={sideTitle}>Top Categories</h4>
            {ARTICLE_CATEGORIES.slice(0, 8).map((item) => (
              <div key={item} style={categoryRow}>{item}</div>
            ))}
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
const heroCard = { background: 'rgba(15,23,42,0.72)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '24px', padding: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '20px' };
const heroIcon = { width: '48px', height: '48px', borderRadius: '14px', background: 'linear-gradient(135deg,#4f46e5,#7c3aed)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '12px' };
const heroTitle = { margin: 0, fontSize: '30px', fontWeight: '800' };
const heroText = { margin: '8px 0 0', color: '#94a3b8', maxWidth: '620px' };
const heroBtn = { background: 'linear-gradient(135deg,#2563eb,#7c3aed)', border: 'none', color: '#fff', padding: '14px 18px', borderRadius: '14px', fontWeight: '700', cursor: 'pointer' };
const searchCard = { background: 'rgba(15,23,42,0.6)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '18px', padding: '14px 16px', display: 'flex', alignItems: 'center', gap: '10px' };
const searchInput = { flex: 1, background: 'transparent', border: 'none', color: '#fff', outline: 'none', fontSize: '14px' };
const statusTabsRow = { display: 'flex', gap: '10px', flexWrap: 'wrap' };
const statusBtn = { background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', color: '#94a3b8', padding: '8px 14px', borderRadius: '999px', cursor: 'pointer', fontWeight: '700', fontSize: '12px' };
const statusActiveBtn = { ...statusBtn, color: '#fff', border: '1px solid rgba(59,130,246,0.45)', background: 'rgba(59,130,246,0.16)' };
const articleGrid = { display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: '16px' };
const articleCard = { background: 'rgba(15,23,42,0.6)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '22px', overflow: 'hidden', cursor: 'pointer', boxShadow: '0 20px 45px rgba(2,6,23,0.3)' };
const articleThumb = { height: '180px', background: '#111827' };
const articleImage = { width: '100%', height: '100%', objectFit: 'cover' };
const articleGradient = { width: '100%', height: '100%', background: 'linear-gradient(135deg,#1d4ed8,#7c3aed)' };
const articleBody = { padding: '18px' };
const articleMetaTop = { display: 'flex', justifyContent: 'space-between', gap: '8px', marginBottom: '10px' };
const pill = { background: 'rgba(59,130,246,0.12)', color: '#93c5fd', padding: '6px 10px', borderRadius: '999px', fontSize: '11px', fontWeight: '700' };
const statusPill = (status) => ({ background: status === 'published' ? 'rgba(16,185,129,0.12)' : 'rgba(245,158,11,0.12)', color: status === 'published' ? '#6ee7b7' : '#fcd34d', padding: '6px 10px', borderRadius: '999px', fontSize: '11px', fontWeight: '700' });
const articleTitle = { fontSize: '20px', fontWeight: '800', margin: '0 0 10px' };
const articleExcerpt = { fontSize: '13px', color: '#94a3b8', lineHeight: '1.6', minHeight: '66px' };
const articleMetaBottom = { display: 'flex', gap: '16px', color: '#94a3b8', fontSize: '12px', marginTop: '12px' };
const openBtn = { marginTop: '14px', width: '100%', background: 'rgba(255,255,255,0.04)', color: '#fff', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px', padding: '12px', cursor: 'pointer', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px', fontWeight: '700' };
const cardActions = { marginTop: '10px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' };
const editBtn = { background: 'rgba(59,130,246,0.12)', color: '#93c5fd', border: '1px solid rgba(59,130,246,0.25)', borderRadius: '10px', padding: '10px', cursor: 'pointer', fontWeight: '700', display: 'flex', gap: '6px', justifyContent: 'center', alignItems: 'center' };
const deleteBtn = { background: 'rgba(239,68,68,0.12)', color: '#fca5a5', border: '1px solid rgba(239,68,68,0.25)', borderRadius: '10px', padding: '10px', cursor: 'pointer', fontWeight: '700', display: 'flex', gap: '6px', justifyContent: 'center', alignItems: 'center' };
const sideCard = { background: 'rgba(15,23,42,0.6)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '20px', padding: '20px' };
const sideTitle = { fontSize: '12px', color: '#64748b', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '16px' };
const sideStat = { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid rgba(255,255,255,0.05)', color: '#cbd5e1' };
const categoryRow = { padding: '10px 12px', borderRadius: '12px', background: 'rgba(255,255,255,0.03)', color: '#cbd5e1', marginBottom: '10px' };
const emptyCard = { background: 'rgba(15,23,42,0.6)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '18px', padding: '24px', color: '#94a3b8' };

export default ArticleList;

