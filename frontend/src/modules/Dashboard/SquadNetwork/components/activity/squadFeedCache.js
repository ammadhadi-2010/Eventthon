const cache = new Map();

export function readSquadFeedCache(squadId) {
  return cache.get(squadId) || null;
}

export function writeSquadFeedCache(squadId, posts) {
  if (!squadId) return;
  cache.set(squadId, Array.isArray(posts) ? posts : []);
}

export function dropSquadFeedCache(squadId) {
  if (squadId) cache.delete(squadId);
}
