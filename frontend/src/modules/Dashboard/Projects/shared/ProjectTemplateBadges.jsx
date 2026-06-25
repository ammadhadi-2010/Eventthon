import React from 'react';
import '../styles/project-detail-view.css';

export default function ProjectTemplateBadges({ templateName, templateUses, category, subCategory }) {
  return (
    <div className="pdv-template-row">
      <div className="pdv-category-row">
        {category ? <span className="pdv-pill pdv-pill--category">{category}</span> : null}
        {subCategory ? <span className="pdv-pill pdv-pill--sub">{subCategory}</span> : null}
      </div>
      {templateName ? (
        <div className="pdv-template-meta">
          <span className="pdv-pill pdv-pill--template">{templateName}</span>
          <span className="pdv-pill pdv-pill--uses">
            {Number(templateUses || 0).toLocaleString()} uses
          </span>
        </div>
      ) : null}
    </div>
  );
}
