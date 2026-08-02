import { useEffect, useState } from 'react';

const MOBILE_MQ = '(max-width: 1023px)';
const THROTTLE_MS = 80;
const DELTA = 10;
const EXTRA_ROOT_SELECTORS = [
  '.squad-hub-mobile-shell .squad-hub__content-scroll',
  // Intentionally omit .msgx-chat-thread — hiding chrome while chat scrolls
  // changes hub padding / 100dvh and jumps the composer + last bubbles.
  '.msgx-mobile-screen .msgx-mobile-list-shell',
];

const subscribers = new Set();
let sharedHidden = false;
let sharedDirection = 'up';
let lastY = 0;
let lastRun = 0;
let rafId = 0;
let retryRafId = 0;
let rootEls = [];
let activeScrollEl = null;
let mq = null;
let listening = false;

function notifyAll() {
  const payload = { hidden: sharedHidden, direction: sharedDirection };
  subscribers.forEach((fn) => fn(payload));
}

function collectScrollRoots() {
  const roots = [];
  const main = document.querySelector('main.et-main-scroll');
  if (main) roots.push(main);
  EXTRA_ROOT_SELECTORS.forEach((selector) => {
    document.querySelectorAll(selector).forEach((el) => {
      if (!roots.includes(el)) roots.push(el);
    });
  });
  return roots;
}

function evaluateScroll() {
  rafId = 0;
  if (!mq?.matches) {
    if (sharedHidden || sharedDirection !== 'up') {
      sharedHidden = false;
      sharedDirection = 'up';
      notifyAll();
    }
    return;
  }

  const target = activeScrollEl || rootEls[0];
  if (!target) return;

  const y = target.scrollTop;
  let nextHidden = sharedHidden;
  let nextDirection = sharedDirection;

  if (y <= 4) {
    nextHidden = false;
    nextDirection = 'up';
  } else if (y - lastY > DELTA) {
    nextHidden = true;
    nextDirection = 'down';
  } else if (lastY - y > DELTA) {
    nextHidden = false;
    nextDirection = 'up';
  }

  lastY = y;
  if (nextHidden !== sharedHidden || nextDirection !== sharedDirection) {
    sharedHidden = nextHidden;
    sharedDirection = nextDirection;
    notifyAll();
  }
}

function onScroll(event) {
  activeScrollEl = event.currentTarget;
  const now = Date.now();
  if (now - lastRun < THROTTLE_MS) {
    if (!rafId) rafId = window.requestAnimationFrame(evaluateScroll);
    return;
  }
  lastRun = now;
  evaluateScroll();
}

function onResize() {
  if (!mq?.matches && sharedHidden) {
    sharedHidden = false;
    sharedDirection = 'up';
    notifyAll();
  }
}

function bindScrollRoots() {
  rootEls.forEach((el) => el.removeEventListener('scroll', onScroll));
  rootEls = collectScrollRoots();
  activeScrollEl = rootEls[0] || null;
  lastY = activeScrollEl?.scrollTop ?? 0;
  rootEls.forEach((el) => el.addEventListener('scroll', onScroll, { passive: true }));
}

function attachListener() {
  if (listening) return;
  mq = window.matchMedia(MOBILE_MQ);
  bindScrollRoots();
  mq.addEventListener('change', onResize);
  listening = true;
}

function ensureListener() {
  if (listening) return;
  if (!collectScrollRoots().length) {
    if (!retryRafId) {
      retryRafId = window.requestAnimationFrame(() => {
        retryRafId = 0;
        if (subscribers.size > 0) ensureListener();
      });
    }
    return;
  }
  attachListener();
}

/** Re-bind inner hub scroll areas (e.g. squad chat) after route/tab mount. */
export function refreshScrollHideRoots() {
  if (!listening) {
    ensureListener();
    return;
  }
  bindScrollRoots();
}

/** Reset shared hide state (e.g. after route change). */
export function resetScrollHideNavbar() {
  activeScrollEl = rootEls[0] || document.querySelector('main.et-main-scroll');
  lastY = activeScrollEl?.scrollTop ?? 0;
  if (sharedHidden || sharedDirection !== 'up') {
    sharedHidden = false;
    sharedDirection = 'up';
    notifyAll();
  }
}

function teardownListener() {
  if (!listening || subscribers.size > 0) return;
  rootEls.forEach((el) => el.removeEventListener('scroll', onScroll));
  rootEls = [];
  activeScrollEl = null;
  mq?.removeEventListener('change', onResize);
  if (rafId) window.cancelAnimationFrame(rafId);
  if (retryRafId) window.cancelAnimationFrame(retryRafId);
  listening = false;
  rafId = 0;
  retryRafId = 0;
}

/** Mobile scroll chrome — shared throttled listener for top/bottom nav hide. */
export default function useScrollHideNavbar(enabled = true) {
  const [state, setState] = useState({ hidden: false, direction: 'up' });

  useEffect(() => {
    if (!enabled) {
      setState({ hidden: false, direction: 'up' });
      return undefined;
    }

    const onChange = (next) => setState(next);
    subscribers.add(onChange);
    ensureListener();
    refreshScrollHideRoots();
    onChange({ hidden: sharedHidden, direction: sharedDirection });

    return () => {
      subscribers.delete(onChange);
      teardownListener();
    };
  }, [enabled]);

  return state;
}
