import React from 'react';

export default function WizardTemplateCard({ template, selected, onSelect }) {
  const handleKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onSelect(template);
    }
  };

  return (
    <article
      className={`cp-tpl-card${selected ? ' is-selected' : ''}`}
      role="button"
      tabIndex={0}
      onClick={() => onSelect(template)}
      onKeyDown={handleKeyDown}
      aria-pressed={selected}
    >
      <div className="cp-tpl-card__media">
        <img src={template.imageUrl} alt="" className="cp-tpl-card__img" loading="lazy" />
      </div>
      <div className="cp-tpl-card__body">
        <h3 className="cp-tpl-card__title">{template.title}</h3>
        <p className="cp-tpl-card__cat">{template.category}</p>
        <p className="cp-tpl-card__uses">{template.uses} uses</p>
      </div>
    </article>
  );
}
