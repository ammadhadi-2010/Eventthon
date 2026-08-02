import React from 'react';
import { FiTrendingUp } from 'react-icons/fi';
import FooterCtaAside from './FooterCtaAside';
import { POPULAR_POSTS } from '../data/blogData';

export default function BlogRightRail({ onOpen, popular = POPULAR_POSTS }) {
  const items = popular?.length ? popular : POPULAR_POSTS;

  return (
    <div className="blog-rail">
      <FooterCtaAside />

      <section className="blog-rail__card">
        <p className="blog-rail__title">
          <FiTrendingUp size={13} aria-hidden /> Popular Posts
        </p>
        <ol className="blog-rail__popular">
          {items.slice(0, 5).map((item, index) => (
            <li key={item.id}>
              <button type="button" onClick={() => onOpen?.(item.id)}>
                <span className="blog-rail__num">{String(index + 1).padStart(2, '0')}</span>
                <span>
                  <strong>{item.title}</strong>
                  <em>{item.meta}</em>
                </span>
              </button>
            </li>
          ))}
        </ol>
        <button
          type="button"
          className="blog-rail__view-all"
          onClick={() => document.getElementById('blog-grid')?.scrollIntoView({ behavior: 'smooth' })}
        >
          View All Posts →
        </button>
      </section>
    </div>
  );
}
