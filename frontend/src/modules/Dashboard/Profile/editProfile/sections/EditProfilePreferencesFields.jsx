import React, { useState } from 'react';
import { FiArrowLeft, FiArrowRight, FiBell, FiEye, FiLayers } from 'react-icons/fi';
import EventThonBadge from '../../../../../components/EventThonBadge';
import { rankCodeToBadgeProps } from '../../../../../components/badgeTierProps';
import { getRankMeta } from '../../../../Admin/pages/UserManagement/userManagementData';
import { saveProfilePreferences } from '../../services/profileService';
import '../editProfileLayout.css';

const defaultPrefs = () => ({
  publicProfile: true,
  notifyMessages: true,
  notifyGigs: true,
});

const EditProfilePreferencesFields = ({
  draft,
  setDraft,
  userData,
  userIdentifier,
  refreshData,
  onPreferencesSaved,
  onBack,
  onContinue,
}) => {
  const prefs = draft.profilePreferences || defaultPrefs();
  const [saving, setSaving] = useState(false);
  const rankMeta = getRankMeta(userData?.rank || 'frontline');
  const badgeProps = rankCodeToBadgeProps(rankMeta.code, { label: rankMeta.label });

  const patch = (partial) =>
    setDraft((d) => ({
      ...d,
      profilePreferences: { ...defaultPrefs(), ...(d.profilePreferences || {}), ...partial },
    }));

  const savePreferences = async () => {
    if (!userIdentifier) {
      window.alert('You must be logged in to save your profile.');
      return;
    }
    setSaving(true);
    try {
      const p = draft.profilePreferences || defaultPrefs();
      const res = await saveProfilePreferences(userIdentifier, {
        public_visibility: Boolean(p.publicProfile),
        message_notifications: Boolean(p.notifyMessages),
        order_alerts: Boolean(p.notifyGigs),
      });
      if (typeof refreshData === 'function') await refreshData();
      if (typeof onPreferencesSaved === 'function') {
        onPreferencesSaved(res?.completion_pct ?? 100);
      }
    } catch (err) {
      console.error(err);
      const msg =
        err?.response?.data?.detail ||
        (typeof err?.response?.data === 'string' ? err.response.data : null) ||
        err?.message ||
        'Save failed';
      window.alert(Array.isArray(msg) ? msg.map((m) => m.msg || m).join(', ') : String(msg));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="ep-prefs ep-root space-y-5">
      <div className="ep-prefs-rank-card rounded-xl border border-white/10 bg-white/[0.03] p-4">
        <p className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-500">Current rank</p>
        <div className="mt-2 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <EventThonBadge tier={badgeProps.tier} label={badgeProps.label} variant="sm" />
            <span className="text-sm font-bold text-white">{badgeProps.label}</span>
            <span className="rounded-md bg-emerald-500/20 px-2 py-0.5 text-[10px] font-bold text-emerald-300">
              ACTIVE
            </span>
          </div>
          <div className="ep-about-footer ep-basic-footer !mt-0 !border-0 !p-0">
            {typeof onBack === 'function' ? (
              <button type="button" className="ep-btn-back-about" onClick={() => onBack()} disabled={saving}>
                <FiArrowLeft className="h-4 w-4" aria-hidden />
                Previous
              </button>
            ) : null}
            {typeof onContinue === 'function' ? (
              <button type="button" className="ep-btn-save-continue" onClick={() => onContinue()} disabled={saving}>
                Continue
                <FiArrowRight className="h-4 w-4" aria-hidden />
              </button>
            ) : null}
          </div>
        </div>
        <div className="mt-3 h-2 overflow-hidden rounded-full bg-white/10">
          <div className="h-full w-[65%] rounded-full bg-gradient-to-r from-violet-500 to-indigo-400" />
        </div>
        <p className="mt-1 text-[11px] text-slate-500">650 / 1000 XP toward Specialist</p>
      </div>

      <div className="rounded-xl border border-white/10 bg-white/[0.02] px-4 py-3">
        <p className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-500">
          Rank level {badgeProps.tierCode}
        </p>
        <div className="mt-2 flex items-center">
          <EventThonBadge
            tier={badgeProps.tier}
            label={badgeProps.label}
            variant="criteria"
            className="inline-block mr-2 sm:mr-3"
          />
          <span className="text-sm font-bold text-white">{badgeProps.label}</span>
        </div>
      </div>

      <p className="text-[13px] leading-relaxed text-slate-500">
        Control how you appear to clients and which alerts you receive. Changes apply after you save.
      </p>

      <div className="space-y-3">
        <label className="ep-prefs-row flex cursor-pointer items-center justify-between gap-4 rounded-xl border border-white/10 bg-white/[0.02] px-4 py-3.5">
          <span className="flex min-w-0 items-center gap-3">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-violet-500/15 text-violet-300">
              <FiEye className="h-4 w-4" aria-hidden />
            </span>
            <span className="min-w-0">
              <span className="block text-sm font-semibold text-slate-100">Public profile</span>
              <span className="mt-0.5 block text-[11px] text-slate-500">Show your profile in search and discovery.</span>
            </span>
          </span>
          <input
            type="checkbox"
            className="ep-prefs-toggle h-5 w-5 shrink-0 rounded border-white/20 bg-[#0b0e14] text-violet-500"
            checked={!!prefs.publicProfile}
            onChange={(e) => patch({ publicProfile: e.target.checked })}
          />
        </label>

        <label className="ep-prefs-row flex cursor-pointer items-center justify-between gap-4 rounded-xl border border-white/10 bg-white/[0.02] px-4 py-3.5">
          <span className="flex min-w-0 items-center gap-3">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-sky-500/15 text-sky-300">
              <FiBell className="h-4 w-4" aria-hidden />
            </span>
            <span className="min-w-0">
              <span className="block text-sm font-semibold text-slate-100">Message notifications</span>
              <span className="mt-0.5 block text-[11px] text-slate-500">Email or in-app alerts for new messages.</span>
            </span>
          </span>
          <input
            type="checkbox"
            className="ep-prefs-toggle h-5 w-5 shrink-0 rounded border-white/20 bg-[#0b0e14] text-violet-500"
            checked={!!prefs.notifyMessages}
            onChange={(e) => patch({ notifyMessages: e.target.checked })}
          />
        </label>

        <label className="ep-prefs-row flex cursor-pointer items-center justify-between gap-4 rounded-xl border border-white/10 bg-white/[0.02] px-4 py-3.5">
          <span className="flex min-w-0 items-center gap-3">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-emerald-500/15 text-emerald-300">
              <FiLayers className="h-4 w-4" aria-hidden />
            </span>
            <span className="min-w-0">
              <span className="block text-sm font-semibold text-slate-100">Gig &amp; order updates</span>
              <span className="mt-0.5 block text-[11px] text-slate-500">Alerts when gigs, proposals, or orders change.</span>
            </span>
          </span>
          <input
            type="checkbox"
            className="ep-prefs-toggle h-5 w-5 shrink-0 rounded border-white/20 bg-[#0b0e14] text-violet-500"
            checked={!!prefs.notifyGigs}
            onChange={(e) => patch({ notifyGigs: e.target.checked })}
          />
        </label>
      </div>

      <div className="ep-basic-footer flex justify-end pt-2">
        <button type="button" className="ep-btn-save-continue" onClick={savePreferences} disabled={saving}>
          {saving ? 'Saving…' : 'Save preferences'}
          <FiArrowRight className="h-4 w-4" aria-hidden />
        </button>
      </div>
    </div>
  );
};

export default EditProfilePreferencesFields;
