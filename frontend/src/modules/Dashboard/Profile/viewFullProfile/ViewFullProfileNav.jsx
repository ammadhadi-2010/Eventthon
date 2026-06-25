import React from 'react';
import { Link } from 'react-router-dom';
import {
  Eye,
  LayoutDashboard,
  Briefcase,
  ShoppingBag,
  MessageSquare,
  FolderKanban,
  Users,
  BarChart3,
  Wallet,
  Star,
  Bookmark,
  Settings,
} from 'lucide-react';

const ITEMS = [
  { to: '/profile', label: 'Overview', Icon: LayoutDashboard, rr: true },
  { to: '#', label: 'My gigs', Icon: Briefcase, rr: false },
  { to: '#', label: 'Orders', Icon: ShoppingBag, rr: false },
  { to: '#', label: 'Messages', Icon: MessageSquare, rr: false },
  { to: '#', label: 'Projects', Icon: FolderKanban, rr: false },
  { to: '#', label: 'Squads', Icon: Users, rr: false },
  { to: '#', label: 'Analytics', Icon: BarChart3, rr: false },
  { to: '#', label: 'Earnings', Icon: Wallet, rr: false },
  { to: '#', label: 'Reviews', Icon: Star, rr: false },
  { to: '#', label: 'Bookmarks', Icon: Bookmark, rr: false },
  { to: '/profile/edit', label: 'Settings', Icon: Settings, rr: true },
];

export default function ViewFullProfileNav() {
  return (
    <nav className="vfps-nav" aria-label="Workspace">
      <div className="vfps-nav__scroll">
        {ITEMS.map(({ to, label, Icon, rr }) =>
          rr ? (
            <Link key={label} to={to} className="vfps-nav__link">
              <Icon size={18} strokeWidth={2} />
              {label}
            </Link>
          ) : (
            <a key={label} href={to} className="vfps-nav__link" onClick={(e) => e.preventDefault()}>
              <Icon size={18} strokeWidth={2} />
              {label}
            </a>
          ),
        )}
      </div>
      <div className="vfps-nav__foot">
        <Link to="/profile/view" className="vfps-nav__link vfps-nav__link--active">
          <Eye size={18} strokeWidth={2} />
          View full profile
        </Link>
      </div>
    </nav>
  );
}
