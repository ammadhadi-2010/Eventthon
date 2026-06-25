import React from 'react';
import { FiStar } from 'react-icons/fi';

export default function PublicGigShowcase({ data }) {
  return (
    <article className="public-showroom-card public-gig-showcase">
      <header>
        <p className="public-gig-category">{data.professionalRole}</p>
        <h1>{data.displayName}</h1>
        <div className="public-gig-meta">
          <span>From ${Number(data.startingPrice || 0).toLocaleString()}</span>
          <span>
            <FiStar size={12} /> {Number(data.rating || 0).toFixed(1)}
          </span>
          <span>{data.orders || 0} orders</span>
        </div>
      </header>
      <p className="public-bio">{data.dynamicBio}</p>
      {data.skillsArray?.length > 0 && (
        <div className="public-skills">
          {data.skillsArray.map((tag) => (
            <span key={tag} className="public-skill-pill">
              {tag}
            </span>
          ))}
        </div>
      )}
      {data.seller?.displayName && (
        <div className="public-seller">
          {data.seller.avatar ? <img src={data.seller.avatar} alt="" /> : null}
          <span>Offered by {data.seller.displayName}</span>
        </div>
      )}
    </article>
  );
}
