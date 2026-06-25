import React from 'react';
import GigShowroomSellerBar from './GigShowroomSellerBar';
import GigShowroomHeroActions from './GigShowroomHeroActions';

export default function GigShowroomHeroCopy({ data, publicPath }) {
  const creator = data.creatorBadge || data.seller || {};
  const title = data.gigTitle || data.displayName;
  const category = data.breadcrumbCategory || data.professionalRole;

  return (
    <div className="ps-gig-hero-copy w-full lg:w-[35%] min-w-0">
      {category ? <span className="ps-mp-badge">{category}</span> : null}
      <h1>{title}</h1>
      <GigShowroomSellerBar
        creator={creator}
        rating={data.rating}
        orders={data.orders}
        deliveryDuration={data.deliveryDuration}
        sellerProfile={data.sellerProfile}
      />
      <GigShowroomHeroActions publicPath={publicPath} />
    </div>
  );
}
