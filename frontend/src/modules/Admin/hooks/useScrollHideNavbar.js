import { useEffect, useState } from 'react';

const MOBILE_MQ = '(max-width: 1023px)';
const THROTTLE_MS = 80;
const DELTA = 10;

const subscribers = new Set();
let sharedHidden = false;
let sharedDirection = 'up';
let lastY = 0;
let lastRun = 0;
let rafId = 0;
let retryRafId = 0;
let rootEl = null;
let mq = null;
let listening = false;

function notifyAll() {
  const payload = { hidden: sharedHidden, direction: sharedDirection };
  subscribers.forEach((fn) => fn(payload));
}

function evaluateScroll() {
  rafId = 0;
  if (!rootEl || !mq?.matches) {
    if (sharedHidden || sharedDirection !== 'up') {
      sharedHidden = false;
      sharedDirection = 'up';
      notifyAll();
    }
    return;
  }

  const y = rootEl.scrollTop;
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

function onScroll() {
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

function attachListener() {
  if (listening || !rootEl) return;
  mq = window.matchMedia(MOBILE_MQ);
  lastY = rootEl.scrollTop;
  rootEl.addEventListener('scroll', onScroll, { passive: true });
  mq.addEventListener('change', onResize);
  listening = true;
}

function ensureListener() {
  if (listening) return;
  if (!rootEl) rootEl = document.querySelector('main.et-main-scroll');
  if (!rootEl) {
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

/** Reset shared hide state (e.g. after route change). */
export function resetScrollHideNavbar() {
  if (!rootEl) rootEl = document.querySelector('main.et-main-scroll');
  lastY = rootEl?.scrollTop ?? 0;
  if (sharedHidden || sharedDirection !== 'up') {
    sharedHidden = false;
    sharedDirection = 'up';
    notifyAll();
  }
}

function teardownListener() {
  if (!listening || subscribers.size > 0) return;
  rootEl?.removeEventListener('scroll', onScroll);
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
    onChange({ hidden: sharedHidden, direction: sharedDirection });

    return () => {
      subscribers.delete(onChange);
      teardownListener();
    };
  }, [enabled]);

  return state;
}
