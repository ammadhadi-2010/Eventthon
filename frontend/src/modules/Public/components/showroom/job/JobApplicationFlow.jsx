import React from 'react';
import { Check, Circle } from 'lucide-react';
import { APPLICATION_FLOW_STEPS } from './jobShowroomUtils';

export default function JobApplicationFlow({ steps }) {
  const flow = steps?.length ? steps : APPLICATION_FLOW_STEPS;
  return (
    <section className="ps-mp-flow-wrap" aria-label="Application flow">
      <h3>Application Flow</h3>
      <ol className="ps-mp-flow">
        {flow.map((step, idx) => {
          const completed = step.status === 'completed';
          const active = step.status === 'active';
          const isLast = idx === flow.length - 1;
          return (
            <li
              key={step.id}
              className={`ps-mp-flow__step${completed ? ' is-completed' : ''}${active ? ' is-active' : ''}`}
            >
              <span className="ps-mp-flow__icon" aria-hidden>
                {completed ? <Check size={12} /> : <Circle size={10} />}
              </span>
              {!isLast ? <span className="ps-mp-flow__line" aria-hidden /> : null}
              <span className="ps-mp-flow__label">{step.label}</span>
            </li>
          );
        })}
      </ol>
    </section>
  );
}
