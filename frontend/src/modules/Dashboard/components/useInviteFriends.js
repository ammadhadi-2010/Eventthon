import { useCallback, useEffect, useMemo, useState } from 'react';

import { fetchMyReferralSummary } from '../../../services/referralApi';

import { getProfileSessionHeaders } from '../Profile/utils/profileSession';

import { getUserDisplayName } from '../utils/dashboardMedia';

import {

  REFERRAL_SHARE_MESSAGES,

  buildReferralLink,

  facebookShareUrl,

  openBrowserShareWindow,

  whatsAppShareUrl,

  xShareUrl,

} from '../../../utils/referralStorage';



export const INVITE_MILESTONE = 5;

export const INVITE_REWARD_THON = 200;



export function inviteProgress(totalSignups) {

  const count = Number(totalSignups) || 0;

  const remainder = count % INVITE_MILESTONE;

  const displayCount = remainder === 0 && count > 0 ? INVITE_MILESTONE : remainder;

  return {

    displayCount,

    milestone: INVITE_MILESTONE,

    percent: (displayCount / INVITE_MILESTONE) * 100,

    rewardsEarned: Math.floor(count / INVITE_MILESTONE),

  };

}



function getSessionIdentifier() {

  const headers = getProfileSessionHeaders();

  return String(headers['X-User-Email'] || headers['X-User-Mobile'] || '').trim();

}



export default function useInviteFriends(userData) {

  const [summary, setSummary] = useState(null);

  const [loading, setLoading] = useState(true);

  const [copied, setCopied] = useState(false);

  const [modalOpen, setModalOpen] = useState(false);

  const [error, setError] = useState('');



  const identifier = getSessionIdentifier();

  const inviterName = useMemo(() => getUserDisplayName(userData) || '', [userData]);



  const load = useCallback(async () => {

    if (!identifier) {

      setLoading(false);

      setSummary(null);

      return;

    }

    setError('');

    setLoading(true);

    try {

      const data = await fetchMyReferralSummary();

      setSummary(data);

    } catch (err) {

      setSummary(null);

      setError(err?.response?.data?.detail || err?.message || 'Could not load invites.');

    } finally {

      setLoading(false);

    }

  }, [identifier]);



  useEffect(() => {

    load();

  }, [load]);



  const referralLink = summary?.referralCode ? buildReferralLink(summary.referralCode) : '';

  const totalSignups = summary?.referralSignups || 0;

  const progress = inviteProgress(totalSignups);



  const shareTextEn = referralLink ? REFERRAL_SHARE_MESSAGES.en(referralLink, inviterName) : '';

  const shareTextUr = referralLink ? REFERRAL_SHARE_MESSAGES.ur(referralLink, inviterName) : '';



  const copyLink = async () => {

    if (!referralLink) return;

    const payload = shareTextEn || referralLink;

    try {

      await navigator.clipboard.writeText(payload);

      setCopied(true);

      setTimeout(() => setCopied(false), 2000);

    } catch {

      window.prompt('Copy your invite link:', payload);

    }

  };



  const shareWhatsApp = (lang) => {

    const text = lang === 'ur' ? shareTextUr : shareTextEn;

    if (!text) return;

    openBrowserShareWindow(whatsAppShareUrl(text));

  };



  const shareFacebook = () => {

    if (!referralLink) return;

    openBrowserShareWindow(facebookShareUrl(referralLink));

  };



  const shareX = () => {

    if (!referralLink) return;

    openBrowserShareWindow(xShareUrl(referralLink, shareTextEn));

  };



  const nativeShare = async () => {

    if (!referralLink) return;

    if (!navigator.share) {

      copyLink();

      return;

    }

    try {

      await navigator.share({

        title: inviterName ? `${inviterName} invites you to EventThon` : 'Join EventThon',

        text: shareTextEn,

        url: referralLink,

      });

    } catch {

      /* cancelled */

    }

  };



  return {

    identifier,

    inviterName,

    summary,

    loading,

    copied,

    modalOpen,

    setModalOpen,

    error,

    referralLink,

    referralCode: summary?.referralCode,

    progress,

    copyLink,

    shareWhatsApp,

    shareFacebook,

    shareX,

    nativeShare,

    reload: load,

  };

}


