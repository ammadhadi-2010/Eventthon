import React from 'react';

export default function RelatedConnectorRow({ categories = [] }) {
  return (
    <div className="arc-row__connectors" aria-hidden>
      {categories.map((category) => (
        <div key={category.key} className="arc-row__connector-cell">
          <span className={`arc-row__bar arc-row__bar--${category.accent}`} />
          <span className={`arc-row__stem arc-row__stem--${category.accent}`} />
          <span className={`arc-row__dot arc-row__dot--${category.accent}`} />
        </div>
      ))}
    </div>
  );
}
