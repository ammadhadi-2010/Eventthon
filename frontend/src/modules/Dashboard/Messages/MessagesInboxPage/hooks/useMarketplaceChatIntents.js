import { useEffect } from 'react';
import { readGigChatIntent } from '../../../Gigs/utils/gigsMessagesBridge';
import { readProjectChatIntent } from '../../../Projects/utils/projectsMessagesBridge';
import { readSquadChatIntent } from '../../../SquadNetwork/utils/squadsMessagesBridge';
import { isMongoId } from '../utils/inboxHelpers';

/** Open a draft once when arriving from gig, project, or squad flows. */
export default function useMarketplaceChatIntents(createDraftFromSource) {
  useEffect(() => {
    const gigIntent = readGigChatIntent();
    if (gigIntent?.seller_user_id) {
      createDraftFromSource({
        seller_user_id: gigIntent.seller_user_id,
        chat_type: gigIntent.chat_type || 'gig',
        chat_tag: gigIntent.chat_tag || 'Gig Inquiry',
        context_id: gigIntent.context_id || '',
        context_title: gigIntent.context_title || 'Gig conversation',
        body: gigIntent.body || 'Continue your gig conversation here.',
        order_id: gigIntent.order_id || '',
      });
      return;
    }
    const projectIntent = readProjectChatIntent();
    if (projectIntent?.seller_user_id) {
      createDraftFromSource({
        seller_user_id: projectIntent.seller_user_id,
        chat_type: projectIntent.chat_type || 'project',
        chat_tag: projectIntent.chat_tag || 'Project Proposal',
        context_id: projectIntent.context_id || '',
        context_title: projectIntent.context_title || 'Project conversation',
        body: projectIntent.body || 'Continue your project proposal here.',
        order_id: projectIntent.proposal_id || '',
      });
      return;
    }
    const squadIntent = readSquadChatIntent();
    if (!squadIntent?.seller_user_id || !isMongoId(squadIntent.seller_user_id)) return;
    createDraftFromSource({
      seller_user_id: squadIntent.seller_user_id,
      from_user_id: squadIntent.from_user_id || '',
      chat_type: squadIntent.chat_type || 'squad',
      chat_tag: squadIntent.chat_tag || 'Squad Invitation',
      context_id: squadIntent.context_id || '',
      context_title: squadIntent.context_title || 'Squad conversation',
      body: squadIntent.body || 'Continue your squad invitation here.',
      order_id: squadIntent.proposal_id || '',
    });
  }, [createDraftFromSource]);
}
