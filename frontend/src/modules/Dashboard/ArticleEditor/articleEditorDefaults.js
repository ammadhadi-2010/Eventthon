import { DEFAULT_ARTICLE_CATEGORY } from './articleCategories';

/** Blank form for new articles — no demo content. */
export function createEmptyArticleForm() {
  return {
    title: '',
    slug: '',
    tags: [],
    newTag: '',
    primaryKeyword: '',
    metaTitle: '',
    metaDescription: '',
    category: DEFAULT_ARTICLE_CATEGORY,
    content: '',
    coverImage: null,
    coverPreview: '',
  };
}
