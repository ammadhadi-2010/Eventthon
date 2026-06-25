import { useMemo } from 'react';
import { Country } from 'country-state-city';

export default function useLeadHunterGeo() {
  const countries = useMemo(
    () =>
      Country.getAllCountries()
        .map((row) => ({ value: row.isoCode, label: row.name }))
        .sort((a, b) => a.label.localeCompare(b.label)),
    [],
  );

  return { countries };
}
