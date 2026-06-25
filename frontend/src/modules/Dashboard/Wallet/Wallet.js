import React, { useState } from 'react';
import WalletSidebar from './components/WalletSidebar';
import WalletOverview from './components/WalletOverview';
import TransactionHistory from './components/TransactionHistory';
import QuickActions from './components/QuickActions';
import SendAssets from './components/SendAssets';

// Naye Finance Modules Import karein
import CoinExchange from './components/Finance/CoinExchange';
import BankDetails from './components/Finance/BankDetails';
import SecuritySettings from './components/settings/SecuritySettings';
import WalletSettings from './components/settings/WalletSettings';
import useWalletData from './hooks/useWalletData';

const Wallet = ({ userData }) => {
    const [activePage, setActivePage] = useState('overview');
    const {
        wallet,
        transactions,
        bankAccounts,
        security,
        preferences,
        loading,
        addBank,
        transfer,
        withdraw,
        saveSecurity,
        savePreferences,
    } = useWalletData(userData);

    // Content switch karne ka function
    const renderContent = () => {
        switch (activePage) {
            case 'overview':
                return <WalletOverview userData={userData} wallet={wallet} loading={loading} onNavigate={setActivePage} />;
            case 'transactions':
                return <TransactionHistory transactions={transactions} loading={loading} />;
            case 'send':
                return <SendAssets userData={userData} wallet={wallet} onTransfer={transfer} onWithdraw={withdraw} />;
            
            case 'exchange':
            case 'coin':
            case 'convert':
                return <CoinExchange />;
            case 'payment':
                return <BankDetails userData={userData} accounts={bankAccounts} onSaveAccount={addBank} />;
            case 'security':
                return <SecuritySettings security={security} onSave={saveSecurity} />;
            case 'settings':
                return <WalletSettings preferences={preferences} onSave={savePreferences} />;
            default:
                return <WalletOverview userData={userData} wallet={wallet} loading={loading} onNavigate={setActivePage} />;
        }
    };

    return (
        <div style={styles.layout}>

            {/* LEFT — Sidebar Navigation */}
            <WalletSidebar
                activePage={activePage}
                onNavigate={setActivePage}
                security={security}
            />

            {/* CENTER — Main Content (Dynamic) */}
            <div style={styles.main}>
                {renderContent()}
            </div>

            {/* RIGHT — Quick Actions */}
            <div style={styles.right}>
                {/* Aap QuickActions ko activePage pass kar sakte hain agar wahan se navigation karni ho */}
                <QuickActions onNavigate={setActivePage} />
            </div>

        </div>
    );
};

const styles = {
    layout: {
        display: 'grid',
        gridTemplateColumns: '220px 1fr 300px',
        minHeight: '100vh',
        background: '#080c14',
        color: '#fff',
        fontFamily: "'DM Sans', sans-serif",
        paddingTop: '0px' 
    },
    main: {
        overflowY: 'auto',
        padding: '30px 40px', 
        display: 'flex',
        flexDirection: 'column',
        gap: '24px'
    },
    right: {
        borderLeft: '1px solid #1a2235',
        background: '#0b1120',
        overflowY: 'auto',
        padding: '24px 20px'
    }
};

export default Wallet;