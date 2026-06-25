import React, { useMemo, useState } from 'react';
import MessagesInboxPage from '../../../../modules/Dashboard/Messages/MessagesInboxPage';
import CompanyMessagesPageHead from '../components/CompanyMessagesPageHead';
import { useCompanyInbox } from '../hooks/useCompanyInbox';
import '../styles/companyMessages.css';
import '../styles/company-messages-mobile.css';

export default function CompanyMessagesPage() {
  const [channel, setChannel] = useState('all');
  const inbox = useCompanyInbox(channel);

  const channelBanner = useMemo(
    () =>
      channel === 'admin_support'
        ? 'Employer-to-Admin support channel for verification and platform help.'
        : channel === 'candidate'
          ? 'Direct threads with applicants and job seekers.'
          : 'All employer messaging channels.',
    [channel],
  );

  return (
    <div className="cp-messages-page">
      <CompanyMessagesPageHead
        channel={channel}
        onChannelChange={setChannel}
        channelBanner={channelBanner}
        counts={inbox.counts}
      />
      <MessagesInboxPage
        companyMode
        companyInbox={inbox}
        companyChannel={channel}
      />
    </div>
  );
}
