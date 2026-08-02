import ConversationDetailsSidebar from './ConversationDetailsSidebar';
import CompanyConversationSidebar from './companyHiring/CompanyConversationSidebar';
import SquadConversationSidebar from '../../SquadNetwork/components/chat/SquadConversationSidebar';

export default function ConversationDetails({
  companyMode = false,
  squadMode = false,
  squad = null,
  onOpenSquadMembers,
  selectedMessage,
  onHiringStageChange,
  onLabelsChange,
  ...rest
}) {
  if (squadMode) {
    return (
      <SquadConversationSidebar
        selectedMessage={selectedMessage}
        squad={squad}
        onOpenSquadMembers={onOpenSquadMembers}
      />
    );
  }
  if (companyMode) {
    return (
      <CompanyConversationSidebar
        selectedMessage={selectedMessage}
        onHiringStageChange={onHiringStageChange}
        onLabelsChange={onLabelsChange}
      />
    );
  }
  return <ConversationDetailsSidebar selectedMessage={selectedMessage} {...rest} />;
}
