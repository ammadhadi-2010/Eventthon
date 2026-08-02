import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import MessagesInboxPage from '../../../../modules/Dashboard/Messages/MessagesInboxPage';
import CompanyMessagesPageHead from '../components/CompanyMessagesPageHead';
import { useCompanyInbox } from '../hooks/useCompanyInbox';
import '../styles/companyMessages.css';
import '../styles/company-messages-mobile.css';

export default function CompanyMessagesPage() {
  const navigate = useNavigate();
  const [channel, setChannel] = useState('all');
  const [inChat, setInChat] = useState(false);
  const inbox = useCompanyInbox(channel);

  useEffect(() => {
    setInChat(false);
  }, [channel]);

  const handleBack = useCallback(() => {
    if (inChat) {
      window.dispatchEvent(new CustomEvent('msgx:company-mobile-back'));
      return;
    }
    navigate('/company/dashboard');
  }, [inChat, navigate]);

  return (
    <div className={`cp-messages-page${inChat ? ' cp-messages-page--in-chat' : ''}`}>
      <CompanyMessagesPageHead
        channel={channel}
        onChannelChange={setChannel}
        counts={inbox.counts}
        inChat={inChat}
        onBack={handleBack}
      />
      <MessagesInboxPage
        companyMode
        companyInbox={inbox}
        companyChannel={channel}
        onMobileChatOpenChange={setInChat}
      />
    </div>
  );
}
