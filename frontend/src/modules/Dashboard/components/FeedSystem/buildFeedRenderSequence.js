const SUGGESTED_AFTER_POST_INDEX = 3;
const PEOPLE_AFTER_POST_INDEX = 6;
const ABOUT_JOURNEY_AFTER_POST_INDEX = 4;

function shouldInjectSupportCause(index) {
  return index === 10 || (index > 10 && index % 12 === 10);
}

/** Inject feed widgets between posts — not stacked together. */
export function buildFeedRenderSequence(posts, includeMobileWidgets, aboutFeed = null) {
  const safePosts = Array.isArray(posts) ? posts.filter((post) => post && (post._id || post.id)) : [];
  const sequence = [];
  const showJourney = Boolean(aboutFeed?.journeyEnabled && aboutFeed?.timeline?.length);

  safePosts.forEach((post, index) => {
    sequence.push({ kind: 'post', key: String(post._id || post.id), post });
    if (!includeMobileWidgets) return;

    if (index === SUGGESTED_AFTER_POST_INDEX) {
      sequence.push({ kind: 'mobile_suggested_squads', key: 'feed-suggested-squads' });
    }
    if (index === PEOPLE_AFTER_POST_INDEX) {
      sequence.push({ kind: 'mobile_people_you_may_know', key: 'feed-people-you-may-know' });
    }
    if (showJourney && index === ABOUT_JOURNEY_AFTER_POST_INDEX) {
      sequence.push({ kind: 'about_journey', key: 'feed-about-journey' });
    }
    if (shouldInjectSupportCause(index)) {
      sequence.push({ kind: 'support_cause', key: `support-cause-${index}` });
    }
  });

  return sequence;
}