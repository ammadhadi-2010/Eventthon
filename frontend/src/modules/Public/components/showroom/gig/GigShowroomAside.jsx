import React from 'react';
import { Link } from 'react-router-dom';
import { Clock, Lock, RefreshCw, ShoppingCart } from 'lucide-react';

export default function GigShowroomAside({ selectedPackage, isGuest, gigId }) {
  const pkg = selectedPackage;
  const tierQuery = pkg?.id ? `?package=${encodeURIComponent(pkg.id)}` : '';
  const orderPath = `/gigs/${gigId || ''}/order${tierQuery}`;

  return (
    <aside className="ps-mp-grid__aside w-full lg:w-[35%] min-w-0" aria-label="Order summary">
      <div className="ps-mp-card ps-mp-card--glow ps-mp-order-panel">
        <h2>Order Summary</h2>
        <p className="ps-mp-order-package-label">{pkg?.name || 'Standard'} Package</p>
        <p className="ps-mp-order-price">${pkg?.price ?? 0}</p>
        <div className="ps-mp-order-line">
          <span>
            <Clock size={12} aria-hidden /> Delivery Time
          </span>
          <span>{pkg?.deliveryDays ?? 5} Days</span>
        </div>
        <div className="ps-mp-order-line">
          <span>
            <RefreshCw size={12} aria-hidden /> Revisions
          </span>
          <span>{pkg?.revisions ?? 1}</span>
        </div>
        <div className="ps-mp-order-total">
          <span>Total</span>
          <span>${pkg?.price ?? 0}</span>
        </div>
        <div className="ps-mp-cta">
          {isGuest ? (
            <Link to="/auth/login" className="ps-btn ps-btn--primary ps-btn--wide ps-mp-cta-order">
              <ShoppingCart size={16} aria-hidden />
              Sign in to Order
            </Link>
          ) : (
            <Link to={orderPath} className="ps-btn ps-btn--primary ps-btn--wide ps-mp-cta-order">
              <ShoppingCart size={16} aria-hidden />
              Continue Order
            </Link>
          )}
        </div>
        <Link to={isGuest ? '/auth/login' : '/messages'} className="ps-mp-secondary-btn">
          Contact Seller
        </Link>
        <p className="ps-mp-escrow">
          <Lock size={11} aria-hidden /> Secure Payment / Escrow Protected
        </p>
      </div>
    </aside>
  );
}
