import React, { useMemo } from 'react';
import FormField from './FormField';
import {
  getProjectCategoryOptions,
  getProjectSubcategories,
} from '../utils/projectCategoryOptions';

export default function ProjectCategorySelects({ category, subCategory, onFieldChange }) {
  const categories = useMemo(() => getProjectCategoryOptions(), []);
  const subs = useMemo(() => getProjectSubcategories(category), [category]);

  return (
    <div className="cp-select-row">
      <FormField label="Project Category">
        <div className="cp-select-wrap">
          <select
            className="cp-select"
            value={category}
            onChange={(e) => onFieldChange('category', e.target.value)}
          >
            {categories.map((opt) => (
              <option key={opt.name} value={opt.name}>
                {opt.name}
              </option>
            ))}
          </select>
        </div>
      </FormField>
      <FormField label="Sub Category">
        <div className="cp-select-wrap">
          <select
            className="cp-select"
            value={subCategory}
            onChange={(e) => onFieldChange('subCategory', e.target.value)}
            disabled={!subs.length}
          >
            {subs.map((opt) => (
              <option key={opt.name} value={opt.name}>
                {opt.name}
              </option>
            ))}
          </select>
        </div>
      </FormField>
    </div>
  );
}
