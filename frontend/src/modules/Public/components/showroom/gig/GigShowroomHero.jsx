import React from 'react';
import GigShowroomPreview from './GigShowroomPreview';
import GigShowroomHeroCopy from './GigShowroomHeroCopy';

export default function GigShowroomHero({ data, publicPath }) {
  return (
    <section
      className="ps-gig-hero-row flex flex-col lg:flex-row w-full gap-6 items-start justify-start"
      aria-label="Gig overview"
    >
      <GigShowroomPreview data={data} />
      <GigShowroomHeroCopy data={data} publicPath={publicPath} />
    </section>
  );
}
