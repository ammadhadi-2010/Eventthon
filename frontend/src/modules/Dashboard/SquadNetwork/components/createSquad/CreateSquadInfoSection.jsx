import React from 'react';
import { SQUAD_CATEGORIES } from './createSquadUtils';

export default function CreateSquadInfoSection({ form, errors, onChange }) {
  return (
    <section className="cs-section">
      <header className="cs-section__head">
        <span className="cs-section__num">1</span>
        <div>
          <h3>Squad Information</h3>
          <p>Basic details for your new squad.</p>
        </div>
      </header>

      <label className="cs-field">
        <span>
          Squad Name <em>*</em>
        </span>
        <input
          type="text"
          maxLength={50}
          placeholder="e.g. SEO Masters"
          value={form.name}
          onChange={(e) => onChange('name', e.target.value)}
          className={errors.name ? 'is-error' : ''}
        />
        <small>{form.name.length}/50</small>
        {errors.name ? <p className="cs-error">{errors.name}</p> : null}
      </label>

      <label className="cs-field">
        <span>
          Category <em>*</em>
        </span>
        <select
          value={form.category}
          onChange={(e) => onChange('category', e.target.value)}
          className={errors.category ? 'is-error' : ''}
        >
          <option value="">Select a category</option>
          {SQUAD_CATEGORIES.map((cat) => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
        </select>
        {errors.category ? <p className="cs-error">{errors.category}</p> : null}
      </label>

      <label className="cs-field">
        <span>
          Squad Description <em>*</em>
        </span>
        <textarea
          rows={4}
          maxLength={200}
          placeholder="Describe your squad's purpose and goals..."
          value={form.description}
          onChange={(e) => onChange('description', e.target.value)}
          className={errors.description ? 'is-error' : ''}
        />
        <small>{form.description.length}/200</small>
        {errors.description ? <p className="cs-error">{errors.description}</p> : null}
      </label>
    </section>
  );
}
