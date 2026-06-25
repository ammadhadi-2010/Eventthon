import React from 'react';
import { Link } from 'react-router-dom';
import { Code2, LineChart, Palette, PenLine, TestTube2 } from 'lucide-react';
import { COLLAB_GLOWS } from '../../utils/showroomBrandIcons';

const TILE_ICONS = [Code2, LineChart, Palette, PenLine, TestTube2];

export default function ShowroomGuestCta({
  title,
  bullets = [],
  actionLabel = 'Sign in to Collaborate',
  variant = 'list',
}) {
  return (
    <section className="ps-guest-cta ps-guest-cta--glass" aria-label="Collaboration invitation">
      <h2>{title}</h2>
      {variant === 'tiles' && bullets.length > 0 ? (
        <div className="ps-collab-tiles">
          {bullets.map((item, idx) => {
            const Icon = TILE_ICONS[idx % TILE_ICONS.length];
            const glow = COLLAB_GLOWS[idx % COLLAB_GLOWS.length];
            return (
              <div
                key={item}
                className={`ps-collab-tile ps-collab-tile--${glow.tone}`}
                style={{ '--tile-glow': glow.gradient }}
              >
                <span className="ps-collab-tile__icon" aria-hidden>
                  <Icon size={18} />
                </span>
                <span>{item}</span>
              </div>
            );
          })}
        </div>
      ) : bullets.length > 0 ? (
        <ul>
          {bullets.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      ) : null}
      <Link to="/auth/login" className="ps-btn ps-btn--primary ps-btn--wide">
        {actionLabel}
      </Link>
    </section>
  );
}
