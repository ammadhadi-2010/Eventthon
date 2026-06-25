function shouldInjectSuggestedSquads(index) {
  return index === 2 || index % 4 === 0;
}

function shouldInjectPeopleYouMayKnow(index) {
  return index === 4 || index % 6 === 0;
}

export function buildFeedRenderSequence(posts, includeMobileWidgets) {
  const safePosts = Array.isArray(posts) ? posts.filter((post) => post && (post._id || post.id)) : [];
  const sequence = [];

  safePosts.forEach((post, index) => {
    sequence.push({ kind: 'post', key: String(post._id || post.id), post });
    if (!includeMobileWidgets) return;

    if (shouldInjectSuggestedSquads(index)) {
      sequence.push({ kind: 'mobile_suggested_squads', key: `mobile-squads-${index}` });
    }
    if (shouldInjectPeopleYouMayKnow(index)) {
      sequence.push({ kind: 'mobile_people_you_may_know', key: `mobile-people-${index}` });
    }
  });

  return sequence;
}
