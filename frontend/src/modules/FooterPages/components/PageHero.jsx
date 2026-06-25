import React from 'react';
import FooterPageHeader from './FooterPageHeader';

export default function PageHero({
  title,
  subtitle,
  sectionIds,
  activeSectionIndex = 0,
  onSectionStep,
}) {
  return (
    <>
      <FooterPageHeader
        title={title}
        sectionIds={sectionIds}
        activeSectionIndex={activeSectionIndex}
        onSectionStep={onSectionStep}
      />
      {subtitle ? (
        <div className="fp-hero-sub">
          <p>{subtitle}</p>
        </div>
      ) : null}
    </>
  );
}
