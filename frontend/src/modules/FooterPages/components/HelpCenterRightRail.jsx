import React from 'react';
import { Link } from 'react-router-dom';
import {
  FiAlertCircle, FiBookOpen, FiGlobe, FiHeadphones, FiHeart, FiMail,
  FiMessageSquare, FiPlayCircle, FiZap,
} from 'react-icons/fi';
import { HELP_ASSIST } from '../data/helpCenterData';

const ICONS = {
  headphones: FiHeadphones,
  message: FiMessageSquare,
  mail: FiMail,
  book: FiBookOpen,
  play: FiPlayCircle,
  globe: FiGlobe,
  bug: FiAlertCircle,
  bulb: FiZap,
  heart: FiHeart,
};

export default function HelpCenterRightRail() {
  return (
    <div className="hc-rail">
      <section className="hc-rail__card">
        <p className="hc-rail__title">Need Assistance?</p>
        <div className="hc-rail__links">
          {HELP_ASSIST.map((item) => {
            const Icon = ICONS[item.icon] || FiHeadphones;
            const primary = item.id === 'contact';
            const external = String(item.to || '').startsWith('mailto:');
            if (external) {
              return (
                <a key={item.id} href={item.to} className={primary ? 'is-primary' : ''}>
                  <Icon size={14} aria-hidden /> {item.label}
                </a>
              );
            }
            return (
              <Link key={item.id} to={item.to} className={primary ? 'is-primary' : ''}>
                <Icon size={14} aria-hidden /> {item.label}
              </Link>
            );
          })}
        </div>
      </section>
    </div>
  );
}
