import React from 'react';
import { FiBriefcase, FiDollarSign, FiHash, FiUserCheck } from 'react-icons/fi';

export default function SmartHeaderJobCard({ job, compact = false }) {
  if (!job) return null;
  return (
    <div className={`sch-job${compact ? ' sch-job--compact' : ''}`}>
      <div className="sch-job__title">
        <FiBriefcase size={14} aria-hidden />
        <strong>{job.title}</strong>
      </div>
      <div className="sch-job__meta">
        <span title="Job ID">
          <FiHash size={12} aria-hidden />
          {job.id}
        </span>
        <span title="Salary range">
          <FiDollarSign size={12} aria-hidden />
          {job.salaryRange}
        </span>
        <span title="Recruiter assigned">
          <FiUserCheck size={12} aria-hidden />
          {job.recruiter}
        </span>
      </div>
    </div>
  );
}
