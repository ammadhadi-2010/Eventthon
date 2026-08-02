import { BLOG_POSTS, BLOG_SUBTITLE, FEATURED_POST } from '../data/blogData';
import { CASE_STUDIES, CASE_STUDIES_SUBTITLE } from '../data/caseStudiesData';
import {
  COMMUNITY_SUBTITLE,
  EVENT_COUNTDOWN,
  LEADERBOARD,
  THREADS,
} from '../data/communityData';
import { parseCommunityContent } from './communityCmsUtils';
import {
  DOC_ACCOUNT_STEPS,
  DOC_FEATURES,
  DOC_NAV,
  DOC_PAGES,
  DOC_PROFILE_CHECKS,
  DOC_SNIPPETS,
  DOC_UPDATED,
} from '../data/documentationData';
import { parseDocTopic, parseQuickStart } from './docsCmsUtils';
import { parseBlogContent } from './blogCmsUtils';
import { parseCaseContent } from './caseStudiesCmsUtils';
import { parseHelpContent } from './helpCmsUtils';
import { GUIDES, GUIDES_SUBTITLE } from '../data/guidesData';
import {
  FEATURED_ARTICLES,
  FAQ_ITEMS,
  HELP_CATEGORIES,
  HELP_STATUS,
  HELP_SUBTITLE,
} from '../data/helpCenterData';
import { TUTORIALS, TUTORIALS_SUBTITLE } from '../data/tutorialsData';
import { splitMarkdownSections } from './companyFooterMappers';

function parsePipeRows(text, minParts = 2) {
  return String(text || '')
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => line.split('|').map((p) => p.trim()))
    .filter((parts) => parts.length >= minParts);
}

