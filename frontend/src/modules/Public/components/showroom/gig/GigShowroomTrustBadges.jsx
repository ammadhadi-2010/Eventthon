import React from 'react';
import { Clock, Headphones, Lock, ShieldCheck, ThumbsUp } from 'lucide-react';
import { GIG_TRUST_BADGES } from './gigShowroomUtils';

const ICONS = {
  secure: Lock,
  satisfaction: ThumbsUp,
  support: Headphones,
  verified: ShieldCheck,
  ontime: Clock,
};

export default function GigShowroomTrustBadges({ variant = 'row', badges }) {
  const items = badges?.length ? badges : GIG_TRUST_BADGES;
  const cls =
    variant === 'banner'
      ? 'ps-mp-trust-banner'
      : variant === 'aside'
        ? 'ps-mp-trust-aside'
        : 'ps-mp-trust-row';

  return (
    <div className={cls} aria-label="Trust badges">
      {items.map((badge) => {
        const key = badge.key || badge.label;
        const Icon = ICONS[badge.key] || ShieldCheck;
        return (
          <span key={key} className="ps-mp-trust-pill">
            <Icon size={variant === 'aside' ? 11 : 13} aria-hidden />
            {badge.label}
          </span>
        );
      })}
    </div>
  );
}
