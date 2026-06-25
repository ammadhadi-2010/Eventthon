import { AlertTriangle, Bug, Building2, Flag, Headphones, Info, ShieldCheck } from 'lucide-react';

/** Static icons for admin alert filters; counts come from API. */
export const adminAlertCategoryIcons = {
  all: Info,
  verification: ShieldCheck,
  company_signup: Building2,
  flagged: Flag,
  system: AlertTriangle,
  support: Headphones,
  bug_report: Bug,
};

export function mergeAdminCategories(apiCategories = []) {
  return apiCategories.map((row) => ({
    ...row,
    icon: adminAlertCategoryIcons[row.key] || Info,
  }));
}
