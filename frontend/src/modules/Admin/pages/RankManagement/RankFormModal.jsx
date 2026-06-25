import React, { useEffect, useState } from 'react';
import {
  EMPTY_RANK_FORM,
  RANK_CODES,
  RANK_FIELD_CLASS,
  RANK_LABEL_CLASS,
  applyRankPresetToForm,
  getRankPresetByCode,
  rowToRankForm,
} from '../../../../models/Rank';
import RankBadgeViewport from './RankBadgeViewport';
import './rank-management-modal.css';
import './rank-matrix.css';

export default function RankFormModal({ open, rank, initialForm, onClose, onSave, saving }) {
  const [form, setForm] = useState(EMPTY_RANK_FORM);
  const isEdit = Boolean(rank?.id);
  const preset = getRankPresetByCode(form.rankCode);

  useEffect(() => {
    if (!open) return;
    if (initialForm) {
      setForm(initialForm);
      return;
    }
    setForm(rank ? rowToRankForm(rank) : applyRankPresetToForm(EMPTY_RANK_FORM, 'E-1'));
  }, [open, rank, initialForm]);

  if (!open) return null;

  const setField = (key) => (e) => {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setForm((prev) => {
      const next = { ...prev, [key]: value };
      if (key === 'rankCode' && !isEdit) return applyRankPresetToForm(next, value);
      return next;
    });
  };

  const applyPreset = () => {
    if (!preset) return;
    setForm((prev) => applyRankPresetToForm(prev, form.rankCode));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave?.({
      ...form,
      minPoints: Number(form.minPoints) || 0,
      minDealsRequired: Number(form.minDealsRequired) || 0,
      minStarRating: Number(form.minStarRating) || 0,
    });
  };

  return (
    <div className="rm-modal-root" role="dialog" aria-modal="true" aria-label={isEdit ? 'Edit rank' : 'Add rank'}>
      <button type="button" className="rm-modal-backdrop" onClick={onClose} aria-label="Close rank modal" />
      <form className="rm-modal" onSubmit={handleSubmit}>
        <div className="rm-modal__hero">
          <RankBadgeViewport row={form} size="lg" />
          <div>
            <h3 className="rm-modal__title">{isEdit ? 'Edit Elite Rank' : 'Add New Elite Rank'}</h3>
            <p className="rm-modal__sub">Matrix-locked criteria from the official 6-level game plan chart.</p>
          </div>
        </div>

        <div className="rm-modal__grid">
          <div>
            <label className={RANK_LABEL_CLASS} htmlFor="rank-code">Rank Code</label>
            <select id="rank-code" className={RANK_FIELD_CLASS} value={form.rankCode} onChange={setField('rankCode')} required>
              {RANK_CODES.map((code) => (
                <option key={code} value={code}>{code}</option>
              ))}
            </select>
          </div>
          <div>
            <label className={RANK_LABEL_CLASS} htmlFor="rank-name">Rank Title</label>
            <input id="rank-name" className={RANK_FIELD_CLASS} value={form.rankName} onChange={setField('rankName')} required />
          </div>
          <div>
            <label className={RANK_LABEL_CLASS} htmlFor="rank-points">Minimum Point Threshold</label>
            <input id="rank-points" type="number" min="0" className={RANK_FIELD_CLASS} value={form.minPoints} onChange={setField('minPoints')} required />
          </div>
          <div>
            <label className={RANK_LABEL_CLASS} htmlFor="rank-deals">Minimum Completed Deals Required</label>
            <input id="rank-deals" type="number" min="0" className={RANK_FIELD_CLASS} value={form.minDealsRequired} onChange={setField('minDeals')} />
          </div>
          <div>
            <label className={RANK_LABEL_CLASS} htmlFor="rank-stars">Minimum Star Rating Required</label>
            <input id="rank-stars" type="number" min="0" max="5" step="0.1" className={RANK_FIELD_CLASS} value={form.minStarRating} onChange={setField('minStarRating')} />
          </div>
          <div>
            <label className={RANK_LABEL_CLASS} htmlFor="rank-icon">Badge imageurl</label>
            <input id="rank-icon" className={RANK_FIELD_CLASS} value={form.iconUrl} onChange={setField('iconUrl')} placeholder={preset?.iconUrl || '/static/uploads/ranks/...'} />
            {preset ? (
              <button type="button" className="rm-preset-btn" onClick={applyPreset}>
                Use matrix asset: {preset.badgeLabel}
              </button>
            ) : null}
          </div>
          <label className="rm-modal__check">
            <input type="checkbox" checked={form.featureOnFrontlineDashboard} onChange={setField('featureOnFrontlineDashboard')} />
            <span>Enable Ultimate Vanguard Power: Feature Profile on Top of Recruiter Frontline Dashboard</span>
          </label>
        </div>

        <div className="rm-modal__actions">
          <button type="button" className="um-btn um-btn--ghost" onClick={onClose} disabled={saving}>Cancel</button>
          <button type="submit" className="um-btn um-btn--primary" disabled={saving}>
            {saving ? 'Saving…' : isEdit ? 'Save Rank' : 'Create Rank'}
          </button>
        </div>
      </form>
    </div>
  );
}
