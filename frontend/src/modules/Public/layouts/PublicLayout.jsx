import React from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import '../styles/publicViews.css';

export default function PublicLayout() {
  const { pathname } = useLocation();
  const isSquadShowroom = /\/public\/squads\/[^/]+/.test(pathname);

  return (
    <div className={`public-layout${isSquadShowroom ? ' public-layout--squad' : ''}`}>
      <header className="public-header">
        <Link to="/auth/login" className="public-logo">
          EVENTTHON
        </Link>
        <nav>
          <Link to="/auth/login">Sign in</Link>
          <Link to="/auth/register" className="public-cta">
            Join Network
          </Link>
        </nav>
      </header>
      <main className={`public-main${isSquadShowroom ? ' public-main--squad' : ' public-main--wide'}`}>
        <Outlet />
      </main>
      <footer className="public-footer">
        <p>Public showcase · EventThon Network</p>
      </footer>
    </div>
  );
}
