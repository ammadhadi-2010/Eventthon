import { EDIT_PROFILE_STEPS } from '../editProfile/editProfileSteps';

/** Progress reaches 100% after step 7 preferences are saved. */
export function computeProfileCompletionPct(userData, preferencesComplete, activeIndex = 0) {
  if (preferencesComplete || userData?.profile_onboarding_complete) return 100;
  const n = EDIT_PROFILE_STEPS.length;
  const stepFrac = n <= 1 ? 1 : activeIndex / (n - 1);
  return Math.min(99.9, Math.round((52 + stepFrac * 38) * 10) / 10);
}

export function readPreferencesFromUser(userData) {
  const pub =
    userData?.public_visibility ??
    userData?.pref_public_profile ??
    true;
  const msg =
    userData?.message_notifications ??
    userData?.pref_notify_messages ??
    true;
  const orders =
    userData?.order_alerts ?? userData?.pref_notify_gigs ?? true;
  return {
    publicProfile: pub !== false,
    notifyMessages: msg !== false,
    notifyGigs: orders !== false,
  };
}
