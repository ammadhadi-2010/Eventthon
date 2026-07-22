import React from 'react';
import WalletComingSoon from './WalletComingSoon';
import WalletBalancePanel from './WalletBalancePanel';
import WalletQuickActions from './WalletQuickActions';
import WalletRecentTransactions from './WalletRecentTransactions';
import WalletFooterBanner from './WalletFooterBanner';
import WalletHeader from './WalletHeader';

export default function WalletCenterRouter({
  activeSection,
  walletData,
  onNavigate,
  onViewAll,
}) {
  const { wallet, transactions, loading } = walletData;
  const back = () => onNavigate('wallet');

  if (activeSection !== 'wallet') {
    return <WalletComingSoon section={activeSection} onBack={back} />;
  }

  return (
    <div className="wallet-home-stack">
      <WalletHeader onNavigate={onNavigate} onWithdraw={() => onNavigate('withdraw')} />
      <WalletBalancePanel wallet={wallet} loading={loading} />
      <WalletQuickActions onNavigate={onNavigate} />
      <WalletRecentTransactions transactions={transactions} onViewAll={onViewAll} />
      <WalletFooterBanner />
    </div>
  );
}
