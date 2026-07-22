import React, { useMemo, useState } from 'react';
import { FiCheck, FiCopy, FiShare2 } from 'react-icons/fi';
import { buildWalletReceiveLink } from '../data/walletQuickActionsData';
import { formatThonAmount, resolveThonBalances } from '../utils/walletFormatters';
import WalletSubpageHeader from '../components/shared/WalletSubpageHeader';
import WalletSubpageShell from '../components/shared/WalletSubpageShell';

export default function WalletReceivePage({ wallet, userData, onBack }) {
  const address = wallet?.wallet_address || `0x${String(userData?._id || userData?.id || 'eventthon').slice(0, 6)}…${String(userData?._id || '0000').slice(-4)}`;
  const receiveLink = useMemo(() => buildWalletReceiveLink(address), [address]);
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(receiveLink)}`;
  const { available } = resolveThonBalances(wallet);

  const [copied, setCopied] = useState('');
  const [message, setMessage] = useState('');

  const copyText = async (text, key) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(key);
      setMessage('');
      window.setTimeout(() => setCopied(''), 2000);
    } catch {
      setMessage('Unable to copy — please copy manually.');
    }
  };

  const shareLink = async () => {
    if (navigator.share) {
      try {
        await navigator.share({ title: 'Send Thon to my EventThon Wallet', text: address, url: receiveLink });
        return;
      } catch { /* fall through */ }
    }
    copyText(receiveLink, 'share');
  };

  return (
    <WalletSubpageShell onBack={onBack}>
      <WalletSubpageHeader
        title="Receive Thon"
        subtitle={`Share your wallet to receive Thon · Balance ${formatThonAmount(available || 0)}`}
      />

      <section className="wallet-card wallet-sub-panel wallet-receive-panel">
        <div className="wallet-receive-qr">
          <img src={qrUrl} alt="Wallet QR code" width={200} height={200} />
        </div>
        <div className="wallet-receive-details">
          <h3>Your Wallet Address</h3>
          <code className="wallet-receive-address">{address}</code>
          <div className="wallet-receive-actions">
            <button type="button" className="wallet-btn wallet-btn--outline" onClick={() => copyText(address, 'address')}>
              {copied === 'address' ? <FiCheck size={14} /> : <FiCopy size={14} />}
              {copied === 'address' ? 'Copied' : 'Copy Address'}
            </button>
            <button type="button" className="wallet-btn wallet-btn--primary" onClick={shareLink}>
              <FiShare2 size={14} /> Share Link
            </button>
          </div>
          <label className="wallet-receive-link-label">
            <span>Payment Link</span>
            <input type="text" readOnly value={receiveLink} onFocus={(e) => e.target.select()} />
          </label>
          {message ? <p className="wallet-form-message">{message}</p> : null}
        </div>
      </section>

      <section className="wallet-card wallet-sub-panel">
        <h3>How to Receive Thon</h3>
        <ul className="wallet-tip-list">
          <li>Share your QR code or payment link with clients, squads, or collaborators.</li>
          <li>Incoming Thon appears in Available Balance once confirmed.</li>
          <li>Only share links with trusted EventThon members.</li>
        </ul>
      </section>
    </WalletSubpageShell>
  );
}
