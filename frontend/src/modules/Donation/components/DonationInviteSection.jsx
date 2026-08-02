import React from 'react';
import { Link } from 'react-router-dom';
import { FiArrowRight, FiUserPlus } from 'react-icons/fi';
import InviteFriendsModal from '../../Dashboard/components/InviteFriendsModal';
import useInviteFriends, { INVITE_MILESTONE, INVITE_REWARD_THON } from '../../Dashboard/components/useInviteFriends';
import { readStoredUserStub } from '../../../utils/storedUser';
import '../../Dashboard/components/growth/growth-ui.css';

export default function DonationInviteSection({ userData, title, subtitle }) {
  const effectiveUser = userData || readStoredUserStub();
  const invite = useInviteFriends(effectiveUser);

  const openInvite = () => {
    if (!invite.identifier) return;
    invite.setModalOpen(true);
  };

  return (
    <>
      <section className="donation-invite" aria-label="Invite friends">
        <div className="donation-invite__copy">
          <h2>{title}</h2>
          <p>{subtitle}</p>

          {!invite.identifier ? (
            <p className="donation-invite__hint">
              Sign in to get your personal invite link and earn Thon rewards.
            </p>
          ) : invite.loading ? (
            <p className="donation-invite__hint">Loading your invite link…</p>
          ) : invite.error ? (
            <p className="donation-invite__error">{invite.error}</p>
          ) : (
            <div className="donation-invite__stats">
              <div className="donation-invite__stats-row">
                <span>
                  {invite.progress.displayCount}/{invite.progress.milestone} friends invited
                </span>
                <span className="donation-invite__reward-pill">{INVITE_REWARD_THON} Thon / {INVITE_MILESTONE} invites</span>
              </div>
              <div
                className="donation-invite__bar"
                role="progressbar"
                aria-valuenow={invite.progress.displayCount}
                aria-valuemin={0}
                aria-valuemax={INVITE_MILESTONE}
              >
                <div className="donation-invite__bar-fill" style={{ width: `${invite.progress.percent}%` }} />
              </div>
              {invite.referralCode ? (
                <p className="donation-invite__code">Your code: <strong>{invite.referralCode}</strong></p>
              ) : null}
            </div>
          )}
        </div>

        {!invite.identifier ? (
          <Link to="/auth/sign-in" state={{ from: '/donate' }} className="donation-invite__btn">
            Sign in to invite <FiArrowRight size={16} aria-hidden />
          </Link>
        ) : (
          <button
            type="button"
            className="donation-invite__btn"
            onClick={openInvite}
            disabled={invite.loading || !invite.referralCode}
          >
            <FiUserPlus size={16} aria-hidden /> Invite Friends
          </button>
        )}
      </section>

      <InviteFriendsModal
        open={invite.modalOpen}
        onClose={() => invite.setModalOpen(false)}
        referralLink={invite.referralLink}
        referralCode={invite.referralCode}
        inviterName={invite.inviterName}
        copied={invite.copied}
        onCopy={invite.copyLink}
        onWhatsApp={invite.shareWhatsApp}
        onFacebook={invite.shareFacebook}
        onX={invite.shareX}
        onShare={invite.nativeShare}
      />
    </>
  );
}
