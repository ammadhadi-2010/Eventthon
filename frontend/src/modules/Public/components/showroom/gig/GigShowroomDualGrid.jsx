import React, { useEffect, useMemo, useState } from 'react';
import GigShowroomMainColumn from './GigShowroomMainColumn';
import GigShowroomAside from './GigShowroomAside';
import { buildGigPackages } from './gigShowroomUtils';

export default function GigShowroomDualGrid({ data, isGuest }) {
  const packages = useMemo(() => buildGigPackages(data), [data]);
  const defaultId = packages.find((p) => p.popular)?.id || packages[0]?.id || 'standard';
  const [selectedId, setSelectedId] = useState(defaultId);
  const selectedPackage = packages.find((p) => p.id === selectedId) || packages[0];

  useEffect(() => {
    setSelectedId(defaultId);
  }, [defaultId]);

  return (
    <div className="ps-mp-grid ps-mp-grid--gig flex flex-col lg:flex-row w-full min-w-0 gap-6 items-start justify-start">
      <GigShowroomMainColumn
        packages={packages}
        selectedId={selectedId}
        onSelectPackage={setSelectedId}
        isGuest={isGuest}
      />
      <GigShowroomAside
        selectedPackage={selectedPackage}
        isGuest={isGuest}
        gigId={data.gigId || data.publicSlug}
      />
    </div>
  );
}
