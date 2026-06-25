import React from 'react';
import PublicShowroomSeo from '../components/PublicShowroomSeo';
import JobBoardView from '../components/showroom/job/board/JobBoardView';

export default function PublicJobsBoardPage({ forceGuest = true }) {
  return (
    <>
      <PublicShowroomSeo
        title="Remote Jobs Board | EventThon"
        description="Find remote jobs from global companies on the EventThon public job board."
        keywords={['remote jobs', 'EventThon', 'hiring', 'global']}
        canonicalPath="/public/jobs"
      />
      <JobBoardView forceGuest={forceGuest} />
    </>
  );
}