function slugify(value, fallback = 'item') {
  const slug = String(value || '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
  return slug || fallback;
}

function sortRows(rows) {
  return [...rows].sort((a, b) => (a.sidebarOrder || 0) - (b.sidebarOrder || 0));
}

function parseCodeFence(content) {
  const text = String(content || '');
  const match = text.match(/```[\w]*\n?([\s\S]*?)```/);
  if (!match) {
    return { prose: text.trim(), code: text.trim(), snippetTitle: 'Sample' };
  }
  const code = match[1].trim();
  const prose = text.replace(/```[\w]*\n?[\s\S]*?```/, '').trim();
  return { prose, code, snippetTitle: 'Code sample' };
}

export function mapDocumentationPage(rows = []) {
  const pages = { ...DOC_PAGES };
  const snippets = { ...DOC_SNIPPETS };

  if (!rows.length) {
    return {
      nav: DOC_NAV,
      pages,
      snippets,
      subtitle: 'Product guides and API references for EventThon Network.',
      fromCms: false,
    };
  }

  const sorted = sortRows(rows);
  sorted.forEach((row, index) => {
    const id =
      String(row.pricingLabel || '').trim() ||
      row.slug ||
      slugify(row.title, `section-${index}`);
    const updated = row.readTime?.trim() || DOC_UPDATED;
    const intro = row.excerpt?.trim() || pages[id]?.intro || '';

    if (id === 'getting-started') {
      const qs = parseQuickStart(row.content);
      pages[id] = {
        ...(pages[id] || {}),
        title: row.title || 'Quick Start',
        breadcrumb: pages[id]?.breadcrumb || ['Documentation', 'Getting Started', 'Quick Start'],
        intro,
        callout: qs.callout || pages[id]?.callout,
        whatBody: qs.whatBody,
        features: qs.features?.length ? qs.features : DOC_FEATURES,
        accountSteps: qs.accountSteps?.length ? qs.accountSteps : DOC_ACCOUNT_STEPS,
        profileChecks: qs.profileChecks?.length ? qs.profileChecks : DOC_PROFILE_CHECKS,
        nextBody: qs.nextBody,
        kind: 'quickstart',
        updated,
      };
    } else {
      const topic = parseDocTopic(row.content);
      pages[id] = {
        ...(pages[id] || {}),
        title: row.title || pages[id]?.title || id,
        breadcrumb: pages[id]?.breadcrumb || ['Documentation', row.title || id],
        intro,
        body: topic.body || pages[id]?.body || '',
        code: topic.code || pages[id]?.code || '',
        updated,
      };
      snippets[id] = {
        title: row.title,
        prose: topic.body || intro,
        code: topic.code || '',
      };
    }
  });

  return {
    nav: DOC_NAV,
    pages,
    snippets,
    subtitle: 'Product guides and API references for EventThon Network.',
    fromCms: true,
  };
}

export function mapGuidesPage(rows = []) {
  if (!rows.length) {
    return {
      guides: GUIDES,
      subtitle: GUIDES_SUBTITLE,
      fromCms: false,
    };
  }

  const guides = sortRows(rows).map((row, index) => {
    const body = String(row.content || '').trim();
    const progressMatch = body.match(/progress\s*[:=]\s*(\d{1,3})/i);
    const stepsMatch = body.match(/steps\s*[:=]\s*(\d{1,3})/i);
    const summary = body
      .replace(/progress\s*[:=]\s*\d{1,3}/gi, '')
      .replace(/steps\s*[:=]\s*\d{1,3}/gi, '')
      .trim();
    const progressFromLegacy = Number(body) || 0;
    return {
      id: row.slug || slugify(row.title, `guide-${index}`),
      title: row.title,
      summary: summary && Number.isNaN(Number(summary)) ? summary : '',
      time: row.readTime?.trim() || '5 min',
      level: row.excerpt?.trim() || 'Beginner',
      category: String(row.pricingLabel || '').trim() || 'getting-started',
      steps: Number(row.pricingPrice) || Number(stepsMatch?.[1]) || 0,
      progress: Math.min(
        100,
        Math.max(0, Number(progressMatch?.[1]) || progressFromLegacy || 0),
      ),
      icon: String(row.jobTitle || '').trim() || 'rocket',
      featured: (row.sidebarOrder || 0) < 100,
    };
  });

  return {
    guides,
    subtitle: GUIDES_SUBTITLE,
    fromCms: true,
  };
}

export function mapTutorialsPage(rows = []) {
  if (!rows.length) {
    return {
      tutorials: TUTORIALS,
      subtitle: TUTORIALS_SUBTITLE,
      fromCms: false,
    };
  }

  const tutorials = sortRows(rows).map((row, index) => {
    const summary = String(row.content || '').trim();
    return {
      id: row.slug || slugify(row.title, `tutorial-${index}`),
      title: row.title,
      summary: summary && !/^\d+$/.test(summary) ? summary : '',
      duration: row.readTime?.trim() || '10:00',
      lessons: Number(row.pricingPrice) || 0,
      level: row.excerpt?.trim() || 'Beginner',
      category: String(row.pricingLabel || '').trim() || 'getting-started',
      featured: (row.sidebarOrder || 0) < 100,
      videoUrl: row.videourl || '',
      imageurl: row.imageurl || '',
    };
  });

  return {
    tutorials,
    subtitle: TUTORIALS_SUBTITLE,
    fromCms: true,
  };
}

export function mapBlogPage(rows = []) {
  if (!rows.length) {
    return {
      posts: BLOG_POSTS,
      featured: FEATURED_POST,
      subtitle: BLOG_SUBTITLE,
      fromCms: false,
    };
  }

  const posts = sortRows(rows).map((row, index) => {
    const parsed = parseBlogContent(row.content);
    return {
      id: row.slug || slugify(row.title, `post-${index}`),
      title: row.title,
      summary: parsed.summary,
      body: parsed.body,
      category: String(row.pricingLabel || '').trim() || 'platform-updates',
      categoryLabel: row.excerpt?.trim() || 'Updates',
      author: row.authorName?.trim() || 'EventThon Team',
      date: row.policyVersion?.trim() || '',
      readTime: row.readTime?.trim() || '5 min read',
      imageurl: row.imageurl || '',
      authorAvatar: row.authorAvatarUrl || '',
    };
  });

  const first = posts[0];
  return {
    posts,
    featured: first
      ? {
          title: first.title,
          author: first.author,
          category: first.categoryLabel,
          date: first.date,
          excerpt: first.summary,
          imageurl: first.imageurl,
          authorAvatar: first.authorAvatar,
        }
      : FEATURED_POST,
    subtitle: BLOG_SUBTITLE,
    fromCms: true,
  };
}

export function mapCaseStudiesPage(rows = []) {
  if (!rows.length) {
    return {
      stories: CASE_STUDIES,
      subtitle: CASE_STUDIES_SUBTITLE,
      fromCms: false,
    };
  }

  const stories = sortRows(rows).map((row, index) => {
    const parsed = parseCaseContent(row.content);
    // Legacy pipe-only rows
    const legacyPipe = !parsed.summary && !parsed.metrics.length
      ? parsePipeRows(row.content, 2)
      : [];
    const metrics = parsed.metrics.length
      ? parsed.metrics
      : legacyPipe.map(([value, label]) => ({ value, label }));
    return {
      id: row.slug || slugify(row.title, `case-${index}`),
      title: row.title,
      client: row.title,
      summary: parsed.summary || row.excerpt?.trim() || '',
      category: String(row.pricingLabel || '').trim() || 'business',
      categoryLabel: row.excerpt?.trim() || 'Business',
      metrics: metrics.slice(0, 3),
      metric: metrics[0]?.value || '—',
      label: metrics[0]?.label || 'Impact',
      author: row.authorName?.trim() || 'EventThon Team',
      date: row.policyVersion?.trim() || '',
      readTime: row.readTime?.trim() || '6 min read',
      imageurl: row.imageurl || '',
      authorAvatar: row.authorAvatarUrl || '',
      featured: Number(row.sidebarOrder || 0) === 0,
    };
  });

  return {
    stories,
    subtitle: CASE_STUDIES_SUBTITLE,
    fromCms: true,
  };
}

export function mapHelpCenterPage(rows = []) {
  if (!rows.length) {
    return {
      categories: HELP_CATEGORIES,
      featured: FEATURED_ARTICLES,
      faqItems: FAQ_ITEMS,
      status: HELP_STATUS,
      heroTitle: 'How can we help you?',
      subtitle: HELP_SUBTITLE,
      fromCms: false,
    };
  }

  const row = rows[0];
  const parsed = parseHelpContent(row.content);
  // Legacy ## Categories / ## FAQ support
  if (!String(row.content || '').match(/##\s*featured/i)) {
    const sections = splitMarkdownSections(row.content);
    const categoryLines = sections.categories || sections['help categories'] || '';
    const faqLines = sections.faq || sections['frequently asked questions'] || '';
    const categories = categoryLines
      ? parsePipeRows(categoryLines, 2).map(([id, label, icon]) => ({
          id,
          label,
          icon: icon || 'zap',
        }))
      : parsed.categories;
    const faqItems = faqLines
      ? parsePipeRows(faqLines, 2).map(([q, a]) => ({ q, a, category: '' }))
      : parsed.faq;
    return {
      categories: categories.length ? categories : HELP_CATEGORIES,
      featured: FEATURED_ARTICLES,
      faqItems: faqItems.length ? faqItems : FAQ_ITEMS,
      status: HELP_STATUS,
      heroTitle: row.title?.trim() || 'How can we help you?',
      subtitle: row.excerpt?.trim() || HELP_SUBTITLE,
      fromCms: true,
    };
  }

  return {
    categories: parsed.categories,
    featured: parsed.featured,
    faqItems: parsed.faq,
    status: parsed.status,
    heroTitle: row.title?.trim() || 'How can we help you?',
    subtitle: row.excerpt?.trim() || HELP_SUBTITLE,
    fromCms: true,
  };
}

export function mapCommunityPage(rows = []) {
  if (!rows.length) {
    const parsed = parseCommunityContent('');
    return {
      leaderboard: LEADERBOARD,
      threads: THREADS,
      event: EVENT_COUNTDOWN,
      ...parsed,
      topMembers: parsed.members,
      discordUrl: 'https://discord.com/invite/eventthon',
      subtitle: COMMUNITY_SUBTITLE,
      fromCms: false,
    };
  }

  const row = rows[0];
  const parsed = parseCommunityContent(row.content);

  return {
    leaderboard: parsed.members.map((m, i) => ({
      rank: i + 1,
      name: m.name,
      points: m.points,
    })),
    threads: parsed.discussions.map((d) => ({
      id: d.id,
      title: d.title,
      replies: d.replies,
      ago: 'Pinned',
    })),
    event: EVENT_COUNTDOWN,
    ...parsed,
    topMembers: parsed.members,
    discordUrl: row.externalUrl?.trim() || 'https://discord.com/invite/eventthon',
    subtitle: row.excerpt?.trim() || COMMUNITY_SUBTITLE,
    fromCms: true,
  };
}
