import { getRankPresetByCode } from '../../../../models/Rank';

export function formatVipBenefitPreview(row = {}) {
  if (row.vipBenefitPreview) return row.vipBenefitPreview;
  const code = row.rankCode || '';
  const preset = getRankPresetByCode(code);
  const benefits = String(row.benefits || preset?.benefits || '').trim();
  if (!benefits) return `${code}: No benefit copy configured.`;
  return `${code}: ${benefits}`;
}

export function rankTableRows(rows = []) {
  return rows.map((row) => ({
    ...row,
    vipBenefitPreview: formatVipBenefitPreview(row),
    nextRankCode: row.nextRankCode || null,
  }));
}
