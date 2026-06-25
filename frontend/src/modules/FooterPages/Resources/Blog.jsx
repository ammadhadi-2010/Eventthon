import React from 'react';
import FooterPageShell from '../components/FooterPageShell';
import PageHero from '../components/PageHero';
import { BLOG_POSTS, FEATURED_POST } from '../data/blogData';

export default function Blog() {
  return (
    <FooterPageShell variant="resources">
      <PageHero title="Blog" subtitle="Product updates, playbooks, and stories from the EventThon network." />
      <article className="fp-card" style={{ marginBottom: 16 }}>
        <span className="fp-tag">Featured</span>
        <h2 style={{ margin: '12px 0 8px', fontSize: 22, color: '#f8fafc' }}>{FEATURED_POST.title}</h2>
        <p style={{ color: '#94a3b8', lineHeight: 1.55 }}>{FEATURED_POST.excerpt}</p>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center', marginTop: 14, flexWrap: 'wrap' }}>
          <span style={{ width: 32, height: 32, borderRadius: '50%', background: '#6366f1', display: 'grid', placeItems: 'center', fontSize: 12, fontWeight: 800 }}>{FEATURED_POST.author[0]}</span>
          <span style={{ fontSize: 13, color: '#cbd5e1' }}>{FEATURED_POST.author}</span>
          <span className="fp-tag">{FEATURED_POST.category}</span>
          <span style={{ fontSize: 12, color: '#64748b' }}>{FEATURED_POST.date}</span>
        </div>
      </article>
      <div className="fp-grid-3">
        {BLOG_POSTS.map((post) => (
          <article key={post.id} className="fp-card">
            <span className="fp-tag">{post.category}</span>
            <h3 style={{ margin: '10px 0', color: '#f1f5f9', fontSize: 16 }}>{post.title}</h3>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: 12, color: '#94a3b8' }}>{post.author}</span>
              <span style={{ fontSize: 11, color: '#64748b' }}>{post.date}</span>
            </div>
          </article>
        ))}
      </div>
    </FooterPageShell>
  );
}
