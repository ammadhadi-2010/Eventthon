import React from 'react';
import { motion } from 'framer-motion';

const STAGE_TONES = {
  applied: 'violet',
  reviewing: 'sky',
  shortlisted: 'mint',
  interview_scheduled: 'amber',
  technical_test: 'indigo',
  offer_sent: 'cyan',
  hired: 'emerald',
  rejected: 'rose',
};

export default function HiringPipeline({
  stages = [],
  activeStage = 'applied',
  onChangeStage,
  busy = false,
}) {
  const activeIdx = Math.max(0, stages.findIndex((s) => s.id === activeStage));

  return (
    <section className="chs-card chs-pipeline">
      <header className="chs-card__head">
        <h6>Hiring Pipeline</h6>
        <span>One-click stage update</span>
      </header>
      <div className="chs-pipeline__track" role="list" aria-label="Hiring stages">
        {stages.map((stage, index) => {
          const done = index <= activeIdx && activeStage !== 'rejected';
          const current = stage.id === activeStage;
          const tone = STAGE_TONES[stage.id] || 'violet';
          return (
            <button
              key={stage.id}
              type="button"
              role="listitem"
              disabled={busy}
              className={`chs-pipeline__step chs-pipeline__step--${tone}${done ? ' is-done' : ''}${current ? ' is-current' : ''}`}
              onClick={() => onChangeStage?.(stage.id)}
              title={stage.label}
            >
              <motion.i
                layout
                className="chs-pipeline__dot"
                animate={current ? { scale: [1, 1.15, 1] } : { scale: 1 }}
                transition={{ duration: 0.45 }}
              />
              <em>{stage.label}</em>
            </button>
          );
        })}
      </div>
    </section>
  );
}
