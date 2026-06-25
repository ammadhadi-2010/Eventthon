import React from 'react';
import FooterResourceConditionalFields from './FooterResourceConditionalFields';
import {
  FIELD_CLASS,
  FOOTER_CATEGORY_GROUPS,
  LABEL_CLASS,
  PANEL_CLASS,
} from './footerResourceConstants';
import { getFooterBlock } from '../../../../models/FooterResource';
import './footerResourceForm.css';

export default function FooterResourceFormPanel({
  formData,
  onChange,
  onSubmit,
  onReset,
  saving,
  editingId,
}) {
  const setField = (key) => (e) => onChange({ ...formData, [key]: e.target.value });
  const onMediaUploaded = (field, url) => onChange({ ...formData, [field]: url });

  return (
    <section className={PANEL_CLASS}>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <h2 className="text-sm font-bold text-white tracking-tight">
          {editingId ? 'Edit Footer Resource' : 'New Footer Resource'}
        </h2>
        {editingId ? (
          <button
            type="button"
            onClick={onReset}
            className="text-xs font-semibold text-slate-200 hover:text-white self-start"
          >
            Cancel edit
          </button>
        ) : null}
      </div>

      <div className="w-full flex flex-col gap-4">
        <div>
          <label className={LABEL_CLASS} htmlFor="footer-resource-category">Layout Category</label>
          <select
            id="footer-resource-category"
            className="fr-select"
            value={formData.category}
            onChange={setField('category')}
          >
            {FOOTER_CATEGORY_GROUPS.map((group) => (
              <optgroup key={group.id} label={group.label}>
                {group.items.map((item) => (
                  <option key={item} value={item}>{item}</option>
                ))}
              </optgroup>
            ))}
          </select>
          <p className="mt-1 text-xs text-slate-200">
            Block: <span className="text-cyan-300 font-semibold">{getFooterBlock(formData.category)}</span>
            {' · '}Fields adapt to sidebar, video, blog, pricing, careers, contact, or policy layouts.
          </p>
        </div>

        <div>
          <label className={LABEL_CLASS} htmlFor="footer-resource-title">Title</label>
          <input
            id="footer-resource-title"
            className={FIELD_CLASS}
            value={formData.title}
            onChange={setField('title')}
            placeholder="e.g. Getting Started Guide"
            maxLength={160}
          />
          <p className="mt-1 text-xs text-slate-200">Slug auto-generates from title on save.</p>
        </div>

        <FooterResourceConditionalFields
          formData={formData}
          onChange={onChange}
          onMediaUploaded={onMediaUploaded}
          saving={saving}
        />
      </div>

      <button
        type="button"
        onClick={onSubmit}
        disabled={saving}
        className="w-full rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-60 px-4 py-3 text-xs font-bold text-white"
      >
        {saving ? 'Saving...' : editingId ? 'Update Resource' : 'Create Resource'}
      </button>
    </section>
  );
}
