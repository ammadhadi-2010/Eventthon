import React from 'react';
import { FiUserPlus } from 'react-icons/fi';
import InviteFriendsModal from './InviteFriendsModal';
import useInviteFriends, { INVITE_MILESTONE, INVITE_REWARD_THON } from './useInviteFriends';
export default function InviteFriendsSection({ userData }) {

  const invite = useInviteFriends(userData);



  if (!invite.identifier) return null;



  return (

    <>

      <section className="dash-invite-mini" aria-label="Invite friends">

        <div className="dash-invite-mini__top">

          <div className="dash-invite-mini__title-row">

            <FiUserPlus size={15} aria-hidden className="dash-invite-mini__icon" />

            <h3>Invite Friends</h3>

          </div>

          <span className="dash-invite-mini__reward-badge">{INVITE_REWARD_THON} Thon</span>

        </div>



        {invite.loading ? (

          <p className="dash-invite-mini__loading">Loading…</p>

        ) : invite.error ? (

          <p className="dash-invite-mini__error">{invite.error}</p>

        ) : (

          <>

            <div className="dash-invite-mini__progress-row">

              <span className="dash-invite-mini__progress-label">

                {invite.progress.displayCount}/{invite.progress.milestone} Friends

              </span>

              {invite.progress.rewardsEarned > 0 ? (

                <span className="dash-invite-mini__earned">{invite.progress.rewardsEarned}× earned</span>

              ) : null}

            </div>

            <div

              className="dash-invite-mini__bar"

              role="progressbar"

              aria-valuenow={invite.progress.displayCount}

              aria-valuemin={0}

              aria-valuemax={INVITE_MILESTONE}

            >

              <div className="dash-invite-mini__bar-fill" style={{ width: `${invite.progress.percent}%` }} />

            </div>

            <p className="dash-invite-mini__reward-copy">

              Reward: <strong>{INVITE_REWARD_THON} Thon</strong> every {INVITE_MILESTONE} invites

            </p>

            <button

              type="button"

              className="dash-invite-mini__cta"

              onClick={() => invite.setModalOpen(true)}

              disabled={!invite.referralCode}

            >

              Invite Now

            </button>

          </>

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

