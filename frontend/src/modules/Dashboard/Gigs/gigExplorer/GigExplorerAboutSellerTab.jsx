import React from 'react';
import { FiStar } from 'react-icons/fi';

const GigExplorerAboutSellerTab = ({ selectedGig }) => (
  <div className="gigx-about-card gigx-about-seller-panel">
    <h3>About the seller</h3>
    <div className="gigx-seller-panel-head">
      <div className="gigx-avatar gigx-avatar--lg">{selectedGig.sellerAvatarInitial}</div>
      <div>
        <p className="gigx-seller-panel-name">{selectedGig.sellerName}</p>
        <p className="gigx-seller-panel-meta">{selectedGig.sellerLevel} · {selectedGig.category}</p>
        <p className="gigx-seller-panel-rating"><FiStar size={12} /> {selectedGig.rating} overall ({selectedGig.reviews} completed orders)</p>
      </div>
    </div>
    <div className="gigx-seller-facts">
      <div><span>Languages</span><strong>English</strong></div>
      <div><span>Response time</span><strong>Within 24 hours</strong></div>
      <div><span>Member since</span><strong>2024</strong></div>
    </div>
    <p className="gigx-seller-bio">
      {selectedGig.description}
    </p>
    <div className="gigx-tags">
      {(selectedGig.tags.length ? selectedGig.tags : ['General']).map((tag) => <span key={tag}>{tag}</span>)}
    </div>
  </div>
);

export default GigExplorerAboutSellerTab;
