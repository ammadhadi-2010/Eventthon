import React, { useEffect, useMemo, useRef, useState } from 'react';
import axios from 'axios';
import { useNavigate, useParams } from 'react-router-dom';
import {
  FiBold,
  FiBookOpen,
  FiCheckCircle,
  FiCode,
  FiEye,
  FiImage,
  FiItalic,
  FiLink,
  FiList,
  FiSave,
  FiType,
  FiUnderline,
} from 'react-icons/fi';
import { API_BASE_URL } from '../../../api/axiosConfig';
import ProfileCard from '../components/ProfileCard';
import { resolveDashboardMediaUrl } from '../utils/dashboardMedia';
import { deleteArticleById, fetchArticleById, updateArticleById, uploadArticleMedia, getArticleIdentifier } from './articleApi';
import { ARTICLE_CATEGORIES } from './articleCategories';
import { createEmptyArticleForm } from './articleEditorDefaults';
import { buildLivePreviewArticle } from './buildLivePreviewArticle';
import ArticleEditorMoreMenu from './ArticleEditorMoreMenu';
import './article-editor-mobile.css';

const scoreClamp = (value) => Math.max(0, Math.min(100, value));
const stripHtml = (value) => value.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();

const ArticleEditor = ({ userData }) => {
  const navigate = useNavigate();
  const { articleId } = useParams();
  const isEditMode = Boolean(articleId);
  const [form, setForm] = useState(createEmptyArticleForm);
  const [saving, setSaving] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');
  const [activeSidebarItem, setActiveSidebarItem] = useState('new');
  const [categoryOpen, setCategoryOpen] = useState(false);
  const [loadingArticle, setLoadingArticle] = useState(false);
  const editorRef = useRef(null);
  const coverFileRef = useRef(null);
  const inlineImageRef = useRef(null);
  const isTypingRef = useRef(false);

  useEffect(() => {
    const editor = editorRef.current;
    if (!editor) return;
    if (isTypingRef.current) return;
    if (editor.innerHTML !== form.content) {
      editor.innerHTML = form.content;
    }
  }, [form.content]);

  useEffect(() => {
    if (isEditMode) return;
    const empty = createEmptyArticleForm();
    setForm(empty);
    setActiveSidebarItem('new');
    setStatusMessage('');
    if (editorRef.current) editorRef.current.innerHTML = '';
  }, [isEditMode, articleId]);

  useEffect(() => {
    if (!isEditMode) return;
    const loadExisting = async () => {
      try {
        setLoadingArticle(true);
        const article = await fetchArticleById(articleId);
        if (!article) return;
        setForm((prev) => ({
          ...prev,
          title: article.title || '',
          slug: article.slug || '',
          tags: Array.isArray(article.tags) ? article.tags : [],
          newTag: '',
          primaryKeyword: article.primary_keyword || '',
          metaTitle: article.meta_title || '',
          metaDescription: article.meta_description || '',
          category: article.category || 'SEO',
          content: article.content || '',
          coverImage: null,
          coverPreview: resolveDashboardMediaUrl(article.imageurl || article.cover_image) || '',
        }));
      } catch (error) {
        console.error('Failed to load article for editing:', error);
      } finally {
        setLoadingArticle(false);
      }
    };
    loadExisting();
  }, [articleId, isEditMode]);

  const seoInsights = useMemo(() => {
    const plainContent = stripHtml(form.content);
    const wordCount = plainContent ? plainContent.split(/\s+/).length : 0;
    const readingTime = Math.max(1, Math.round(wordCount / 200));
    const lowerContent = plainContent.toLowerCase();
    const keyword = form.primaryKeyword.trim().toLowerCase();
    const keywordHits = keyword ? (lowerContent.match(new RegExp(keyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g')) || []).length : 0;
    const hasH1 = /<h1[\s>]/i.test(form.content);
    const hasH2 = /<h2[\s>]/i.test(form.content);
    const internalLinks = (form.content.match(/eventthon|\/dashboard|\/profile|\/article/gi) || []).length;
    const externalLinks = (form.content.match(/https?:\/\//gi) || []).length;
    const imageAdded = Boolean(form.coverPreview || form.coverImage);
    const titleReady = form.title.trim().length >= 30 && form.title.trim().length <= 65;
    const metaTitleReady = form.metaTitle.trim().length >= 30 && form.metaTitle.trim().length <= 65;
    const metaDescriptionReady = form.metaDescription.trim().length >= 120 && form.metaDescription.trim().length <= 160;

    let score = 0;
    if (titleReady) score += 18;
    if (wordCount >= 900) score += 18;
    if (keywordHits >= 4) score += 18;
    if (hasH1) score += 8;
    if (hasH2) score += 10;
    if (imageAdded) score += 8;
    if (internalLinks >= 2) score += 10;
    if (externalLinks >= 1) score += 8;
    if (metaTitleReady) score += 10;
    if (metaDescriptionReady) score += 10;

    return {
      score: scoreClamp(score),
      wordCount,
      readingTime,
      keywordHits,
      titleReady,
      metaTitleReady,
      metaDescriptionReady,
      imageAdded,
      internalLinks,
      externalLinks,
      hasH1,
      hasH2,
    };
  }, [form]);

  const permalink = useMemo(() => {
    const slug = form.slug.trim() || form.title.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
    return slug ? `eventthon.com/articles/${slug}` : 'eventthon.com/articles/your-article-slug';
  }, [form.slug, form.title]);

  const updateField = (key, value) => {
    setForm((prev) => {
      const next = { ...prev, [key]: value };
      if (key === 'title' && !prev.slug.trim()) {
        next.slug = value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
      }
      if (key === 'title' && !prev.metaTitle.trim()) {
        next.metaTitle = value.slice(0, 65);
      }
      if (key === 'content' && !prev.metaDescription.trim()) {
        next.metaDescription = stripHtml(value).slice(0, 160);
      }
      return next;
    });
  };

  const addTag = () => {
    const cleanTag = form.newTag.trim();
    if (!cleanTag || form.tags.includes(cleanTag)) return;
    setForm((prev) => ({ ...prev, tags: [...prev.tags, cleanTag], newTag: '' }));
  };

  const removeTag = (tag) => {
    setForm((prev) => ({ ...prev, tags: prev.tags.filter((item) => item !== tag) }));
  };

  const appendContent = (text) => {
    updateField('content', `${form.content}<p>${text}</p>`);
    requestAnimationFrame(() => {
      isTypingRef.current = false;
      editorRef.current?.focus();
    });
  };

  const handleCoverChange = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const preview = URL.createObjectURL(file);
    setForm((prev) => ({ ...prev, coverImage: file, coverPreview: preview }));
    event.target.value = '';
  };

  const handleInlineImageChange = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    try {
      setStatusMessage('Uploading image...');
      const imageurl = await uploadArticleMedia(file);
      const src = imageurl.startsWith('http') ? imageurl : `${API_BASE_URL}${imageurl}`;
      insertBlockHtml(
        `<img src="${src}" alt="" data-imageurl="${imageurl}" style="max-width:100%;border-radius:12px;margin:12px 0;display:block;" />`,
      );
      setStatusMessage('Image added to article content.');
    } catch (error) {
      console.error('Inline image upload failed:', error);
      setStatusMessage('Image upload failed. Try again or use cover image.');
    } finally {
      event.target.value = '';
    }
  };

  const getSelectedText = () => {
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) return '';
    return selection.toString();
  };

  const insertBlockHtml = (html) => {
    const editor = editorRef.current;
    if (!editor) return;
    editor.focus();
    isTypingRef.current = true;
    document.execCommand('insertHTML', false, `<p><br></p>${html}<p><br></p>`);
    isTypingRef.current = false;
    updateField('content', editor.innerHTML);
  };

  const handleToolbarAction = (action) => {
    const editor = editorRef.current;
    if (!editor) return;
    editor.focus();
    isTypingRef.current = true;
    const selectedText = getSelectedText();

    switch (action) {
      case 'bold':
        document.execCommand('bold');
        break;
      case 'italic':
        document.execCommand('italic');
        break;
      case 'underline':
        document.execCommand('underline');
        break;
      case 'list':
        document.execCommand('insertUnorderedList', false);
        break;
      case 'h2':
        if (selectedText) {
          document.execCommand('formatBlock', false, 'h2');
        } else {
          insertBlockHtml('<h2>New Section Heading</h2>');
          return;
        }
        break;
      case 'code':
        insertBlockHtml(
          '<pre style="background:#0f172a;color:#e2e8f0;padding:14px;border-radius:12px;border:1px solid rgba(148,163,184,0.15);overflow:auto;"><code>// write your code here</code></pre>'
        );
        return;
      case 'internalLink':
        document.execCommand(
          'insertHTML',
          false,
          `<a href="/dashboard" style="color:#60a5fa;text-decoration:underline;">${selectedText || 'EventThon internal link'}</a>`
        );
        break;
      case 'externalLink':
        document.execCommand(
          'insertHTML',
          false,
          `<a href="https://example.com" target="_blank" rel="noreferrer" style="color:#a78bfa;text-decoration:underline;">${selectedText || 'Authority source'}</a>`
        );
        break;
      case 'image':
        inlineImageRef.current?.click();
        return;
      case 'seo':
        insertBlockHtml(
          '<div style="margin:16px 0;padding:16px;border-radius:16px;background:rgba(79,70,229,0.12);border:1px solid rgba(129,140,248,0.25);"><h3 style="margin:0 0 8px 0;color:#c4b5fd;">SEO Pro Tip</h3><p style="margin:0;color:#cbd5e1;">Focus on helpful content, internal links, structured headings, and original examples.</p></div>'
        );
        setStatusMessage('SEO content block inserted.');
        return;
      default:
        break;
    }
    isTypingRef.current = false;
    updateField('content', editor.innerHTML);
  };

  const handleSidebarClick = (itemKey) => {
    setActiveSidebarItem(itemKey);
    if (itemKey === 'new') {
      const empty = createEmptyArticleForm();
      setForm(empty);
      if (editorRef.current) editorRef.current.innerHTML = '';
      setActiveSidebarItem('new');
      navigate('/article/new');
      return;
    }
    if (['drafts', 'scheduled', 'published', 'trash'].includes(itemKey)) {
      navigate('/article/list');
      return;
    }
    const messages = {
      new: 'New article workspace active.',
      drafts: 'Drafts view placeholder selected.',
      scheduled: 'Scheduled articles panel will connect next.',
      published: 'Published articles list will connect next.',
      trash: 'Trash panel placeholder selected.',
      guide: 'How-to guide template suggested.',
      listicle: 'Listicle template suggested.',
      caseStudy: 'Case study template suggested.',
      opinion: 'Opinion piece template suggested.',
      ultimate: 'Ultimate guide template suggested.',
    };
    setStatusMessage(messages[itemKey] || 'Panel updated.');
  };

  const buildFormData = () => {
    const identifier = getArticleIdentifier(userData);

    const data = new FormData();
    data.append('title', form.title);
    data.append('slug', form.slug);
    data.append('content', form.content);
    data.append('identifier', identifier);
    data.append('excerpt', stripHtml(form.content).slice(0, 220));
    data.append('tags', form.tags.join(','));
    data.append('primary_keyword', form.primaryKeyword);
    data.append('meta_title', form.metaTitle);
    data.append('meta_description', form.metaDescription);
    data.append('category', form.category);
    data.append('seo_score', String(seoInsights.score));
    if (form.coverImage) data.append('cover_image', form.coverImage);
    return data;
  };

  const submitArticle = async (mode) => {
    const isPublish = mode === 'publish';
    if (!form.title.trim() || !form.content.trim()) {
      setStatusMessage('Title aur content dono zaroori hain.');
      return;
    }

    try {
      isPublish ? setPublishing(true) : setSaving(true);
      setStatusMessage('');
      let savedId = null;
      if (isEditMode) {
        const updated = await updateArticleById(articleId, {
          ...form,
          excerpt: stripHtml(form.content).slice(0, 220),
          seoScore: seoInsights.score,
          status: isPublish ? 'published' : 'draft',
        });
        savedId = updated?._id || articleId;
      } else {
        const endpoint = isPublish ? '/api/articles/articles/publish' : '/api/articles/articles/save-draft';
        const response = await axios.post(`${API_BASE_URL}${endpoint}`, buildFormData(), {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        savedId = response?.data?.data?._id || response?.data?.data?.article_id;
      }
      setStatusMessage(
        isEditMode
          ? (isPublish ? 'Article updated and published successfully.' : 'Draft updated successfully.')
          : (isPublish ? 'Article published successfully.' : 'Draft saved successfully.')
      );
      if (savedId) {
        localStorage.setItem('lastArticleId', savedId);
        navigate(isPublish ? `/article/view/${savedId}` : '/article/list');
      }
    } catch (error) {
      console.error('Article submit failed:', error);
      const fallbackKey = 'eventthon_article_draft';
      localStorage.setItem(
        fallbackKey,
        JSON.stringify({
          title: form.title,
          slug: form.slug,
          tags: form.tags,
          newTag: form.newTag,
          primaryKeyword: form.primaryKeyword,
          metaTitle: form.metaTitle,
          metaDescription: form.metaDescription,
          category: form.category,
          content: form.content,
          coverPreview: form.coverPreview,
          savedAt: new Date().toISOString(),
          seoScore: seoInsights.score,
        })
      );
      setStatusMessage(isPublish ? 'Publish failed. Draft backed up locally.' : 'Draft saved locally.');
    } finally {
      setPublishing(false);
      setSaving(false);
    }
  };

  const openLiveArticlePreview = () => {
    const livePreview = buildLivePreviewArticle(form, seoInsights, userData);
    const returnTo = isEditMode ? `/article/edit/${articleId}` : '/article/new';
    if (isEditMode) {
      navigate(`/article/view/${articleId}`, { state: { livePreview, returnTo } });
      return;
    }
    navigate('/article/preview', { state: { livePreview, returnTo } });
  };

  const handlePreview = () => {
    if (!form.title.trim() && !form.content.trim()) {
      setStatusMessage('Add a title or content before preview.');
      return;
    }
    openLiveArticlePreview();
  };

  const handleDeleteDraft = async () => {
    if (isEditMode) {
      if (!window.confirm('Permanently delete this draft?')) return;
      try {
        await deleteArticleById(articleId, userData);
        navigate('/article/list');
      } catch (error) {
        console.error('Delete draft failed:', error);
        setStatusMessage(error?.response?.data?.detail || error?.message || 'Delete failed.');
      }
      return;
    }
    if (!window.confirm('Clear this workspace draft?')) return;
    const empty = createEmptyArticleForm();
    setForm(empty);
    if (editorRef.current) editorRef.current.innerHTML = '';
    localStorage.removeItem('eventthon_article_draft');
    setStatusMessage('Workspace draft cleared.');
  };

  const handleViewHistory = () => {
    openLiveArticlePreview();
  };

  const handleArchiveWorkspace = () => {
    try {
      localStorage.setItem(
        'eventthon_article_archived',
        JSON.stringify({
          title: form.title,
          slug: form.slug,
          tags: form.tags,
          newTag: form.newTag,
          primaryKeyword: form.primaryKeyword,
          metaTitle: form.metaTitle,
          metaDescription: form.metaDescription,
          category: form.category,
          content: form.content,
          coverPreview: form.coverPreview,
          archivedAt: new Date().toISOString(),
          seoScore: seoInsights.score,
        })
      );
      setStatusMessage('Workspace archived locally.');
    } catch (error) {
      console.error(error);
      setStatusMessage('Archive failed. Changes kept in editor.');
    }
  };

  return (
    <div className="article-editor__wrapper" style={editorWrapper}>
      {loadingArticle ? <div style={statusBanner}>Loading article for editing...</div> : null}
      <div className="article-editor__header" style={editorHeader}>
        <div className="article-editor__header-copy" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={iconBox}><FiBookOpen /></div>
          <div>
            <h2 style={headerTitle}>{isEditMode ? 'Edit Article' : 'Article Editor'}</h2>
            <p style={headerSub}>Write, optimize and publish high-quality content that ranks.</p>
          </div>
        </div>
        <div className="article-editor__header-actions" style={headerActions}>
          <button style={btnDraft} onClick={() => submitArticle('draft')} disabled={saving || publishing}>
            <FiSave /> {saving ? 'Saving...' : 'Save Draft'}
          </button>
          <button type="button" style={btnPreview} onClick={handlePreview}>
            <FiEye /> Preview
          </button>
          <ArticleEditorMoreMenu
            onDeleteDraft={handleDeleteDraft}
            onViewHistory={handleViewHistory}
            onArchive={handleArchiveWorkspace}
          />
        </div>
      </div>

      <div className="article-editor__layout" style={editorMainLayout}>
        <aside className="article-editor__left-rail" style={leftRail}>
          <ProfileCard userData={userData} />

          <div style={railCard}>
            <h4 style={railTitle}>All Articles</h4>
            <button style={activeSidebarItem === 'new' ? railActiveBtn : railButton} onClick={() => handleSidebarClick('new')}>New Article</button>
            <button style={activeSidebarItem === 'drafts' ? railActiveBtn : railButton} onClick={() => handleSidebarClick('drafts')}>Drafts <span>12</span></button>
            <button style={activeSidebarItem === 'scheduled' ? railActiveBtn : railButton} onClick={() => handleSidebarClick('scheduled')}>Scheduled <span>3</span></button>
            <button style={activeSidebarItem === 'published' ? railActiveBtn : railButton} onClick={() => handleSidebarClick('published')}>Published <span>24</span></button>
            <button style={activeSidebarItem === 'trash' ? railActiveBtn : railButton} onClick={() => handleSidebarClick('trash')}>Trash <span>2</span></button>
          </div>

          <div style={railCard}>
            <h4 style={railTitle}>Writing Tip</h4>
            <ul style={tipList}>
              <li>Use short paragraphs and clear language.</li>
              <li>Add images, headings and links.</li>
              <li>Improve readability and include keywords naturally.</li>
              <li>Link to relevant internal and external resources.</li>
            </ul>
            <button style={templateBtn} onClick={() => appendContent('\nH2: Writing Tip Applied\n\nUse specific examples, proof, and actionable steps.\n')}>Use This Tip</button>
          </div>

          <div style={railCard}>
            <h4 style={railTitle}>Content Templates</h4>
            <button style={activeSidebarItem === 'guide' ? railActiveBtn : railButton} onClick={() => handleSidebarClick('guide')}>How-To Guide</button>
            <button style={activeSidebarItem === 'listicle' ? railActiveBtn : railButton} onClick={() => handleSidebarClick('listicle')}>Listicle Article</button>
            <button style={activeSidebarItem === 'caseStudy' ? railActiveBtn : railButton} onClick={() => handleSidebarClick('caseStudy')}>Case Study</button>
            <button style={activeSidebarItem === 'opinion' ? railActiveBtn : railButton} onClick={() => handleSidebarClick('opinion')}>Opinion Piece</button>
            <button style={activeSidebarItem === 'ultimate' ? railActiveBtn : railButton} onClick={() => handleSidebarClick('ultimate')}>Ultimate Guide</button>
          </div>
        </aside>

        <div className="article-editor__workspace" style={writingSection}>
          <div style={breadcrumbRow}>Dashboard / Articles / New Article</div>

          <input
            type="text"
            placeholder="Enter your article title"
            className="article-editor__title-input"
            style={titleInput}
            value={form.title}
            onChange={(e) => updateField('title', e.target.value)}
          />

          <div style={permalinkRow}>
            <span>Permalink: {permalink}</span>
            <button type="button" style={miniEditBtn} onClick={() => editorRef.current?.focus()}>Edit</button>
          </div>

          <div className="article-editor__field-grid" style={fieldGrid}>
            <div style={fieldBlock}>
              <label style={fieldLabel}>Primary Keyword</label>
              <input
                className="article-editor__field-input"
                style={glassInput}
                value={form.primaryKeyword}
                onChange={(e) => updateField('primaryKeyword', e.target.value)}
                placeholder="Primary keyword"
              />
            </div>
            <div style={fieldBlock}>
              <label style={fieldLabel}>Category</label>
              <div style={selectWrap}>
                <button type="button" className="article-editor__field-input" style={selectButton} onClick={() => setCategoryOpen((prev) => !prev)}>
                  <span>{form.category}</span>
                  <span>{categoryOpen ? '▲' : '▼'}</span>
                </button>
                {categoryOpen ? (
                  <div style={selectMenu}>
                    {ARTICLE_CATEGORIES.map((item) => (
                      <button
                        key={item}
                        type="button"
                        style={item === form.category ? selectMenuItemActive : selectMenuItem}
                        onClick={() => {
                          updateField('category', item);
                          setCategoryOpen(false);
                        }}
                      >
                        {item}
                      </button>
                    ))}
                  </div>
                ) : null}
              </div>
            </div>
            <div style={fieldBlock}>
              <label style={fieldLabel}>Slug</label>
              <input
                className="article-editor__field-input"
                style={glassInput}
                value={form.slug}
                onChange={(e) => updateField('slug', e.target.value)}
                placeholder="article-slug"
              />
            </div>
          </div>

          <div style={tagsRow}>
            {form.tags.map((tag) => (
              <span key={tag} style={tagItem} onClick={() => removeTag(tag)}>
                {tag} x
              </span>
            ))}
            <input
              style={tagInput}
              value={form.newTag}
              onChange={(e) => setForm((prev) => ({ ...prev, newTag: e.target.value }))}
              onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
              placeholder="+ Add Tag"
            />
          </div>

          <div className="article-editor__meta-grid" style={metaGrid}>
            <div style={fieldBlock}>
              <label style={fieldLabel}>Meta Title</label>
              <input
                className="article-editor__field-input"
                style={glassInput}
                value={form.metaTitle}
                onChange={(e) => updateField('metaTitle', e.target.value)}
                placeholder="SEO focused title for Google"
              />
            </div>
            <div style={fieldBlock}>
              <label style={fieldLabel}>Meta Description</label>
              <textarea
                className="article-editor__field-input"
                style={metaTextArea}
                value={form.metaDescription}
                onChange={(e) => updateField('metaDescription', e.target.value)}
                placeholder="Write a compelling description for search snippets."
              />
            </div>
          </div>

          <div style={coverCard}>
            <div style={coverHeader}>
              <span style={fieldLabel}>Featured Image</span>
              <button type="button" style={btnAddTag} onClick={() => coverFileRef.current?.click()}>
                <FiImage /> {form.coverPreview ? 'Change Image' : 'Add Image'}
              </button>
            </div>
            <input ref={coverFileRef} type="file" accept="image/*" hidden onChange={handleCoverChange} />
            <input ref={inlineImageRef} type="file" accept="image/*" hidden onChange={handleInlineImageChange} />
            {form.coverPreview ? (
              <img src={form.coverPreview} alt="Cover Preview" style={coverPreviewStyle} />
            ) : (
              <div style={coverPlaceholder}>Upload a featured image to improve click-through and article trust.</div>
            )}
          </div>

          <div className="article-editor__editor-canvas" style={editorCanvas}>
            <div className="article-editor__toolbar" style={toolbarPlaceholder}>
              <button type="button" style={toolbarBtn} title="Bold" onClick={() => handleToolbarAction('bold')}><FiBold /></button>
              <button type="button" style={toolbarBtn} title="Italic" onClick={() => handleToolbarAction('italic')}><FiItalic /></button>
              <button type="button" style={toolbarBtn} title="Underline" onClick={() => handleToolbarAction('underline')}><FiUnderline /></button>
              <button type="button" style={toolbarBtn} title="Bullet List" onClick={() => handleToolbarAction('list')}><FiList /></button>
              <button type="button" style={toolbarBtn} title="Heading" onClick={() => handleToolbarAction('h2')}><FiType /></button>
              <button type="button" style={toolbarBtn} title="Code Block" onClick={() => handleToolbarAction('code')}><FiCode /></button>
              <button type="button" style={toolbarBtn} title="Internal Link" onClick={() => handleToolbarAction('internalLink')}><FiLink /></button>
              <button type="button" style={toolbarBtn} title="External Link" onClick={() => handleToolbarAction('externalLink')}>ext</button>
              <button type="button" style={toolbarBtn} title="Add Image" onClick={() => handleToolbarAction('image')}><FiImage /></button>
              <button type="button" style={toolbarBtn} title="SEO Tip" onClick={() => handleToolbarAction('seo')}>SEO</button>
            </div>

            <div
              ref={editorRef}
              contentEditable
              suppressContentEditableWarning
              style={mainEditor}
              onInput={(e) => {
                isTypingRef.current = true;
                updateField('content', e.currentTarget.innerHTML);
              }}
              onBlur={(e) => {
                isTypingRef.current = false;
                updateField('content', e.currentTarget.innerHTML);
              }}
            />
          </div>

          {statusMessage ? <div style={statusBanner}>{statusMessage}</div> : null}
        </div>

        <aside className="article-editor__seo-panel" style={seoSidebar}>
          <div style={statCard}>
            <h4 style={cardLabel}>SEO Score</h4>
            <div style={scoreCircle}>
              <span style={{ fontSize: '24px', fontWeight: '800' }}>{seoInsights.score}</span>/100
            </div>
            <p style={{ fontSize: '11px', color: seoInsights.score >= 75 ? '#10b981' : '#f59e0b', textAlign: 'center' }}>
              {seoInsights.score >= 75 ? 'Excellent! Your article is well optimized.' : 'Improve optimization to rank better.'}
            </p>
            <button style={sidebarActionBtn} onClick={() => setStatusMessage(`SEO score reviewed: ${seoInsights.score}/100`)}>
              Review SEO Score
            </button>
          </div>

          <div style={statCard}>
            <h4 style={cardLabel}>Keyword Optimization</h4>
            <div style={progressRow}>
              <span style={labelSmall}>Primary Keyword</span>
              <div style={progressBar}><div style={{ ...progressFill, width: `${Math.min(seoInsights.keywordHits * 18, 100)}%`, background: '#10b981' }} /></div>
              <small style={microStat}>{form.primaryKeyword || 'No keyword'} - {seoInsights.keywordHits} hits</small>
            </div>
            <div style={progressRow}>
              <span style={labelSmall}>Internal Links</span>
              <div style={progressBar}><div style={{ ...progressFill, width: `${Math.min(seoInsights.internalLinks * 35, 100)}%`, background: '#3b82f6' }} /></div>
              <small style={microStat}>{seoInsights.internalLinks}/3 recommended</small>
            </div>
            <div style={progressRow}>
              <span style={labelSmall}>External Links</span>
              <div style={progressBar}><div style={{ ...progressFill, width: `${seoInsights.externalLinks ? 100 : 20}%`, background: '#8b5cf6' }} /></div>
              <small style={microStat}>{seoInsights.externalLinks ? 'Good' : 'Add at least one reference'}</small>
            </div>
          </div>

          <div style={statCard}>
            <h4 style={cardLabel}>Readability</h4>
            <div style={metricGrid}>
              <div style={metricBox}>
                <span style={metricValue}>{seoInsights.score >= 78 ? 'Great' : 'Needs Work'}</span>
                <span style={metricLabel}>Score</span>
              </div>
              <div style={metricBox}>
                <span style={metricValue}>{seoInsights.readingTime} min</span>
                <span style={metricLabel}>Reading Time</span>
              </div>
              <div style={metricBox}>
                <span style={metricValue}>{seoInsights.wordCount}</span>
                <span style={metricLabel}>Word Count</span>
              </div>
            </div>
            <button style={sidebarActionBtn} onClick={() => appendContent('\nH2: Readability Upgrade\n\nUse short paragraphs, strong headings, and direct examples.\n')}>
              Improve Readability
            </button>
          </div>

          <div style={statCard}>
            <h4 style={cardLabel}>Content Checklist</h4>
            {[
              ['Meta Title', seoInsights.metaTitleReady],
              ['Meta Description', seoInsights.metaDescriptionReady],
              ['H1 Heading', seoInsights.hasH1],
              ['Image Added', seoInsights.imageAdded],
              ['Internal Links', seoInsights.internalLinks >= 2],
              ['External Links', seoInsights.externalLinks >= 1],
              ['Conclusion', seoInsights.wordCount >= 900],
            ].map(([label, ok]) => (
              <div key={label} style={checkRow}>
                <span>{label}</span>
                <FiCheckCircle color={ok ? '#10b981' : '#475569'} />
              </div>
            ))}
            <button style={sidebarActionBtn} onClick={() => setStatusMessage('Checklist synced with current article content.')}>
              Refresh Checklist
            </button>
          </div>

          <div style={statCard}>
            <h4 style={cardLabel}>Publishing</h4>
            <div style={fieldBlock}>
              <label style={fieldLabel}>Status</label>
              <div style={glassInputStatic}>{publishing ? 'Publishing...' : 'Draft / Ready to publish'}</div>
            </div>
            <button style={btnPublish} onClick={() => submitArticle('publish')} disabled={saving || publishing}>
              {publishing ? 'Publishing...' : 'Publish Article'}
            </button>
          </div>
        </aside>
      </div>
    </div>
  );
};

// --- STYLES (Elite Dashboard V2 - Updated) ---
const editorWrapper = { 
  padding: '20px', 
  color: '#fff', 
  background: '#020617', 
  minHeight: '100vh' 
};

const editorHeader = { 
  display: 'flex', 
  justifyContent: 'space-between', 
  alignItems: 'center', 
  marginBottom: '30px' 
};

// Ye line missing thi jiski wajah se error aa raha tha
const headerActions = {
  display: 'flex',
  gap: '12px',
  alignItems: 'center'
};

const iconBox = { 
  padding: '12px', 
  background: '#4f46e5', 
  borderRadius: '12px', 
  fontSize: '20px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center'
};

const headerTitle = { margin: 0, fontSize: '22px', fontWeight: '700' };
const headerSub = { margin: 0, fontSize: '13px', color: '#64748b' };

const editorMainLayout = { 
  display: 'grid', 
  gridTemplateColumns: '250px minmax(0, 1fr) 320px', 
  gap: '24px',
  alignItems: 'start'
};

const leftRail = {
  display: 'flex',
  flexDirection: 'column',
  gap: '20px',
  position: 'sticky',
  top: '20px'
};

const profileCard = {
  background: 'rgba(15, 23, 42, 0.72)',
  border: '1px solid rgba(255,255,255,0.06)',
  borderRadius: '24px',
  padding: '20px',
  textAlign: 'center',
  boxShadow: '0 24px 60px rgba(2, 6, 23, 0.45)',
};
const profileAvatar = {
  width: '82px',
  height: '82px',
  margin: '0 auto 12px',
  borderRadius: '50%',
  background: 'linear-gradient(135deg, #2563eb, #7c3aed)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontSize: '28px',
  fontWeight: '800'
};
const profileName = { margin: 0, fontSize: '22px', fontWeight: '700' };
const profileRole = { margin: '6px 0', fontSize: '11px', color: '#60a5fa', textTransform: 'uppercase', fontWeight: '700' };
const profileMeta = { fontSize: '12px', color: '#94a3b8', marginTop: '6px' };

const railCard = {
  background: 'rgba(15, 23, 42, 0.72)',
  border: '1px solid rgba(255,255,255,0.06)',
  borderRadius: '20px',
  padding: '18px',
};
const railTitle = { fontSize: '12px', color: '#64748b', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '12px', fontWeight: '800' };
const railActiveBtn = {
  width: '100%',
  background: 'linear-gradient(135deg, #1d4ed8, #7c3aed)',
  border: 'none',
  color: '#fff',
  padding: '10px 14px',
  borderRadius: '12px',
  textAlign: 'left',
  fontWeight: '700',
  cursor: 'pointer',
  marginBottom: '10px',
};
const railButton = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  width: '100%',
  background: 'rgba(255,255,255,0.02)',
  border: '1px solid rgba(255,255,255,0.04)',
  borderRadius: '12px',
  color: '#cbd5e1',
  fontSize: '13px',
  padding: '10px 12px',
  cursor: 'pointer',
  marginBottom: '8px',
};
const tipList = {
  margin: 0,
  paddingLeft: '16px',
  display: 'flex',
  flexDirection: 'column',
  gap: '8px',
  color: '#94a3b8',
  fontSize: '12px',
  lineHeight: '1.5'
};
const templateBtn = {
  marginTop: '14px',
  width: '100%',
  background: 'rgba(59,130,246,0.12)',
  color: '#93c5fd',
  border: '1px solid rgba(59,130,246,0.25)',
  borderRadius: '12px',
  padding: '10px 12px',
  fontWeight: '700',
  cursor: 'pointer',
};

const writingSection = { 
  background: 'rgba(15, 23, 42, 0.6)', 
  padding: '24px', 
  borderRadius: '24px', 
  border: '1px solid rgba(255,255,255,0.05)',
  backdropFilter: 'blur(10px)'
};

const breadcrumbRow = { fontSize: '11px', color: '#64748b', marginBottom: '18px' };

const titleInput = { 
  background: 'transparent', 
  border: 'none', 
  fontSize: '32px', 
  fontWeight: '800', 
  color: '#fff', 
  width: '100%', 
  outline: 'none', 
  marginBottom: '20px' 
};

const permalinkRow = { display: 'flex', alignItems: 'center', gap: '10px', fontSize: '12px', color: '#94a3b8', marginBottom: '20px' };
const miniEditBtn = { background: 'none', border: 'none', color: '#60a5fa', cursor: 'pointer', fontSize: '12px', fontWeight: '700' };

const tagsRow = { display: 'flex', gap: '10px', marginBottom: '30px', flexWrap: 'wrap' };
const tagItem = { background: 'rgba(255,255,255,0.05)', padding: '6px 12px', borderRadius: '8px', fontSize: '12px', color: '#94a3b8', border: '1px solid rgba(255,255,255,0.1)' };
const btnAddTag = { background: 'transparent', border: '1px dashed #475569', color: '#475569', borderRadius: '8px', padding: '6px 12px', cursor: 'pointer' };
const tagInput = { background: 'transparent', border: '1px dashed #475569', color: '#94a3b8', borderRadius: '8px', padding: '6px 12px', minWidth: '120px', outline: 'none' };

const fieldGrid = { display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: '14px', marginBottom: '18px' };
const metaGrid = { display: 'grid', gridTemplateColumns: '1fr 1.3fr', gap: '14px', marginBottom: '20px' };
const fieldBlock = { display: 'flex', flexDirection: 'column', gap: '8px' };
const fieldLabel = { fontSize: '11px', color: '#94a3b8', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '1px' };
const glassInput = { background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(148,163,184,0.18)', color: '#f8fafc', borderRadius: '12px', padding: '12px 14px', outline: 'none' };
const glassInputStatic = { ...glassInput, color: '#e2e8f0' };
const metaTextArea = { ...glassInput, minHeight: '92px', resize: 'none' };
const selectWrap = { position: 'relative' };
const selectButton = { ...glassInput, width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(15,23,42,0.95)', cursor: 'pointer' };
const selectMenu = { position: 'absolute', top: 'calc(100% + 8px)', left: 0, right: 0, maxHeight: '280px', overflowY: 'auto', background: '#0f172a', border: '1px solid rgba(148,163,184,0.18)', borderRadius: '12px', padding: '8px', zIndex: 20, boxShadow: '0 16px 40px rgba(2,6,23,0.45)' };
const selectMenuItem = { width: '100%', textAlign: 'left', background: 'transparent', color: '#f8fafc', border: 'none', borderRadius: '8px', padding: '10px 12px', cursor: 'pointer' };
const selectMenuItemActive = { ...selectMenuItem, background: 'rgba(59,130,246,0.15)', color: '#93c5fd' };

const coverCard = { background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '18px', padding: '16px', marginBottom: '20px' };
const coverHeader = { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' };
const coverPlaceholder = { minHeight: '120px', borderRadius: '14px', border: '1px dashed rgba(148,163,184,0.22)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#cbd5e1', fontSize: '12px', textAlign: 'center', padding: '20px' };
const coverPreviewStyle = { width: '100%', maxHeight: '240px', objectFit: 'cover', borderRadius: '14px', border: '1px solid rgba(255,255,255,0.06)' };

const editorCanvas = { minHeight: '400px', display: 'flex', flexDirection: 'column' };
const toolbarPlaceholder = { background: '#182235', padding: '12px', borderRadius: '12px 12px 0 0', borderBottom: '1px solid rgba(255,255,255,0.1)', display: 'flex', gap: '10px', flexWrap: 'wrap' };
const toolbarBtn = { background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(148,163,184,0.18)', color: '#f8fafc', minWidth: '40px', padding: '8px 10px', borderRadius: '10px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '700' };
const mainEditor = { width: '100%', minHeight: '520px', background: 'rgba(2, 6, 23, 0.65)', color: '#f8fafc', fontSize: '18px', lineHeight: '1.75', outline: 'none', padding: '20px', borderRadius: '0 0 12px 12px', border: 'none' };
const statusBanner = { marginTop: '16px', borderRadius: '14px', border: '1px solid rgba(59,130,246,0.25)', background: 'rgba(37,99,235,0.1)', color: '#93c5fd', padding: '12px 14px', fontSize: '13px' };

const seoSidebar = { display: 'flex', flexDirection: 'column', gap: '20px', position: 'sticky', top: '30px' };
const statCard = { background: 'rgba(15, 23, 42, 0.6)', padding: '20px', borderRadius: '20px', border: '1px solid rgba(255,255,255,0.05)', backdropFilter: 'blur(10px)' };
const cardLabel = { fontSize: '12px', color: '#64748b', textTransform: 'uppercase', marginBottom: '15px', fontWeight: '800', letterSpacing: '1px' };
const scoreCircle = { width: '80px', height: '80px', borderRadius: '50%', border: '4px solid #10b981', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 10px', color: '#10b981' };

const progressRow = { marginBottom: '15px' };
const labelSmall = { fontSize: '11px', color: '#cbd5e1', display: 'block', marginBottom: '5px' };
const progressBar = { height: '6px', background: '#1e293b', borderRadius: '10px' };
const progressFill = { height: '100%', borderRadius: '10px' };
const microStat = { display: 'block', marginTop: '6px', color: '#64748b', fontSize: '10px' };

const metricGrid = { display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: '10px' };
const metricBox = { background: 'rgba(255,255,255,0.03)', borderRadius: '14px', padding: '12px', textAlign: 'center' };
const metricValue = { display: 'block', color: '#fff', fontWeight: '800', fontSize: '15px' };
const metricLabel = { display: 'block', color: '#64748b', fontSize: '10px', marginTop: '4px', textTransform: 'uppercase' };
const checkRow = { display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: '#cbd5e1', fontSize: '12px', padding: '10px 0', borderBottom: '1px solid rgba(255,255,255,0.05)' };

const btnDraft = { background: '#1e293b', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', padding: '10px 20px', borderRadius: '10px', cursor: 'pointer', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '8px' };
const btnPreview = { background: '#4f46e5', border: 'none', color: '#fff', padding: '10px 20px', borderRadius: '10px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: '600' };
const btnPublish = { background: 'linear-gradient(135deg, #4f46e5, #7c3aed)', border: 'none', color: '#fff', padding: '16px', borderRadius: '15px', fontWeight: '700', cursor: 'pointer', marginTop: '10px', boxShadow: '0 10px 20px -5px rgba(79, 70, 229, 0.4)' };
const sidebarActionBtn = { marginTop: '12px', width: '100%', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(148,163,184,0.18)', color: '#e2e8f0', padding: '10px 12px', borderRadius: '12px', cursor: 'pointer', fontWeight: '700' };

export default ArticleEditor;