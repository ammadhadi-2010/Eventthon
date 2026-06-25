import React from 'react';
import { FiPlus, FiX } from 'react-icons/fi';
import ReviewTargetSelect from './ReviewTargetSelect';
import StarRatingInput from './StarRatingInput';
import { REVIEW_SKILL_TAGS, REVIEW_TEXT_MAX } from './writeReviewConstants';
import './write-review-modal.css';

export default function WriteReviewModal({
  open,
  onClose,
  form,
  errors,
  fieldKey = 'targetId',
  selectLabel = 'Select Item',
  selectPlaceholder = 'Select an item',
  introCopy = 'Share your feedback. All fields are required.',
  textPlaceholder = 'Describe your experience…',
  targets = [],
  loadingTargets = false,
  onFieldChange,
  onToggleTag,
  onSubmit,
  skillTags = REVIEW_SKILL_TAGS,
}) {
  if (!open) return null;

  const targetOptions = [
    { id: '', label: loadingTargets ? 'Loading…' : selectPlaceholder },
    ...targets,
  ];
  const fieldValue = form[fieldKey] || '';
  const fieldError = errors[fieldKey];
  const charsLeft = REVIEW_TEXT_MAX - (form.text?.length || 0);

  return (
    <div className="wr-modal-backdrop" role="presentation" onClick={onClose}>
      <div
        className="wr-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="write-review-title"
        onClick={(e) => e.stopPropagation()}
      >
        <header className="wr-modal-head">
          <h2 id="write-review-title">Write a Review</h2>
          <button type="button" className="wr-modal-close" onClick={onClose} aria-label="Close">
            <FiX size={18} />
          </button>
        </header>

        <p className="wr-modal-copy">{introCopy}</p>

        <div className="wr-field">
          <span className="wr-label">{selectLabel}</span>
          <ReviewTargetSelect
            value={fieldValue}
            options={targetOptions}
            onChange={(id) => onFieldChange(fieldKey, id)}
            ariaLabel={selectLabel}
          />
          {fieldError ? <p className="wr-error">{fieldError}</p> : null}
        </div>

        <div className="wr-field">
          <span className="wr-label">Star Rating</span>
          <StarRatingInput value={form.stars} onChange={(stars) => onFieldChange('stars', stars)} />
          {errors.stars ? <p className="wr-error">{errors.stars}</p> : null}
        </div>

        <label className="wr-field">
          <span className="wr-label">Review Text</span>
          <textarea
            className="wr-textarea"
            value={form.text}
            maxLength={REVIEW_TEXT_MAX}
            rows={4}
            placeholder={textPlaceholder}
            onChange={(e) => onFieldChange('text', e.target.value)}
          />
          <span className={`wr-char-count${charsLeft < 40 ? ' is-low' : ''}`}>
            {form.text?.length || 0}/{REVIEW_TEXT_MAX}
          </span>
          {errors.text ? <p className="wr-error">{errors.text}</p> : null}
        </label>

        <fieldset className="wr-field wr-tags">
          <legend className="wr-label">Skill Tags</legend>
          <div className="wr-tag-row">
            {skillTags.map((tag) => {
              const active = form.tags.includes(tag.id);
              return (
                <button
                  key={tag.id}
                  type="button"
                  className={`wr-tag${active ? ' is-active' : ''}`}
                  aria-pressed={active}
                  onClick={() => onToggleTag(tag.id)}
                >
                  {tag.label}
                </button>
              );
            })}
          </div>
        </fieldset>

        <div className="wr-actions">
          <button type="button" className="wr-btn-ghost" onClick={onClose}>
            Cancel
          </button>
          <button
            type="button"
            className="wr-btn-primary"
            onClick={onSubmit}
            disabled={loadingTargets}
          >
            Submit
          </button>
        </div>
      </div>
    </div>
  );
}

export function WriteReviewButton({ onClick }) {
  return (
    <button type="button" className="reviews-write-btn" onClick={onClick}>
      <FiPlus size={16} aria-hidden />
      + Write a Review
    </button>
  );
}
