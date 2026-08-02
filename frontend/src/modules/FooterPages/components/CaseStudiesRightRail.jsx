import React from 'react';
import { Link } from 'react-router-dom';
import { FiAward, FiBookOpen, FiTrendingUp, FiUsers, FiZap } from 'react-icons/fi';
import FooterCtaAside from './FooterCtaAside';
import { CASE_HIGHLIGHTS } from '../data/caseStudiesData';

const ICONS = {
  proven: FiTrendingUp,
  insights: FiBookOpen,
  diverse: FiUsers,
  grow: FiZap,
};

export default function CaseStudiesRightRail() {
  return (
    <div className="cs-rail">
      <FooterCtaAside />

      <section className="cs-rail__card">
        <p className="cs-rail__title">Case Study Highlights</p>
        <ul className="cs-rail__list">
          {CASE_HIGHLIGHTS.map((item) => {
            const Icon = ICONS[item.id] || FiAward;
            return (
              <li key={item.id}>
                <span className="cs-rail__icon" aria-hidden><Icon size={14} /></span>
                <span>
                  <strong>{item.title}</strong>
                  <span>{item.copy}</span>
                </span>
              </li>
            );
          })}
        </ul>
      </section>

      <section className="cs-rail__card cs-rail__submit">
        <p className="cs-rail__title">Have a success story?</p>
        <p>Share how EventThon helped your squad, gig, or nonprofit grow.</p>
        <Link to="/company/contact" className="cs-rail__cta">Submit Your Case →</Link>
      </section>
    </div>
  );
}
