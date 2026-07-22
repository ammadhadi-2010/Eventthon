import React, { useCallback, useEffect, useState } from 'react';

import WalletHubLayout from './components/WalletHubLayout';

import WalletLeftSidebar from './components/WalletLeftSidebar';

import WalletCenterRouter from './components/WalletCenterRouter';

import WalletRightSidebar from './components/WalletRightSidebar';

import useWalletData from './hooks/useWalletData';

import './styles/wallet-hub.css';



const SHOW_RIGHT_RAIL = new Set([
  'wallet',
  'transactions',
  'withdraw',
  'rewards',
  'settings',
]);



export default function WalletPage({ userData }) {

  const walletData = useWalletData(userData);

  const { security } = walletData;

  const [activeSection, setActiveSection] = useState('wallet');

  const [leftDrawerOpen, setLeftDrawerOpen] = useState(false);



  const openLeftDrawer = useCallback(() => setLeftDrawerOpen(true), []);

  const closeLeftDrawer = useCallback(() => setLeftDrawerOpen(false), []);

  const handleSectionSelect = useCallback((section) => {

    setActiveSection(section);

    setLeftDrawerOpen(false);

  }, []);

  const handleNavigate = useCallback((target) => setActiveSection(target), []);

  const handleViewAll = useCallback(() => setActiveSection('transactions'), []);

  const handleManageSecurity = useCallback(() => setActiveSection('settings'), []);



  useEffect(() => {

    if (!leftDrawerOpen) return undefined;

    document.body.style.overflow = 'hidden';

    return () => { document.body.style.overflow = ''; };

  }, [leftDrawerOpen]);



  const showRightRail = SHOW_RIGHT_RAIL.has(activeSection);



  return (

    <WalletHubLayout

      leftRail={<WalletLeftSidebar activeSection={activeSection} onSectionSelect={handleSectionSelect} />}

      center={(

        <div className="wallet-center-stack">

          <WalletCenterRouter
            activeSection={activeSection}
            walletData={walletData}
            userData={userData}
            onNavigate={handleNavigate}
            onViewAll={handleViewAll}
          />

        </div>

      )}

      rightRail={showRightRail ? (

        <WalletRightSidebar security={security} onManageSecurity={handleManageSecurity} />

      ) : null}

      leftDrawerOpen={leftDrawerOpen}

      onOpenLeftDrawer={openLeftDrawer}

      onCloseLeftDrawer={closeLeftDrawer}

    />

  );

}

