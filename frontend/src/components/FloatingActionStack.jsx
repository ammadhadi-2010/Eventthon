import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useLocation } from 'react-router-dom';
import FeedbackButton from './FeedbackButton';
import AIGrowthInsights from './AIGrowthInsights';
import './floating-action-stack.css';

const STORAGE_KEY = 'et:floating-stack-pos-v1';
const DRAG_THRESHOLD = 8;

function stackSize() {
  if (typeof window !== 'undefined' && window.matchMedia('(max-width: 1023px)').matches) {
    return { w: 52, h: 112 };
  }
  return { w: 56, h: 120 };
}

function isAdminPath(pathname = '') {
  return String(pathname || '').startsWith('/admin');
}

function clamp(n, min, max) {
  return Math.min(max, Math.max(min, n));
}

function defaultPosition() {
  if (typeof window === 'undefined') return { left: 0, top: 0 };
  const { w: sw, h: sh } = stackSize();
  const mobile = window.matchMedia('(max-width: 1023px)').matches;
  const w = window.innerWidth;
  const h = window.innerHeight;
  if (mobile) {
    return {
      left: w - sw - 8,
      top: h - sh - 88,
    };
  }
  return {
    left: w - sw - 12,
    top: Math.round(h / 2 - sh / 2),
  };
}

function readStoredPosition() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (typeof parsed?.left !== 'number' || typeof parsed?.top !== 'number') return null;
    return parsed;
  } catch {
    return null;
  }
}

function persistPosition(pos) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(pos));
  } catch {
    /* ignore */
  }
}

function fitToViewport(pos) {
  if (typeof window === 'undefined') return pos;
  const { w: sw, h: sh } = stackSize();
  const maxLeft = Math.max(8, window.innerWidth - sw - 8);
  const maxTop = Math.max(8, window.innerHeight - sh - 8);
  return {
    left: clamp(pos.left, 8, maxLeft),
    top: clamp(pos.top, 8, maxTop),
  };
}

export default function FloatingActionStack({ userData }) {
  const { pathname } = useLocation();
  const [feedbackOpen, setFeedbackOpen] = useState(false);
  const [aiOpen, setAiOpen] = useState(false);
  const [pos, setPos] = useState(() => fitToViewport(readStoredPosition() || defaultPosition()));
  const [dragging, setDragging] = useState(false);
  const dragRef = useRef(null);
  const suppressClickRef = useRef(false);

  const reclamp = useCallback(() => {
    setPos((prev) => {
      const next = fitToViewport(prev);
      if (next.left !== prev.left || next.top !== prev.top) persistPosition(next);
      return next;
    });
  }, []);

  useEffect(() => {
    window.addEventListener('resize', reclamp);
    window.addEventListener('orientationchange', reclamp);
    return () => {
      window.removeEventListener('resize', reclamp);
      window.removeEventListener('orientationchange', reclamp);
    };
  }, [reclamp]);

  useEffect(() => {
    const onMove = (event) => {
      const drag = dragRef.current;
      if (!drag?.active) return;
      const point = 'touches' in event ? event.touches[0] : event;
      if (!point) return;
      const dx = point.clientX - drag.startX;
      const dy = point.clientY - drag.startY;
      if (!drag.moved && (Math.abs(dx) > DRAG_THRESHOLD || Math.abs(dy) > DRAG_THRESHOLD)) {
        drag.moved = true;
        setDragging(true);
      }
      if (!drag.moved) return;
      if (event.cancelable) event.preventDefault();
      setPos(
        fitToViewport({
          left: drag.originLeft + dx,
          top: drag.originTop + dy,
        }),
      );
    };

    const onEnd = () => {
      const drag = dragRef.current;
      if (!drag?.active) return;
      if (drag.moved) {
        suppressClickRef.current = true;
        window.setTimeout(() => {
          suppressClickRef.current = false;
        }, 300);
        setPos((current) => {
          const fitted = fitToViewport(current);
          persistPosition(fitted);
          return fitted;
        });
      }
      dragRef.current = null;
      setDragging(false);
    };

    window.addEventListener('pointermove', onMove, { passive: false });
    window.addEventListener('pointerup', onEnd);
    window.addEventListener('pointercancel', onEnd);
    return () => {
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', onEnd);
      window.removeEventListener('pointercancel', onEnd);
    };
  }, []);

  if (isAdminPath(pathname)) {
    return null;
  }

  const startDrag = (event) => {
    if (event.button != null && event.button !== 0) return;
    const point = event;
    dragRef.current = {
      active: true,
      moved: false,
      startX: point.clientX,
      startY: point.clientY,
      originLeft: pos.left,
      originTop: pos.top,
    };
  };

  const guardClick = (event) => {
    if (!suppressClickRef.current) return false;
    event.preventDefault();
    event.stopPropagation();
    return true;
  };

  return (
    <>
      <div
        className={`et-floating-stack${dragging ? ' is-dragging' : ''}`}
        aria-label="Quick action controls. Drag to move."
        title="Drag to move"
        style={{ left: pos.left, top: pos.top }}
        onPointerDown={startDrag}
        onClickCapture={guardClick}
      >
        <button
          type="button"
          className="et-floating-stack__btn et-floating-stack__btn--bug"
          onClick={(e) => {
            if (guardClick(e)) return;
            setFeedbackOpen(true);
          }}
          aria-label="Report issue"
          title="Report Issue"
        >
          🐞
        </button>
        <AIGrowthInsights
          stackTrigger
          open={aiOpen}
          onOpenChange={(next) => {
            if (next && suppressClickRef.current) return;
            setAiOpen(next);
          }}
        />
      </div>

      <FeedbackButton userData={userData} open={feedbackOpen} onClose={() => setFeedbackOpen(false)} />
    </>
  );
}
