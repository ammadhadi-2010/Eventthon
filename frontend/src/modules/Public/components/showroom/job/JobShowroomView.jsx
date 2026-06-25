import React from 'react';
import { Link } from 'react-router-dom';
import { Globe, MapPin } from 'lucide-react';
import useShowroomAuth from '../../../hooks/useShowroomAuth';
import ShowroomActionBar from '../ShowroomActionBar';
import JobShowroomDualGrid from './JobShowroomDualGrid';
import '../../../styles/showroom-premium.css';
import '../../../styles/showroom-marketplace.css';

export default function JobShowroomView({ data, forceGuest = false }) {
  const { isGuest, canManage } = useShowroomAuth(forceGuest);
  const slug = data.publicSlug || data.jobId;
  const publicPath = `/public/jobs/${slug}`;

  return (
    <div className="ps-page ps-page--marketplace">
      <nav className="ps-breadcrumb" aria-label="Breadcrumb">
        <Link to="/public/jobs">Jobs</Link>
        <span aria-hidden>›</span>
        <span>{data.category}</span>
        <span aria-hidden>›</span>
        <span>{data.jobTitle}</span>
      </nav>

      <ShowroomActionBar
        publicPath={publicPath}
        managePath="/jobs"
        canManage={canManage}
        badge="Public Job"
      />

      <header className="ps-job-detail-header">
        <div className="ps-mp-header__row">
          <span className="ps-mp-badge">{data.category}</span>
          {data.remote ? (
            <span className="ps-job-remote">
              <Globe size={12} /> Remote / Global
            </span>
          ) : (
            <span className="ps-job-remote">
              <MapPin size={12} /> On-site
            </span>
          )}
        </div>
        <h1>{data.jobTitle}</h1>
        <p className="ps-job-salary">{data.salaryRange}</p>
      </header>

      <JobShowroomDualGrid data={data} isGuest={isGuest} />
    </div>
  );
}
