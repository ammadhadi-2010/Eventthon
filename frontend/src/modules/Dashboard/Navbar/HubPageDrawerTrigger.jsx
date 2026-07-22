import React from 'react';
import { FiList } from 'react-icons/fi';
import { useLocation } from 'react-router-dom';
import { dispatchHubDrawerToggle, resolveHubFromPath } from './hubDrawerBus';

const HUB_LABELS = {
  home: 'Open home menu',
  squads: 'Open squads menu',
  projects: 'Open projects menu',
  gigs: 'Open gigs menu',
  jobs: 'Open jobs menu',
  wallet: 'Open wallet menu',
};

export default function HubPageDrawerTrigger({ className = '' }) {
  const { pathname } = useLocation();
  const hub = resolveHubFromPath(pathname);
  if (!hub) return null;

  return (
    <button
      type="button"
      className={`hub-drawer-trigger${className ? ` ${className}` : ''}`}
      onClick={() => dispatchHubDrawerToggle(hub)}
      aria-label={HUB_LABELS[hub] || 'Open page menu'}
    >
      <FiList size={18} aria-hidden />
    </button>
  );
}
