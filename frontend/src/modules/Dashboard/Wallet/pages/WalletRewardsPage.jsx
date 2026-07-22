import React from 'react';

import { FiGift } from 'react-icons/fi';

import { DEMO_REWARDS } from '../data/walletSubpagesData';

import { formatThonAmount, formatTxDate } from '../utils/walletFormatters';

import { getWalletRowShade } from '../utils/walletCardShades';

import WalletSubpageHeader from '../components/shared/WalletSubpageHeader';



export default function WalletRewardsPage() {

  const rewards = DEMO_REWARDS;



  return (

    <div className="wallet-subpage-stack">

      <WalletSubpageHeader

        title="Thon Rewards"

        subtitle="Earn daily bonuses, complete challenges, and redeem Thon perks"

      />



      <article className="wallet-card wallet-rewards-balance">

        <div>

          <span>Thon Rewards Balance</span>

          <strong>{formatThonAmount(rewards.balance)}</strong>

        </div>

        <span className="wallet-rewards-balance__icon"><FiGift size={28} /></span>

      </article>



      <div className="wallet-rewards-grid">

        <section className="wallet-card wallet-sub-panel">

          <h3>Daily Rewards</h3>

          <p>Day {rewards.daily.streak} streak — claim {formatThonAmount(rewards.daily.amount)} today</p>

          <button type="button" className="wallet-btn wallet-btn--primary" disabled={rewards.daily.claimed}>

            {rewards.daily.claimed ? 'Claimed Today' : 'Claim Daily Reward'}

          </button>

        </section>



        <section className="wallet-card wallet-sub-panel">

          <h3>Weekly Challenge</h3>

          <p>{rewards.weekly.title} · Reward {formatThonAmount(rewards.weekly.reward)}</p>

          <div className="wallet-progress">

            <div className="wallet-progress__bar" style={{ width: `${rewards.weekly.progress}%` }} />

          </div>

          <small>{rewards.weekly.progress}% complete · Ends {rewards.weekly.deadline}</small>

        </section>

      </div>



      <section className="wallet-card wallet-sub-panel">

        <h3>Achievement Badges</h3>

        <div className="wallet-badges-grid">

          {rewards.badges.map((badge, index) => {

            const shade = getWalletRowShade(index);

            const Icon = badge.icon;

            return (

              <div

                key={badge.id}

                className={`wallet-badge-card wallet-badge-card--${shade}${badge.earned ? ' is-earned' : ''}`}

              >

                <span className={`wallet-badge-card__icon wallet-tx-row__icon--${shade}`}>

                  <Icon size={18} />

                </span>

                <strong>{badge.label}</strong>

                <small>{badge.earned ? 'Earned' : 'Locked'}</small>

              </div>

            );

          })}

        </div>

      </section>



      <div className="wallet-rewards-grid">

        <section className="wallet-card wallet-sub-panel">

          <h3>Rewards History</h3>

          <ul className="wallet-tx-list">

            {rewards.history.map((row, index) => {

              const shade = getWalletRowShade(index);

              return (

                <li key={row.id} className={`wallet-tx-row wallet-tx-row--${shade}`}>

                  <div className="wallet-tx-row__main">

                    <strong>{row.label}</strong>

                    <small>{formatTxDate(row.at)}</small>

                  </div>

                  <strong className="wallet-tx-amount--pos">{formatThonAmount(row.amount, { signed: true })}</strong>

                </li>

              );

            })}

          </ul>

        </section>



        <section className="wallet-card wallet-sub-panel">

          <h3>Redeem Store</h3>

          <ul className="wallet-redeem-list">

            {rewards.redeem.map((item, index) => {

              const shade = getWalletRowShade(index);

              const Icon = item.icon;

              return (

                <li key={item.id} className={`wallet-redeem-item wallet-tx-row--${shade}`}>

                  <span className={`wallet-tx-row__icon wallet-tx-row__icon--${shade}`}><Icon size={14} /></span>

                  <span>{item.label}</span>

                  <button type="button" className="wallet-btn wallet-btn--outline">{formatThonAmount(item.cost)}</button>

                </li>

              );

            })}

          </ul>

        </section>

      </div>



      <section className="wallet-card wallet-sub-panel">

        <h3>Upcoming Rewards</h3>

        <ul className="wallet-upcoming-list">

          {rewards.upcoming.map((item, index) => {

            const shade = getWalletRowShade(index);

            return (

              <li key={item.id} className={`wallet-upcoming-item wallet-tx-row--${shade}`}>

                <div>

                  <strong>{item.label}</strong>

                  <small>In {item.eta}</small>

                </div>

                <span className="wallet-tx-amount--pos">{formatThonAmount(item.amount, { signed: true })}</span>

              </li>

            );

          })}

        </ul>

      </section>

    </div>

  );

}


