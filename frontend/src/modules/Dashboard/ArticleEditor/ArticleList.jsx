import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiBookOpen, FiSearch } from 'react-icons/fi';
import ProfileCard from '../components/ProfileCard';
import WalletCard from '../components/WalletCard';
import { deleteArticleById, fetchMyArticles } from './articleApi';
import { ARTICLE_CATEGORIES } from './articleCategories';
import ArticleLibraryBreadcrumb from './ArticleLibraryBreadcrumb';
import ArticleLibraryCard from './ArticleLibraryCard';
import { countArticlesByStatus, normalizeArticleTitle } from './articleLibraryUtils';
import './article-library.css';

const STATUS_TABS = [
  { key: 'all', label: 'All' },
  { key: 'published', label: 'Published' },
  { key: 'draft', label: 'Drafts' },
];

export default function ArticleList({ userData }) {
  const navigate = useNavigate();
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const loadArticles = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await fetchMyArticles(userData);
      setArticles(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Article list load failed:', err);
      setError('Could not load your articles. Please refresh and try again.');
      setArticles([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadArticles();
  }, [userData?._id, userData?.email]);

  const counts = useMemo(() => countArticlesByStatus(articles), [articles]);

  const filteredArticles = useMemo(() => {
    const term = query.trim().toLowerCase();
    let rows = articles;
    if (statusFilter === 'published') {
      rows = articles.filter((item) => String(item.status || '').toLowerCase() === 'published');
    } else if (statusFilter === 'draft') {
      rows = articles.filter((item) => String(item.status || 'draft').toLowerCase() !== 'published');
    }
    if (!term) return rows;
    return rows.filter((article) =>
      [article.title, article.author_name, article.category, article.primary_keyword]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(term)),
    );
  }, [articles, query, statusFilter]);

  const handleDelete = async (articleId, articleTitle) => {
    const label = normalizeArticleTitle(articleTitle) || 'this article';
    if (!window.confirm(`Permanently delete "${label}"? This cannot be undone.`)) return;
    try {
      await deleteArticleById(articleId, userData);
      setArticles((prev) => prev.filter((item) => item._id !== articleId));
    } catch (err) {
      console.error('Delete article failed:', err);
      const msg = err?.response?.data?.detail || err?.message || 'Delete failed';
      window.alert(msg);
    }
  };

  return (
    <div className="artlib-page">
      <div className="artlib-layout">
        <ArticleLibraryBreadcrumb />

        <aside className="artlib-sidebar-left">
          <ProfileCard userData={userData} />
          <WalletCard userData={userData} />
        </aside>

        <main className="artlib-main">
          <section className="artlib-hero">
            <div>
              <div className="artlib-hero__icon"><FiBookOpen aria-hidden /></div>
              <h1 className="artlib-hero__title">Article Library</h1>
              <p className="artlib-hero__text">
                Manage your published articles and drafts for EventThon Network.
              </p>
            </div>
            <button type="button" className="artlib-hero__btn" onClick={() => navigate('/article/new')}>
              Write New Article
            </button>
          </section>

          <section className="artlib-search">
            <FiSearch aria-hidden />
            <input
              className="artlib-search__input"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search title, author, keyword..."
              aria-label="Search articles"
            />
          </section>

          <section className="artlib-tabs" aria-label="Article filters">
            {STATUS_TABS.map((item) => (
              <button
                key={item.key}
                type="button"
                className={`artlib-tabs__btn${statusFilter === item.key ? ' is-active' : ''}`}
                onClick={() => setStatusFilter(item.key)}
              >
                {item.label} ({counts[item.key] ?? counts.all})
              </button>
            ))}
          </section>

          {loading ? <div className="artlib-state">Loading articles…</div> : null}
          {error ? <div className="artlib-state artlib-state--error">{error}</div> : null}

          {!loading && !error && filteredArticles.length === 0 ? (
            <div className="artlib-state">No articles found.</div>
          ) : null}

          {!loading && !error && filteredArticles.length > 0 ? (
            <div className="artlib-grid">
              {filteredArticles.map((article) => (
                <ArticleLibraryCard
                  key={article._id}
                  article={article}
                  onOpen={(id) => navigate(`/article/view/${id}`)}
                  onEdit={(id) => navigate(`/article/edit/${id}`)}
                  onDelete={handleDelete}
                />
              ))}
            </div>
          ) : null}
        </main>

        <aside className="artlib-sidebar-right">
          <div className="artlib-side-card">
            <h2 className="artlib-side-card__title">Publishing Pulse</h2>
            <div className="artlib-side-stat"><span>Total Articles</span><strong>{counts.all}</strong></div>
            <div className="artlib-side-stat"><span>Published</span><strong>{counts.published}</strong></div>
            <div className="artlib-side-stat"><span>Drafts</span><strong>{counts.draft}</strong></div>
          </div>
          <div className="artlib-side-card">
            <h2 className="artlib-side-card__title">Top Categories</h2>
            {ARTICLE_CATEGORIES.slice(0, 8).map((item) => (
              <div key={item} className="artlib-side-category">{item}</div>
            ))}
          </div>
        </aside>
      </div>
    </div>
  );
}
