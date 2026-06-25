import React from 'react';
import GigShowroomPackages from './GigShowroomPackages';

export default function GigShowroomMainColumn({
  packages,
  selectedId,
  onSelectPackage,
  isGuest,
}) {
  return (
    <div className="ps-mp-grid__main w-full lg:w-[62%] min-w-0">
      <GigShowroomPackages
        packages={packages}
        selectedId={selectedId}
        onSelect={onSelectPackage}
        isGuest={isGuest}
      />
    </div>
  );
}
