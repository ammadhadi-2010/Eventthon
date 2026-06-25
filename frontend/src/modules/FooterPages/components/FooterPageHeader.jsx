import React, { useCallback } from 'react';
import { FiArrowLeft, FiChevronDown, FiChevronUp } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import '../styles/footer-page-header.css';

function getScrollRoot() {
  return (
    document.querySelector('.fp-layout__center') ||
    document.querySelector('main.et-main-scroll') ||
    window
  );
}

export default function FooterPageHeader({
  title,
  sectionIds,
  activeSectionIndex = 0,
  onSectionStep,
}) {
  const navigate = useNavigate();

  const goBack = useCallback(() => {
    if (window.history.length > 1) window.history.back();
    else navigate('/dashboard');
  }, [navigate]);

  const scrollUp = useCallback(() => {
    if (sectionIds?.length && onSectionStep) {
      onSectionStep(-1);
      return;
    }
    const root = getScrollRoot();
    if (root === window) window.scrollTo({ top: 0, behavior: 'smooth' });
    else root.scrollTo({ top: 0, behavior: 'smooth' });
  }, [sectionIds, onSectionStep]);

  const scrollDown = useCallback(() => {
    if (sectionIds?.length && onSectionStep) {
      onSectionStep(1);
      return;
    }
    const root = getScrollRoot();
    const delta = root === window ? window.innerHeight * 0.75 : root.clientHeight * 0.75;
    if (root === window) window.scrollBy({ top: delta, behavior: 'smooth' });
    else root.scrollBy({ top: delta, behavior: 'smooth' });
  }, [sectionIds, onSectionStep]);

  const atStart = sectionIds?.length ? activeSectionIndex <= 0 : false;
  const atEnd = sectionIds?.length ? activeSectionIndex >= sectionIds.length - 1 : false;

  return (
    <header className="fp-page-header" aria-label={`${title} page header`}>
      <div className="fp-page-header__left">
        <button
          type="button"
          className="fp-page-header__back"
          onClick={goBack}
          aria-label="Go back"
        >
          <FiArrowLeft size={16} aria-hidden />
        </button>
        <h1 className="fp-page-header__title">{title}</h1>
      </div>
      <div className="fp-page-header__toggles">
        <button
          type="button"
          className="fp-page-header__toggle fp-page-header__toggle--up"
          onClick={scrollUp}
          disabled={atStart}
          aria-label="Previous section or scroll up"
        >
          <FiChevronUp size={18} aria-hidden />
        </button>
        <button
          type="button"
          className="fp-page-header__toggle fp-page-header__toggle--down"
          onClick={scrollDown}
          disabled={atEnd}
          aria-label="Next section or scroll down"
        >
          <FiChevronDown size={18} aria-hidden />
        </button>
      </div>
    </header>
  );
}
