import { DEFAULT_ARTICLE_CATEGORY } from './articleCategories';
import { EMPTY_RELATED_CONTENT } from './relatedContent/relatedContentConfig';

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
    coverImageUrl: '',
    coverPreview: '',
    relatedContent: { ...EMPTY_RELATED_CONTENT },
  };
}
