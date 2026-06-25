import React from 'react';
import useShowroomAuth from '../../../hooks/useShowroomAuth';
import ShowroomActionBar from '../ShowroomActionBar';
import GigShowroomHero from './GigShowroomHero';
import GigShowroomDualGrid from './GigShowroomDualGrid';
import GigShowroomBottom from './GigShowroomBottom';
import { truncateTitle } from './gigShowroomUtils';
import '../../../styles/showroom-premium.css';
import '../../../styles/showroom-marketplace.css';
import '../../../styles/showroom-gig-mobile.css';

export default function GigShowroomView({ data, forceGuest = false }) {
  const { isGuest, canManage } = useShowroomAuth(forceGuest);
  const slug = data.publicSlug || data.gigId;
  const publicPath = `/public/gigs/${slug}`;
  const category = data.breadcrumbCategory || data.professionalRole || 'Marketplace';
  const title = data.gigTitle || data.displayName;

  return (
    <div className="ps-page ps-page--marketplace">
      <nav className="ps-breadcrumb" aria-label="Breadcrumb">
        <span>Gigs</span>
        <span aria-hidden>›</span>
        <span>{category}</span>
        <span aria-hidden>›</span>
        <span>{truncateTitle(title, 42)}</span>
      </nav>

      <ShowroomActionBar
        publicPath={publicPath}
        managePath={`/gigs/explorer?gig=${encodeURIComponent(data.publicSlug || data.gigId)}`}
        canManage={canManage}
        badge="Public Gig"
      />

      <GigShowroomHero data={data} publicPath={publicPath} />
      <GigShowroomDualGrid data={data} isGuest={isGuest} />
      <GigShowroomBottom data={data} rating={data.rating} />
    </div>
  );
}
