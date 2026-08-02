import React from 'react';
import { Link } from 'react-router-dom';
import { FiPlayCircle } from 'react-icons/fi';
import FooterCtaAside from './FooterCtaAside';
import { POPULAR_GUIDES } from '../data/guidesData';

export default function GuidesRightRail({ onOpenGuide }) {
  return (
    <div className="guides-rail">
      <FooterCtaAside />

      <section className="guides-rail__card">
        <p className="guides-rail__title">Popular Guides</p>
        <ol className="guides-rail__popular">
          {POPULAR_GUIDES.map((item, index) => (
            <li key={item.id}>
              <button type="button" onClick={() => onOpenGuide?.(item.id)}>
                <span className="guides-rail__num">{index + 1}</span>
                <span>
                  <strong>{item.title}</strong>
                  <em>{item.meta}</em>
                </span>
              </button>
            </li>
          ))}
        </ol>
        <Link to="/resources/guides" className="guides-rail__view-all">
          View All Guides
        </Link>
      </section>

      <section className="guides-rail__card guides-rail__video">
        <p className="guides-rail__title">
          <FiPlayCircle size={14} aria-hidden /> Watch Video Tutorials
        </p>
        <p className="guides-rail__copy">Short lessons for squads, gigs, jobs, and wallet workflows.</p>
        <Link to="/resources/tutorials" className="guides-rail__cta">
          Browse Videos
        </Link>
      </section>
    </div>
  );
}
