import React from 'react';
import { FiRotateCw } from 'react-icons/fi';

export default function JobsBrowseLoadMore({ onClick }) {
  return (
    <button type="button" className="jobs-load-more" onClick={onClick}>
      <FiRotateCw size={16} aria-hidden />
      Load More Jobs
    </button>
  );
}
