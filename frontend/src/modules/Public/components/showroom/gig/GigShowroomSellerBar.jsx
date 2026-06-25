import React from 'react';
import { Clock, Globe, Languages, MapPin, MessageCircle, Star } from 'lucide-react';

export default function GigShowroomSellerBar({ creator, rating, orders, deliveryDuration, sellerProfile }) {
  const profile = sellerProfile || {};
  const name = creator?.displayName || profile.displayName || 'Seller';
  const initial = name.charAt(0).toUpperCase();
  const level =
    creator?.level ||
    profile.level ||
    (creator?.verified ? 'Verified Seller' : 'Level 1 Seller');

  return (
    <div className="ps-mp-seller ps-mp-seller--rich">
      {creator?.avatar ? (
        <img src={creator.avatar} alt="" className="ps-mp-seller__photo" />
      ) : (
        <span className="ps-mp-seller__avatar ps-mp-seller__photo" aria-hidden>
          {initial}
        </span>
      )}
      <div className="ps-mp-seller__meta">
        <div className="ps-mp-seller__title-row">
          <strong>{name}</strong>
          <span className="ps-mp-seller__level">{level}</span>
        </div>
        <div className="ps-mp-seller__stats">
          <span>
            <Star size={12} aria-hidden /> {Number(rating || 4.9).toFixed(1)}
          </span>
          <span>{Number(orders || 0)} orders</span>
          <span>
            <Clock size={12} aria-hidden /> {deliveryDuration || 'Flexible delivery'}
          </span>
          {profile.responseTime ? (
            <span>
              <MessageCircle size={12} aria-hidden /> {profile.responseTime}
            </span>
          ) : null}
        </div>
        <div className="ps-mp-seller__locale">
          {profile.location ? (
            <span>
              <MapPin size={11} aria-hidden /> {profile.location}
            </span>
          ) : null}
          {profile.reach ? (
            <span>
              <Globe size={11} aria-hidden /> {profile.reach}
            </span>
          ) : null}
          {profile.languages?.length ? (
            <span>
              <Languages size={11} aria-hidden /> {profile.languages.join(', ')}
            </span>
          ) : null}
        </div>
      </div>
    </div>
  );
}
