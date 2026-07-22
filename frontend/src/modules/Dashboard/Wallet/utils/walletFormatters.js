export function formatThonAmount(value, { signed = false, prefix = '' } = {}) {
  const amount = Number(value);
  if (!Number.isFinite(amount)) return signed ? '+0 Thon' : '0 Thon';
  const abs = Math.abs(amount).toLocaleString(undefined, { maximumFractionDigits: 0 });
  if (signed) {
    const sign = amount >= 0 ? '+' : '-';
    return `${sign}${abs} Thon`;
  }
  return `${prefix}${abs} Thon`;
}

/** @deprecated Use formatThonAmount */
export const formatEtAmount = formatThonAmount;

export function formatUsdFromThon(thonValue, thonPerUsd = 100) {
  const amount = Number(thonValue);
  const rate = Number(thonPerUsd) || 100;
  if (!Number.isFinite(amount)) return '0.00';
  return (amount / rate).toFixed(2);
}

/** @deprecated Use formatUsdFromThon */
export const formatUsdFromEt = (etValue) => formatUsdFromThon(etValue, 100);

export function formatTxDate(iso) {
  if (!iso) return '';
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return String(iso);
  return date.toLocaleString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

export function resolveThonBalances(wallet) {
  const thon = wallet?.balances?.THON || {};
  const available = Number(wallet?.available_thon ?? thon.available) || 0;
  const pending = Number(wallet?.pending_thon ?? thon.pending) || 0;
  const locked = Number(wallet?.locked_thon ?? thon.locked) || 0;
  const withdrawable = Number(wallet?.withdrawable_balance);
  const computedWithdrawable = Number.isFinite(withdrawable)
    ? withdrawable
    : Math.max(0, available - locked);
  return { available, pending, locked, withdrawable: computedWithdrawable };
}

export function usdToThon(usdAmount, thonPerUsd = 100) {
  const usd = Number(usdAmount);
  const rate = Number(thonPerUsd) || 100;
  if (!Number.isFinite(usd) || usd <= 0) return 0;
  return Math.round(usd * rate);
}
