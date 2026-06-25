const stripHtml = (value) => value.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();

export function buildLivePreviewArticle(form, seoInsights, userData) {
  const plainContent = stripHtml(form.content || '');
  const wordCount = plainContent ? plainContent.split(/\s+/).length : 0;
  const cover = form.coverPreview || '';

  return {
    title: form.title.trim() || 'Untitled Article',
    content: form.content || '',
    category: form.category || 'General',
    status: 'draft',
    slug: form.slug || '',
    tags: form.tags || [],
    primary_keyword: form.primaryKeyword || '',
    seo_score: seoInsights?.score ?? 0,
    word_count: wordCount,
    reading_time: seoInsights?.readingTime ?? 1,
    author_name: userData?.fullname || userData?.name || userData?.username || 'You',
    imageurl: cover,
    cover_image: cover,
    _previewFromEditor: true,
  };
}
