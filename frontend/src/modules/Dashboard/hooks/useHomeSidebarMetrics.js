import { useEffect, useState } from 'react';
import API from '../../../api/axiosConfig';
import { fetchProfileOverviewData } from '../Profile/services/profileOverviewService';
import { getProfileIdentifier, getProfileSessionHeaders } from '../Profile/utils/profileSession';
import { getWalletSummary } from '../Wallet/walletApi';
import { resolveThonBalances } from '../Wallet/utils/walletFormatters';

function emptyMetrics(userData) {
  return {
    squads: 0,
    followers: 0,
    connections: 0,
    xp: 0,
    xpProgressPct: 0,
    thonBalance: Number(userData?.wallet_balance) || 0,
  };
}

export function useHomeSidebarMetrics(userData) {
  const [metrics, setMetrics] = useState(() => emptyMetrics(userData));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const identifier = getProfileIdentifier(userData);
    if (!identifier) {
      setMetrics(emptyMetrics(userData));
      setLoading(false);
      return undefined;
    }

    let cancelled = false;

    const load = async () => {
      setLoading(true);
      try {
        const [overviewResult, hubResult, walletResult] = await Promise.allSettled([
          fetchProfileOverviewData(identifier),
          API.get('/api/dashboard/hub-metrics', {
            headers: getProfileSessionHeaders(),
            timeout: 15000,
          }),
          getWalletSummary(userData),
        ]);

        const overview = overviewResult.status === 'fulfilled' ? overviewResult.value : null;
        const stats = overview?.stats || {};
        const gamification = overview?.gamification || {};
        const squadsFromHub = hubResult.status === 'fulfilled'
          ? Number(hubResult.value?.data?.metrics?.squads?.joined_count)
          : NaN;
        const wallet = walletResult.status === 'fulfilled' ? walletResult.value : null;
        const { available } = resolveThonBalances(wallet);

        if (cancelled) return;

        setMetrics({
          squads: Number.isFinite(squadsFromHub) ? squadsFromHub : Number(stats.squads) || 0,
          followers: Number(stats.followers) || 0,
          connections: Number(stats.connections) || 0,
          xp: Number(gamification.current_xp) || 0,
          xpProgressPct: Math.min(100, Math.max(0, Number(gamification.progress_pct) || 0)),
          thonBalance: available || Number(userData?.wallet_balance) || 0,
        });
      } catch {
        if (!cancelled) setMetrics(emptyMetrics(userData));
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    load();
    const onProfileUpdated = () => load();
    window.addEventListener('et:profile-updated', onProfileUpdated);
    return () => {
      cancelled = true;
      window.removeEventListener('et:profile-updated', onProfileUpdated);
    };
  }, [userData?._id, userData?.id, userData?.email, userData?.mobile, userData?.wallet_balance]);

  return { metrics, loading };
}

export function formatSidebarCount(value) {
  const count = Number(value) || 0;
  if (count >= 1_000_000) {
    return `${(count / 1_000_000).toFixed(1).replace(/\.0$/, '')}M`;
  }
  if (count >= 1000) {
    return `${(count / 1000).toFixed(1).replace(/\.0$/, '')}K`;
  }
  return count.toLocaleString();
}
