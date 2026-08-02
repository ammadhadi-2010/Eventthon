import React from 'react';
import { Link } from 'react-router-dom';
import { FiBriefcase, FiUsers, FiZap } from 'react-icons/fi';

const BENEFITS = [
  { icon: FiUsers, text: 'Join squads & collaborate with creators' },
  { icon: FiBriefcase, text: 'Post gigs, find work, and grow your portfolio' },
  { icon: FiZap, text: 'Free to join — built for freelancers & developers' },
];

export default function GuestWelcomeBanner() {
  return (
    <section className="guest-welcome-banner" aria-label="Join EventThon">
      <div className="guest-welcome-banner__glow" aria-hidden />
      <p className="guest-welcome-banner__eyebrow">Pakistan&apos;s creator &amp; freelancer network</p>
      <h2 className="guest-welcome-banner__title">Squads. Gigs. Projects. One platform.</h2>
      <p className="guest-welcome-banner__sub">
        EventThon par apna professional network banayein — bilkul free. Pehle 100 members ko early access milega.
      </p>
      <ul className="guest-welcome-banner__list">
        {BENEFITS.map(({ icon: Icon, text }) => (
          <li key={text}>
            <Icon size={16} aria-hidden />
            <span>{text}</span>
          </li>
        ))}
      </ul>
      <div className="guest-welcome-banner__actions">
        <Link to="/auth/signin" className="guest-welcome-banner__cta guest-welcome-banner__cta--primary">
          Join free — Create account
        </Link>
        <Link to="/auth/login" className="guest-welcome-banner__cta guest-welcome-banner__cta--ghost">
          Log in
        </Link>
      </div>
    </section>
  );
}
