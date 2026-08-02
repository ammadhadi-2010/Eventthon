import React from 'react';
import { FiFilm } from 'react-icons/fi';
import FooterCtaAside from './FooterCtaAside';
import { POPULAR_TUTORIALS } from '../data/tutorialsData';

export default function TutorialsRightRail({ onOpen, popular = POPULAR_TUTORIALS }) {
  const items = popular?.length ? popular : POPULAR_TUTORIALS;

  return (
    <div className="tut-rail">
      <FooterCtaAside />

      <section className="tut-rail__card tut-rail__watch">
        <div className="tut-rail__watch-art" aria-hidden>
          <FiFilm size={28} />
        </div>
        <p className="tut-rail__title" style={{ textAlign: 'center' }}>Watch &amp; Learn</p>
        <p className="tut-rail__copy">Short video lessons for squads, gigs, jobs, and wallet workflows.</p>
        <button
          type="button"
          className="tut-rail__cta"
          onClick={() => document.getElementById('all-tutorials')?.scrollIntoView({ behavior: 'smooth' })}
        >
          View All Videos →
        </button>
      </section>

      <section className="tut-rail__card">
        <p className="tut-rail__title">Popular Tutorials</p>
        <ol className="tut-rail__popular">
          {items.slice(0, 5).map((item, index) => (
            <li key={item.id}>
              <button type="button" onClick={() => onOpen?.(item.id)}>
                <span className="tut-rail__num">{String(index + 1).padStart(2, '0')}</span>
                <span>
                  <strong>{item.title}</strong>
                  <em>{item.meta}</em>
                </span>
              </button>
            </li>
          ))}
        </ol>
      </section>
    </div>
  );
}
