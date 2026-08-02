import React, { useEffect } from 'react';

import { FiCopy, FiShare2, FiX } from 'react-icons/fi';

import { FaFacebookF, FaWhatsapp, FaXTwitter } from 'react-icons/fa6';

import { INVITE_MILESTONE, INVITE_REWARD_THON } from './useInviteFriends';



export default function InviteFriendsModal({

  open,

  onClose,

  referralLink,

  referralCode,

  inviterName,

  copied,

  onCopy,

  onWhatsApp,

  onFacebook,

  onX,

  onShare,

}) {

  useEffect(() => {

    if (!open) return undefined;

    const onKey = (e) => {

      if (e.key === 'Escape') onClose();

    };

    document.addEventListener('keydown', onKey);

    document.body.style.overflow = 'hidden';

    return () => {

      document.removeEventListener('keydown', onKey);

      document.body.style.overflow = '';

    };

  }, [open, onClose]);



  if (!open) return null;



  const canNativeShare = typeof navigator !== 'undefined' && typeof navigator.share === 'function';



  return (

    <div className="dash-invite-modal" role="presentation" onClick={onClose}>

      <div

        className="dash-invite-modal__panel"

        role="dialog"

        aria-modal="true"

        aria-labelledby="invite-modal-title"

        onClick={(e) => e.stopPropagation()}

      >

        <header className="dash-invite-modal__head">

          <div>

            <h2 id="invite-modal-title">Invite friends</h2>

            <p>

              {inviterName ? `${inviterName}, share your personal link` : 'Share your personal link'}

              {' '}— earn {INVITE_REWARD_THON} Thon every {INVITE_MILESTONE} signups.

            </p>

          </div>

          <button type="button" className="dash-invite-modal__close" onClick={onClose} aria-label="Close">

            <FiX size={18} />

          </button>

        </header>



        {referralCode ? (

          <div className="dash-invite-modal__code">

            <span>Your code</span>

            <strong>{referralCode}</strong>

          </div>

        ) : null}



        <p className="dash-invite-modal__hint">
          Share opens in a new tab of this browser. Log into Facebook/X here — not in Opera or another browser.
        </p>



        <div className="dash-invite-modal__actions">

          <button type="button" className="dash-invite-modal__btn dash-invite-modal__btn--primary" onClick={onCopy}>

            <FiCopy size={16} /> {copied ? 'Copied!' : 'Copy link'}

          </button>

          <button type="button" className="dash-invite-modal__btn dash-invite-modal__btn--facebook" onClick={onFacebook} disabled={!referralLink}>

            <FaFacebookF size={16} /> Facebook

          </button>

          <button type="button" className="dash-invite-modal__btn dash-invite-modal__btn--x" onClick={onX} disabled={!referralLink}>

            <FaXTwitter size={16} /> X (Twitter)

          </button>

          <button type="button" className="dash-invite-modal__btn" onClick={() => onWhatsApp('ur')}>

            <FaWhatsapp size={16} /> WhatsApp (Urdu)

          </button>

          <button type="button" className="dash-invite-modal__btn" onClick={() => onWhatsApp('en')}>

            <FaWhatsapp size={16} /> WhatsApp (English)

          </button>

          {canNativeShare ? (

            <button type="button" className="dash-invite-modal__btn" onClick={onShare}>

              <FiShare2 size={16} /> More apps

            </button>

          ) : null}

        </div>

      </div>

    </div>

  );

}


