import { MONGO_ID_REGEX, derivePackageTiers } from './constants';
import { postGigOrder } from './gigApiMutations';
import { buildGigChatIntentFromGig, stashGigChatIntent } from '../utils/gigsMessagesBridge';

export const BETA_ORDER_STATUS = 'In Progress / Beta Mode';

export function resolveTierForPackage(gig, packageTierKey) {
  const tiers = derivePackageTiers(gig);
  return tiers.find((t) => t.key === packageTierKey) || tiers[0];
}

export function buildBetaInquireBody(gig, tier, packageTierKey) {
  const label = tier?.label || packageTierKey || 'Basic';
  const price = tier?.price ?? gig?.price ?? 0;
  return (
    `Hi! I'm interested in the ${label} package for "${gig?.title || 'this gig'}" ` +
    `(listed around $${price}). Global beta — let's discuss scope in chat. No payment checkout required.`
  );
}

/** Create beta order + stash chat intent for Messages inbox. */
export async function runBetaGigInquire({ selectedGig, buyerId, packageTier, navigate }) {
  if (!selectedGig?.id || !buyerId) {
    return { ok: false, toast: 'Log in to inquire about this gig.' };
  }
  if (!selectedGig.sellerUserId) {
    return { ok: false, toast: 'This gig is not linked to a seller yet.' };
  }
  if (selectedGig.sellerUserId === buyerId) {
    return { ok: false, toast: 'You cannot inquire on your own gig.' };
  }
  if (!MONGO_ID_REGEX.test(String(selectedGig.id))) {
    return { ok: false, toast: 'Open a published marketplace gig to start a conversation.' };
  }

  const tierKey = packageTier || 'basic';
  const tier = resolveTierForPackage(selectedGig, tierKey);
  const body = buildBetaInquireBody(selectedGig, tier, tierKey);

  const res = await postGigOrder({
    gig_id: selectedGig.id,
    buyer_user_id: buyerId,
    package_tier: tierKey,
    amount: 0,
    status: BETA_ORDER_STATUS,
    beta_mode: true,
    gig_title: selectedGig.title,
  });

  const ctx = res?.chat_context || buildGigChatIntentFromGig(selectedGig, {
    order_id: res?.order?._id || '',
    body,
    chat_tag: 'Gig Inquiry',
    package_tier: tierKey,
  });
  stashGigChatIntent({ ...ctx, body: ctx.body || body, package_tier: tierKey });
  navigate('/messages');
  return {
    ok: true,
    toast: `Opening chat · ${tier?.label || tierKey} package (beta)`,
  };
}
