import React from 'react';
import { FiX } from 'react-icons/fi';
import { saveJobsBrowseFilters } from '../utils/jobsBrowseSession';

export default function JobsBrowseCompanyChip({ searchFilters, setSearchFilters }) {
  const company = String(searchFilters?.company || '').trim();
  if (!company) return null;

  const clear = () => {
    setSearchFilters(
      saveJobsBrowseFilters({
        ...searchFilters,
        company: '',
        listingKind: searchFilters.listingKind === 'company' ? '' : searchFilters.listingKind,
      }),
    );
  };

  return (
    <div className="jh-company-filter-chip" role="status">
      <span>
        Jobs at <strong>{company}</strong>
      </span>
      <button type="button" onClick={clear} aria-label={`Clear filter for ${company}`}>
        <FiX size={14} aria-hidden />
      </button>
    </div>
  );
}
