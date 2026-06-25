import React from 'react';

const GigExplorerFaqTab = ({ faqItems }) => (
  <div className="gigx-faq-panel">
    {faqItems.map((item) => (
      <details key={item.q} className="gigx-faq-item">
        <summary>{item.q}</summary>
        <p>{item.a}</p>
      </details>
    ))}
  </div>
);

export default GigExplorerFaqTab;
