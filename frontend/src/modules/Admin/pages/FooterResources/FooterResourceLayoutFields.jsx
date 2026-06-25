import React from 'react';
import FooterMediaSubmitButton from './FooterMediaSubmitButton';
import {
  FooterField,
  FooterResourceImagePreview,
  FooterTextArea,
  FooterTextInput,
} from './FooterResourceFieldKit';

export default function FooterResourceLayoutFields({ formData, onChange, onMediaUploaded, saving, flags }) {
  const setField = (key) => (e) => onChange({ ...formData, [key]: e.target.value });
  const setNumber = (key) => (e) => onChange({ ...formData, [key]: Number(e.target.value) || 0 });

  return (
    <>
      {flags.showContent ? (
        <FooterField id="footer-resource-content" label="Content" hint="Rich text / HTML template blocks.">
          <FooterTextArea
            id="footer-resource-content"
            value={formData.content}
            onChange={setField('content')}
            placeholder="Resource body copy..."
            maxLength={12000}
            rows={6}
          />
        </FooterField>
      ) : null}

      {flags.showSidebarOrder ? (
        <FooterField id="footer-resource-sidebar-order" label="Sidebar Order" hint="Sort index for docs sidebar lists.">
          <FooterTextInput
            id="footer-resource-sidebar-order"
            type="number"
            value={String(formData.sidebarOrder ?? 0)}
            onChange={setNumber('sidebarOrder')}
            placeholder="0"
            maxLength={4}
          />
        </FooterField>
      ) : null}

      {flags.showExcerpt ? (
        <FooterField id="footer-resource-excerpt" label="Excerpt Summary" hint="Short summary for cards.">
          <FooterTextArea
            id="footer-resource-excerpt"
            value={formData.excerpt}
            onChange={setField('excerpt')}
            placeholder="Brief overview..."
            maxLength={2000}
            rows={3}
          />
        </FooterField>
      ) : null}

      {flags.showVideoUrl ? (
        <FooterField id="footer-resource-videourl" label="Video Stream Link" hint="Iframe embed URL.">
          <FooterTextInput
            id="footer-resource-videourl"
            value={formData.videourl}
            onChange={setField('videourl')}
            placeholder="https://youtube.com/embed/..."
            maxLength={500}
          />
        </FooterField>
      ) : null}

      {flags.showReadTime ? (
        <FooterField id="footer-resource-read-time" label="Read Time" hint="e.g. 5 min read">
          <FooterTextInput
            id="footer-resource-read-time"
            value={formData.readTime}
            onChange={setField('readTime')}
            placeholder="5 min read"
            maxLength={40}
          />
        </FooterField>
      ) : null}

      {flags.showAuthorName ? (
        <FooterField id="footer-resource-author" label="Author Name">
          <FooterTextInput
            id="footer-resource-author"
            value={formData.authorName}
            onChange={setField('authorName')}
            placeholder="Author display name"
            maxLength={120}
          />
        </FooterField>
      ) : null}

      {flags.showAuthorAvatar ? (
        <FooterField id="footer-resource-author-avatar" label="Author Avatar URL">
          <FooterTextInput
            id="footer-resource-author-avatar"
            value={formData.authorAvatarUrl}
            onChange={setField('authorAvatarUrl')}
            placeholder="https://..."
            maxLength={500}
          />
          <FooterResourceImagePreview imageurl={formData.authorAvatarUrl} alt="Author avatar" />
        </FooterField>
      ) : null}

      {flags.showImageUrl ? (
        <FooterField id="footer-resource-imageurl" label="Feature Cover Image URL">
          <FooterMediaSubmitButton onUploaded={onMediaUploaded} disabled={saving} />
          <FooterTextInput
            id="footer-resource-imageurl"
            value={formData.imageurl}
            onChange={setField('imageurl')}
            placeholder="https://..."
            maxLength={500}
          />
          <FooterResourceImagePreview imageurl={formData.imageurl} tall />
        </FooterField>
      ) : null}

      {flags.showExternalUrl ? (
        <FooterField id="footer-resource-external-url" label="External Redirect URL" hint="Off-site navigation link.">
          <FooterTextInput
            id="footer-resource-external-url"
            value={formData.externalUrl}
            onChange={setField('externalUrl')}
            placeholder="https://discord.gg/..."
            maxLength={500}
          />
        </FooterField>
      ) : null}
    </>
  );
}
