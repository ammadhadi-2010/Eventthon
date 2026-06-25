import React from 'react';
import { FiPlus } from 'react-icons/fi';
import { TagList } from '../jobAlertStepShared';

export default function JobAlertStepSkills({ form, patch, addTag, removeTag }) {
  const onSkillKey = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addTag('skills', 'skillInput', form.skillInput);
    }
  };
  const onKeywordKey = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addTag('keywords', 'keywordInput', form.keywordInput);
    }
  };

  return (
    <section className="ja-panel" aria-labelledby="ja-step-skills-title">
      <h2 id="ja-step-skills-title" className="ja-panel__title">
        Skills &amp; Keywords
      </h2>
      <p className="ja-panel__sub">Add skills and keywords to fine-tune your job matches.</p>

      <div className="ja-field">
        <span className="ja-label">Skills</span>
        <TagList tags={form.skills} onRemove={(t) => removeTag('skills', t)} />
        <div className="ja-tag-add-row">
          <input
            type="text"
            className="ja-input"
            placeholder="Add a skill"
            value={form.skillInput}
            onChange={(e) => patch({ skillInput: e.target.value })}
            onKeyDown={onSkillKey}
          />
          <button
            type="button"
            className="ja-tag-add-btn"
            onClick={() => addTag('skills', 'skillInput', form.skillInput)}
          >
            <FiPlus size={14} /> Add Skill
          </button>
        </div>
      </div>

      <div className="ja-field">
        <span className="ja-label">Keywords</span>
        <TagList tags={form.keywords} onRemove={(t) => removeTag('keywords', t)} />
        <input
          type="text"
          className="ja-input"
          placeholder="Type a keyword and press Enter"
          value={form.keywordInput}
          onChange={(e) => patch({ keywordInput: e.target.value })}
          onKeyDown={onKeywordKey}
        />
      </div>
    </section>
  );
}
