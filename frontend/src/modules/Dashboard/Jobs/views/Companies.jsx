import React, { useMemo, useState } from 'react';
import { FiSearch, FiStar } from 'react-icons/fi';
import JobsMobileSubViewShell from '../components/JobsMobileSubViewShell';
import { COMPANY_INDUSTRIES, TOP_COMPANIES } from '../data/companiesData';

export default function Companies() {
  const [query, setQuery] = useState('');
  const [industry, setIndustry] = useState('All Industries');

  const filtered = useMemo(() => {
    const term = query.trim().toLowerCase();
    return TOP_COMPANIES.filter((company) => {
      const matchesIndustry =
        industry === 'All Industries' || company.industry === industry;
      const matchesQuery =
        !term ||
        company.name.toLowerCase().includes(term) ||
        company.industry.toLowerCase().includes(term);
      return matchesIndustry && matchesQuery;
    });
  }, [query, industry]);

  return (
    <JobsMobileSubViewShell title="Companies">
      <section className="jh-view jh-view--companies">
        <div className="gigs-card jh-companies-panel">
        <header className="jh-companies-panel__header">
          <h2>Top Companies</h2>
          <p>Explore top companies and their latest openings.</p>
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
            {COMPANY_INDUSTRIES.map((opt) => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))}
          </select>
        </div>

        <ul className="jh-companies-list jh-mobile-card-list">
          {filtered.map((company) => (
            <li key={company.id} className="jh-companies-row jh-mobile-data-card">
              <div className={`gigs-company-logo ${company.logoClass}`}>{company.logoText}</div>
              <div className="jh-companies-row__main">
                <h3>{company.name}</h3>
                <p>
                  {company.industry} · {company.jobsLabel}
                </p>
              </div>
              <span className="jh-companies-row__rating">
                <FiStar size={12} aria-hidden /> {company.rating.toFixed(1)}
              </span>
            </li>
          ))}
        </ul>
        </div>
      </section>
    </JobsMobileSubViewShell>
  );
}
