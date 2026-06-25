import React, { useRef, useState } from 'react';
import { FiBriefcase, FiSearch } from 'react-icons/fi';
import { GLOBAL_SERVICE_CATEGORY_OPTIONS } from '../../../../data/globalCategories';
import { loadBrowseFilters, saveBrowseFilters } from '../utils/gigsBrowseSession';
import GigsHeroMobileActionBar from './GigsHeroMobileActionBar';
import GigsFilterFloatingDrop from './GigsFilterFloatingDrop';
import {
  CategoryFilterButton,
  ExperienceLevelFilterButton,
  JobTypeFilterButton,
  LocationFilterButton,
  SalaryRangeFilterButton,
  FiltersButton,
  CategoryFilterPanel,
  ExperienceLevelFilterPanel,
  JobTypeFilterPanel,
  LocationFilterPanel,
  SalaryRangeFilterPanel,
  AdvancedFiltersPanel,
} from './filters';

const GigsBrowseHeroCard = ({
  searchTerm = '',
  onSearchTermChange,
  onSearch,
  onFiltersApplied,
  activeSection,
  onSectionSelect,
  onCreateGig,
}) => {
  const [activeFilter, setActiveFilter] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(() => loadBrowseFilters().category || '');
  const categoryItems = GLOBAL_SERVICE_CATEGORY_OPTIONS.slice(0, 12);
  const categoryRef = useRef(null);
  const experienceRef = useRef(null);
  const jobTypeRef = useRef(null);
  const locationRef = useRef(null);
  const salaryRef = useRef(null);
  const filtersRef = useRef(null);

  const closeFilter = () => setActiveFilter('');
  const categoryLabel = selectedCategory || 'Category';

  const runHeroSearch = () => {
    if (typeof onSearch === 'function') onSearch(searchTerm);
  };

  const onAppliedPanel = () => {
    closeFilter();
    if (typeof onFiltersApplied === 'function') onFiltersApplied();
  };

  const pickCategory = (name) => {
    saveBrowseFilters({ category: name || '' });
    setSelectedCategory(name || '');
    closeFilter();
    if (typeof onFiltersApplied === 'function') onFiltersApplied();
  };

  const toggleFilter = (key) => {
    setActiveFilter((current) => (current === key ? '' : key));
  };

  return (
    <div className="gigs-card gigs-hero-card">
      <div className="gigs-hero-header">
        <div className="gigs-hero-header__copy">
          <h2 className="gigs-hero-title">Find the right talent for every task</h2>
          <p className="gigs-hero-subtitle">Explore trusted freelancers and get work done.</p>
        </div>
        <div className="gigs-hero-icon-wrap" aria-hidden="true">
          <FiBriefcase size={26} />
        </div>
      </div>

      <GigsHeroMobileActionBar
        activeSection={activeSection}
        onSectionSelect={onSectionSelect}
        onCreateGig={onCreateGig}
      />

      <div className="gigs-hero-search-row">
        <div className="gigs-search-wrap">
          <FiSearch className="gigs-search-icon" aria-hidden />
          <input
            type="text"
            className="gigs-search-input"
            placeholder="What service are you looking for?"
            value={searchTerm}
            onChange={(event) => onSearchTermChange?.(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === 'Enter') runHeroSearch();
            }}
          />
          <button type="button" className="gigs-search-btn-inline" aria-label="Search" onClick={runHeroSearch}>
            <FiSearch size={14} aria-hidden />
          </button>
        </div>
        <button type="button" className="gigs-search-btn gigs-search-btn--desktop" onClick={runHeroSearch}>
          Search
        </button>
      </div>

      <div className="gigs-filter-row">
        <div ref={categoryRef} className="gigs-filter-pop-wrap gigs-filter-pop-wrap--category">
          <CategoryFilterButton
            label={categoryLabel}
            isActive={activeFilter === 'category'}
            onClick={() => toggleFilter('category')}
          />
          {activeFilter === 'category' ? (
            <div className="gigs-filter-popover gigs-filter-popover--desktop">
              <CategoryFilterPanel onApplied={onAppliedPanel} />
            </div>
          ) : null}
          <GigsFilterFloatingDrop open={activeFilter === 'category'} anchorRef={categoryRef}>
            <div className="gigs-filter-mobile-drop" role="listbox" aria-label="Categories">
              <button type="button" className="gigs-filter-mobile-drop__item" onClick={() => pickCategory('')}>
                All Categories
              </button>
              {categoryItems.map((item) => (
                <button
                  key={item.name}
                  type="button"
                  role="option"
                  className={`gigs-filter-mobile-drop__item${
                    selectedCategory === item.name ? ' is-active' : ''
                  }`}
                  onClick={() => pickCategory(item.name)}
                >
                  {item.name}
                </button>
              ))}
            </div>
          </GigsFilterFloatingDrop>
        </div>

        <div ref={experienceRef} className="gigs-filter-pop-wrap">
          <ExperienceLevelFilterButton
            isActive={activeFilter === 'experience'}
            onClick={() => toggleFilter('experience')}
          />
          {activeFilter === 'experience' ? (
            <div className="gigs-filter-popover gigs-filter-popover--desktop">
              <ExperienceLevelFilterPanel onApplied={onAppliedPanel} />
            </div>
          ) : null}
          <GigsFilterFloatingDrop open={activeFilter === 'experience'} anchorRef={experienceRef}>
            <div className="gigs-filter-popover gigs-filter-popover--mobile">
              <ExperienceLevelFilterPanel onApplied={onAppliedPanel} />
            </div>
          </GigsFilterFloatingDrop>
        </div>

        <div ref={jobTypeRef} className="gigs-filter-pop-wrap">
          <JobTypeFilterButton isActive={activeFilter === 'jobType'} onClick={() => toggleFilter('jobType')} />
          {activeFilter === 'jobType' ? (
            <div className="gigs-filter-popover gigs-filter-popover--desktop">
              <JobTypeFilterPanel onApplied={onAppliedPanel} />
            </div>
          ) : null}
          <GigsFilterFloatingDrop open={activeFilter === 'jobType'} anchorRef={jobTypeRef}>
            <div className="gigs-filter-popover gigs-filter-popover--mobile">
              <JobTypeFilterPanel onApplied={onAppliedPanel} />
            </div>
          </GigsFilterFloatingDrop>
        </div>

        <div ref={locationRef} className="gigs-filter-pop-wrap">
          <LocationFilterButton isActive={activeFilter === 'location'} onClick={() => toggleFilter('location')} />
          {activeFilter === 'location' ? (
            <div className="gigs-filter-popover gigs-filter-popover--desktop">
              <LocationFilterPanel onApplied={onAppliedPanel} />
            </div>
          ) : null}
          <GigsFilterFloatingDrop open={activeFilter === 'location'} anchorRef={locationRef}>
            <div className="gigs-filter-popover gigs-filter-popover--mobile">
              <LocationFilterPanel onApplied={onAppliedPanel} />
            </div>
          </GigsFilterFloatingDrop>
        </div>

        <div ref={salaryRef} className="gigs-filter-pop-wrap">
          <SalaryRangeFilterButton
            isActive={activeFilter === 'salaryRange'}
            onClick={() => toggleFilter('salaryRange')}
          />
          {activeFilter === 'salaryRange' ? (
            <div className="gigs-filter-popover gigs-filter-popover--desktop">
              <SalaryRangeFilterPanel onApplied={onAppliedPanel} />
            </div>
          ) : null}
          <GigsFilterFloatingDrop open={activeFilter === 'salaryRange'} anchorRef={salaryRef}>
            <div className="gigs-filter-popover gigs-filter-popover--mobile">
              <SalaryRangeFilterPanel onApplied={onAppliedPanel} />
            </div>
          </GigsFilterFloatingDrop>
        </div>

        <div ref={filtersRef} className="gigs-filter-pop-wrap">
          <FiltersButton isActive={activeFilter === 'filters'} onClick={() => toggleFilter('filters')} />
          {activeFilter === 'filters' ? (
            <div className="gigs-filter-popover gigs-filter-popover--desktop">
              <AdvancedFiltersPanel onApplied={onAppliedPanel} />
            </div>
          ) : null}
          <GigsFilterFloatingDrop open={activeFilter === 'filters'} anchorRef={filtersRef}>
            <div className="gigs-filter-popover gigs-filter-popover--mobile">
              <AdvancedFiltersPanel onApplied={onAppliedPanel} />
            </div>
          </GigsFilterFloatingDrop>
        </div>
      </div>
    </div>
  );
};

export default GigsBrowseHeroCard;
