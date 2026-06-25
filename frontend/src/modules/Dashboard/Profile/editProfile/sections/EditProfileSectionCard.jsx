import React from 'react';
import { FiLock } from 'react-icons/fi';
import '../editProfileLayout.css';

/**
 * One stacked block in the center column (title + body shell).
 * When locked, body is blurred and non-interactive until Step 1 is saved.
 */
const EditProfileSectionCard = ({
  sectionId,
  stepId,
  stepIndex,
  label,
  hint,
  hintInline = false,
  isActiveStep = false,
  locked = false,
  children,
}) => (
  <section
    id={sectionId}
    data-ep-step={stepId}
    className={`ep-form-shell ep-root flex scroll-mt-24 flex-col rounded-xl border p-4 shadow-xl shadow-black/20 sm:scroll-mt-20 sm:rounded-2xl sm:p-6 ${
      isActiveStep ? 'ep-form-shell--step-active' : ''
    } ${locked ? 'ep-form-shell--locked' : ''}`}
  >
    <header className="border-b border-white/10 pb-3 sm:pb-4">
      <p className="ep-form-shell__step-kicker text-[10px] font-black uppercase tracking-[0.2em]">Step {stepIndex + 1}</p>
      {hintInline ? (
        <div className="mt-1.5 flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
          <h2 className="text-lg font-black tracking-tight text-white sm:text-xl">{label}</h2>
          <span className="text-[12px] font-medium leading-snug text-slate-500 sm:text-[13px]">{hint}</span>
        </div>
      ) : (
        <>
          <h2 className="mt-1.5 text-lg font-black tracking-tight text-white sm:text-xl">{label}</h2>
          <p className="mt-1 text-[12px] leading-snug text-slate-500 sm:text-[13px]">{hint}</p>
        </>
      )}
    </header>
    <div className="ep-form-shell__body ep-form-shell__body--contain relative mt-4 flex flex-1 flex-col p-4 sm:mt-5 sm:p-5">
      <div
        className={locked ? 'ep-section-locked-mask min-h-[6.5rem] flex-1' : ''}
        aria-hidden={locked}
      >
        <div className={locked ? 'ep-section-locked-blur' : ''}>{children}</div>
      </div>
      {locked ? (
        <div
          className="ep-section-lock-overlay absolute inset-0 z-[2] flex flex-col items-center justify-center gap-2 rounded-xl border border-white/10 bg-[#0b0e14]/72 px-4 py-6 text-center backdrop-blur-md sm:rounded-2xl"
          role="status"
          aria-live="polite"
        >
          <FiLock className="h-8 w-8 text-violet-400/90" aria-hidden />
          <p className="max-w-[16rem] text-[12px] font-semibold leading-snug text-slate-200">
            Save <span className="text-violet-300">Basic Information</span> (Step&nbsp;1) to unlock this section.
          </p>
          <p className="max-w-[15rem] text-[11px] text-slate-500">After saving, you can edit any step anytime.</p>
        </div>
      ) : null}
    </div>
  </section>
);

export default EditProfileSectionCard;
