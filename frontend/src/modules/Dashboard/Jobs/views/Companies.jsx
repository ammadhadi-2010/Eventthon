import React, { useCallback } from 'react';
import { FiSearch } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import CompanyRow from '../components/CompanyRow';
import JobsMobileSubViewShell from '../components/JobsMobileSubViewShell';
import { useJobsHub } from '../context/JobsHubContext';
import useTopCompanies from '../hooks/useTopCompanies';
import { saveJobsBrowseFilters } from '../utils/jobsBrowseSession';

export default function Companies() {
  const navigate = useNavigate();
  const { setSearchFilters } = useJobsHub();
  const {
    loading,
    filtered,
    industries,
    query,
    setQuery,
    industry,
    setIndustry,
    empty,
  } = useTopCompanies();

  const openCompanyJobs = useCallback(
    (company) => {
      const name = String(company?.name || '').trim();
      if (!name) return;
      setSearchFilters(
        saveJobsBrowseFilters({
          company: name,
          q: '',
          listingKind: 'company',
          jobType: '',
        }),
      );
      navigate('/jobs');
    },
    [navigate, setSearchFilters],
  );

  return (
    <JobsMobileSubViewShell title="Companies">
      <section className="jh-view jh-view--companies">
        <div className="gigs-card jh-companies-panel">
          <header className="jh-companies-panel__header">
            <h2>Top Companies</h2>
            <p>Tap a company to browse their open roles.</p>
          </header>

          <div className="jh-companies-toolbar">
            <label className="jh-companies-search">
              <FiSearch size={14} aria-hidden />
              <input
                type="search"
                placeholder="Search companies..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
            </label>
            <select
              className="jh-companies-select"
              value={industry}
              onChange={(e) => setIndustry(e.target.value)}
              aria-label="Filter by industry"
            >
              {industries.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
          </div>

          {loading ? (
            <p className="jh-companies-empty">Loading companies…</p>
          ) : empty ? (
            <p className="jh-companies-empty">No hiring companies yet. Check back soon.</p>
          ) : filtered.length === 0 ? (
            <p className="jh-companies-empty">No companies match your search.</p>
          ) : (
            <ul className="jh-companies-list jh-mobile-card-list">
              {filtered.map((company, index) => (
                <CompanyRow
                  key={company.id || company.name}
                  company={company}
                  index={index}
                  onOpen={openCompanyJobs}
                />
              ))}
            </ul>
          )}
        </div>
      </section>
    </JobsMobileSubViewShell>
  );
}
