import React from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import useCompanyDetail from './useCompanyDetail';
import CompanyDetailView from './CompanyDetailView';
import '../UserDetail/userDetail.css';
import '../CompanyManagement/companyManagement.css';

export default function CompanyDetailPage() {
  const [searchParams] = useSearchParams();
  const companyId = searchParams.get('companyId')?.trim() || '';
  const { company, loading, error, refetch } = useCompanyDetail(companyId);

  if (!companyId) {
    return (
      <div className="ud-page">
        <p className="ud-empty">No company selected.</p>
        <Link to="/admin-control/companies" className="ud-back-link">
          ← Back to Companies
        </Link>
      </div>
    );
  }

  return (
    <div className="ud-page">
      {error ? (
        <div className="ud-error" role="alert">
          {typeof error === 'string' ? error : 'Could not load company'}
        </div>
      ) : null}
      {loading ? <p className="ud-loading">Loading company profile…</p> : null}
      {!loading && company ? <CompanyDetailView company={company} onRefetch={refetch} /> : null}
      {!loading && !company && !error ? (
        <p className="ud-empty">
          Company not found.{' '}
          <Link to="/admin-control/companies" className="ud-back-link">
            Back to list
          </Link>
        </p>
      ) : null}
    </div>
  );
}
