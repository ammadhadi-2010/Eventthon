import React from 'react';
import {
  FiArrowDownLeft, FiArrowUpRight, FiCreditCard, FiDollarSign, FiList, FiPlus,
} from 'react-icons/fi';
import { QUICK_ACTIONS } from '../data/walletDemoData';

const ACTION_ICONS = {
  'add-balance': FiPlus,
  send: FiArrowUpRight,
  receive: FiArrowDownLeft,
  withdraw: FiDollarSign,
  transactions: FiList,
  'payment-request': FiCreditCard,
};

export default function WalletQuickActions({ onNavigate }) {
  return (
    <div className="wallet-quick-actions-scroll">
      <section className="wallet-quick-actions" aria-label="Quick wallet actions">
        {QUICK_ACTIONS.map((action) => {
          const Icon = ACTION_ICONS[action.target] || FiCreditCard;
          return (
            <button
              key={action.id}
              type="button"
              className="wallet-quick-action"
              onClick={() => onNavigate?.(action.target)}
            >
              <span className="wallet-quick-action__icon" style={{ '--action-color': action.color }}>
                <Icon size={20} />
              </span>
              <span>{action.label}</span>
            </button>
          );
        })}
      </section>
    </div>
  );
}
