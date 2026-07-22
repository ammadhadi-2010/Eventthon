import React from 'react';
import RelatedCategoryCard from './RelatedCategoryCard';
import RelatedConnectorRow from './RelatedConnectorRow';

export default function RelatedContentRow({
  categories = [],
  related = {},
  userData,
  onAdd,
  onRemove,
  showConnectors = true,
}) {
  return (
    <div className="arc-row">
      {showConnectors ? <RelatedConnectorRow categories={categories} /> : null}
      <div className="arc-row__cards">
        {categories.map((category) => (
          <RelatedCategoryCard
            key={category.key}
            category={category}
            items={related[category.key] || []}
            userData={userData}
            onAdd={(row) => onAdd(category.key, row)}
            onRemove={(id) => onRemove(category.key, id)}
          />
        ))}
      </div>
    </div>
  );
}
