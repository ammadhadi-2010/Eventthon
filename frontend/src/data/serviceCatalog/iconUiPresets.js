/**
 * Icon surface treatments: primary categories use full glow; subs & skills use
 * different angles / intensity so tiles feel related but not identical.
 */

/** Sub-niche: shallower angle, slightly softer stops (inherits parent palette). */
export function deriveSubIconUi(parentIconUi, slotIndex = 0) {
  if (!parentIconUi?.gradient) {
    return {
      gradient:
        'linear-gradient(128deg, rgba(71, 85, 105, 0.42), rgba(51, 65, 85, 0.22))',
      glow: 'rgba(148, 163, 184, 0.26)',
    };
  }
  const angles = [122, 130, 138];
  const deg = angles[slotIndex % angles.length];
  const gradient = parentIconUi.gradient.replace(/\b\d+deg\b/, `${deg}deg`);
  return {
    gradient,
    glow: parentIconUi.glow,
    effect: 'sub',
  };
}

/** Tech / skill chips: cooler angle mix + tighter rim glow (independent of category). */
const SKILL_UI_PRESETS = [
  {
    gradient: 'linear-gradient(158deg, rgba(99, 102, 241, 0.52), rgba(34, 211, 238, 0.2))',
    glow: 'rgba(129, 140, 248, 0.36)',
    effect: 'skill',
  },
  {
    gradient: 'linear-gradient(162deg, rgba(34, 197, 94, 0.48), rgba(16, 185, 129, 0.22))',
    glow: 'rgba(52, 211, 153, 0.34)',
    effect: 'skill',
  },
  {
    gradient: 'linear-gradient(154deg, rgba(234, 88, 12, 0.5), rgba(245, 158, 11, 0.24))',
    glow: 'rgba(251, 191, 36, 0.34)',
    effect: 'skill',
  },
  {
    gradient: 'linear-gradient(160deg, rgba(219, 39, 119, 0.48), rgba(168, 85, 247, 0.26))',
    glow: 'rgba(244, 114, 182, 0.33)',
    effect: 'skill',
  },
  {
    gradient: 'linear-gradient(156deg, rgba(2, 132, 199, 0.5), rgba(59, 130, 246, 0.22))',
    glow: 'rgba(56, 189, 248, 0.34)',
    effect: 'skill',
  },
  {
    gradient: 'linear-gradient(164deg, rgba(124, 58, 237, 0.5), rgba(79, 70, 229, 0.2))',
    glow: 'rgba(167, 139, 250, 0.35)',
    effect: 'skill',
  },
  {
    gradient: 'linear-gradient(150deg, rgba(225, 29, 72, 0.46), rgba(244, 63, 94, 0.22))',
    glow: 'rgba(251, 113, 133, 0.32)',
    effect: 'skill',
  },
  {
    gradient: 'linear-gradient(168deg, rgba(71, 85, 105, 0.52), rgba(100, 116, 139, 0.2))',
    glow: 'rgba(148, 163, 184, 0.3)',
    effect: 'skill',
  },
];

export function deriveSkillIconUi(index = 0) {
  return { ...SKILL_UI_PRESETS[index % SKILL_UI_PRESETS.length] };
}
