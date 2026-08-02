import { BLOG_CATEGORIES, BLOG_POSTS } from '../data/blogData';

export const BLOG_CATEGORY_OPTIONS = BLOG_CATEGORIES.filter((c) => c.id !== 'all');

/** Store card summary + optional full article in one CMS content field. */
export function serializeBlogContent({ summary = '', body = '' } = {}) {
  const s = String(summary || '').trim();
  const b = String(body || '').trim();
  if (!b) return s;
  return `## summary\n${s}\n\n## body\n${b}`.trim();
}

export function parseBlogContent(content) {
  const text = String(content || '').trim();
  if (!text) return { summary: '', body: '' };

  const summaryMatch = text.match(/##\s*summary\s*\n([\s\S]*?)(?=\n##\s*body\b|$)/i);
  const bodyMatch = text.match(/##\s*body\s*\n([\s\S]*)$/i);
  if (summaryMatch || bodyMatch) {
    return {
      summary: (summaryMatch?.[1] || '').trim(),
      body: (bodyMatch?.[1] || '').trim(),
    };
  }
  return { summary: text, body: '' };
}

export function defaultBlogFormFields(postId = 'roadmap-2026') {
  const post = BLOG_POSTS.find((p) => p.id === postId) || BLOG_POSTS[0];
  const index = Math.max(0, BLOG_POSTS.findIndex((p) => p.id === post.id));
  return {
    title: post.title,
    excerpt: post.categoryLabel || 'Platform Updates',
    pricingLabel: post.category || 'platform-updates',
    content: serializeBlogContent({
      summary: post.summary || '',
      body: post.body || '',
    }),
    authorName: post.author || 'EventThon Team',
    authorAvatarUrl: post.authorAvatar || '',
    imageurl: post.imageurl || '',
    readTime: post.readTime || '5 min read',
    policyVersion: post.date || '',
    sidebarOrder: index,
  };
}
