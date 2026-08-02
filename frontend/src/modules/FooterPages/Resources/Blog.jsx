import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { FiArrowLeft, FiEdit3, FiSearch } from 'react-icons/fi';
import FooterPageShell from '../components/FooterPageShell';
import BlogRightRail from '../components/BlogRightRail';
import useResourcesFooterContent from '../hooks/useResourcesFooterContent';
import { resolveMediaUrl } from '../../../components/shared/utils/resolveMediaUrl';
import {
  BLOG_CATEGORIES, BLOG_POSTS, BLOG_SUBTITLE, POPULAR_POSTS,
} from '../data/blogData';
import '../styles/blog.css';

function tagClass(category = '') {
  if (category === 'tips-guides') return 'is-tips';
  if (category === 'business') return 'is-business';
  if (category === 'freelancing') return 'is-freelance';
  if (category === 'success-stories') return 'is-success';
  return '';
}

function PostCard({ post, index, onOpen }) {
  const avatar = resolveMediaUrl(post.authorAvatar || '');
  const cover = resolveMediaUrl(post.imageurl || '');
  const initial = (post.author || 'E')[0].toUpperCase();
  return (
    <button type="button" className="blog-card" id={`blog-${post.id}`} onClick={() => onOpen(post.id)}>
      <div
        className={`blog-card__cover ${index % 2 ? 'is-alt' : ''}`}
        style={cover ? { backgroundImage: `url(${cover})` } : undefined}
      />
      <div className="blog-card__body">
        <span className={`blog-card__tag ${tagClass(post.category)}`}>
          {post.categoryLabel || post.category}
        </span>
        <h3>{post.title}</h3>
        {post.summary ? <p>{post.summary}</p> : null}
        <div className="blog-card__meta">
          {avatar ? (
            <img className="blog-card__avatar" src={avatar} alt="" />
          ) : (
            <span className="blog-card__avatar" aria-hidden>{initial}</span>
          )}
          <div className="blog-card__by">
            <strong>{post.author}</strong>
            <span>{[post.date, post.readTime].filter(Boolean).join(' · ')}</span>
          </div>
        </div>
      </div>
    </button>
  );
}

export default function Blog() {
  const { data, loading } = useResourcesFooterContent('Blog');
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('all');
  const [showAll, setShowAll] = useState(false);

  const posts = data?.posts?.length ? data.posts : BLOG_POSTS;
  const subtitle = data?.subtitle || BLOG_SUBTITLE;

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return posts.filter((p) => {
      const catOk = category === 'all' || p.category === category;
      if (!catOk) return false;
      if (!q) return true;
      return [p.title, p.summary, p.categoryLabel, p.author].filter(Boolean).join(' ').toLowerCase().includes(q);
    });
  }, [posts, query, category]);

  const visible = showAll ? filtered : filtered.slice(0, 4);

  const popular = useMemo(() => {
    if (data?.fromCms) {
      return posts.slice(0, 5).map((p) => ({
        id: p.id,
        title: p.title,
        meta: [p.readTime, p.categoryLabel].filter(Boolean).join(' · '),
      }));
    }
    return POPULAR_POSTS;
  }, [data?.fromCms, posts]);

  const onOpen = (id) => {
    document.getElementById(`blog-${id}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  };

  return (
    <FooterPageShell variant="resources" rightSlot={<BlogRightRail onOpen={onOpen} popular={popular} />}>
      <div className="blog-page">
        <header className="blog-head">
          <div>
            <div className="blog-head__title-row">
              <Link to="/resources/tutorials" className="blog-head__back" aria-label="Back">
                <FiArrowLeft size={16} />
              </Link>
              <span className="blog-head__icon" aria-hidden><FiEdit3 size={16} /></span>
              <h1>Blog</h1>
            </div>
            <p className="blog-head__sub">{subtitle}</p>
          </div>
          <label className="blog-search">
            <FiSearch size={14} aria-hidden />
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search blog…"
              aria-label="Search blog"
            />
          </label>
        </header>

        <div className="blog-filters" role="tablist" aria-label="Blog categories">
          {BLOG_CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              type="button"
              role="tab"
              aria-selected={category === cat.id}
              className={category === cat.id ? 'is-active' : ''}
              onClick={() => { setCategory(cat.id); setShowAll(false); }}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {loading ? <p className="blog-empty">Loading posts…</p> : null}

        {!filtered.length ? (
          <p className="blog-empty">No posts match this filter.</p>
        ) : (
          <>
            <div className="blog-grid" id="blog-grid">
              {visible.map((post, index) => (
                <PostCard key={post.id} post={post} index={index} onOpen={onOpen} />
              ))}
            </div>
            {filtered.length > 4 ? (
              <button type="button" className="blog-view-all" onClick={() => setShowAll((v) => !v)}>
                {showAll ? 'Show Fewer Posts' : 'View All Posts →'}
              </button>
            ) : null}
          </>
        )}
      </div>
    </FooterPageShell>
  );
}
