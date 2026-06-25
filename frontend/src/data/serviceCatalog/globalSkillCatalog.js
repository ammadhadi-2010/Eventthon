/**
 * Suggested skills for profile / pickers (iconKey + iconUi presets — see iconUiPresets.js).
 */

import { deriveSkillIconUi } from './iconUiPresets.js';

const SKILL_ROWS = [
  ['React', 'code'],
  ['Next.js', 'code'],
  ['Vue.js', 'code'],
  ['Angular', 'code'],
  ['Node.js', 'cpu'],
  ['JavaScript', 'code'],
  ['TypeScript', 'code'],
  ['HTML', 'code'],
  ['CSS', 'layers'],
  ['SASS / SCSS', 'layers'],
  ['Python', 'cpu'],
  ['Java', 'cpu'],
  ['C#', 'code'],
  ['Go', 'cpu'],
  ['PHP', 'code'],
  ['Ruby', 'code'],
  ['Rust', 'cpu'],
  ['Swift', 'smartphone'],
  ['Kotlin', 'smartphone'],
  ['Dart', 'smartphone'],
  ['MongoDB', 'database'],
  ['PostgreSQL', 'database'],
  ['MySQL', 'database'],
  ['Redis', 'database'],
  ['Firebase', 'database'],
  ['AWS', 'cloud'],
  ['Azure', 'cloud'],
  ['Docker', 'cloud'],
  ['Kubernetes', 'cloud'],
  ['Tailwind CSS', 'layers'],
  ['Bootstrap', 'layers'],
  ['GraphQL', 'layers'],
  ['REST APIs', 'cloud'],
  ['Figma', 'pen'],
  ['Adobe XD', 'pen'],
  ['SEO', 'trending'],
  ['Google Analytics', 'database'],
  ['WordPress', 'file'],
  ['Shopify', 'shopping'],
  ['Electron', 'code'],
];

export const GLOBAL_SKILL_OPTIONS = SKILL_ROWS.map(([name, iconKey], i) => ({
  name,
  iconKey,
  iconUi: deriveSkillIconUi(i),
}));

export const GLOBAL_SKILL_NAMES = GLOBAL_SKILL_OPTIONS.map((s) => s.name);
