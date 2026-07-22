import React from 'react';

export default function WalletSubpageHeader({ title, subtitle, actions = null }) {
  return (
    <header className="wallet-subpage-header">
      <div>
        <h1 className="wallet-header__title">{title}</h1>
        {subtitle ? <p className="wallet-header__subtitle">{subtitle}</p> : null}
      </div>
      {actions ? <div className="wallet-header__actions">{actions}</div> : null}
    </header>
  );
}
