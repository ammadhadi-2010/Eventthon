import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MONGO_ID_REGEX, isSellerFollowedInStorage, toggleFollowSellerInStorage } from './constants';
import { postGigReport } from './gigApiMutations';
import { runBetaGigInquire } from './gigBetaInquireFlow';
import { getGigsActorId } from '../utils/gigsSession';
import useGigExplorerModalLifecycle from './useGigExplorerModalLifecycle';

export default function useGigExplorerCommerce(selectedGig, savedRowsFromHook, toggleSavedHook, activePackage) {
  const navigate = useNavigate();
  const [savedGigIds, setSavedGigIds] = useState(() => {
    try {
      const raw = localStorage.getItem('savedGigIds');
      const parsed = raw ? JSON.parse(raw) : [];
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  });
  const [sidebarToast, setSidebarToast] = useState('');
  const [followingSeller, setFollowing] = useState(false);
  const [reportModalOpen, setReportModalOpen] = useState(false);
  const [reportDraft, setReportDraft] = useState('');
  const [reportSending, setReportSending] = useState(false);
  const [inquireSending, setInquireSending] = useState(false);

  useEffect(() => {
    if (!sidebarToast) return undefined;
    const timer = window.setTimeout(() => setSidebarToast(''), 4200);
    return () => window.clearTimeout(timer);
  }, [sidebarToast]);

  const buyerId = typeof window !== 'undefined' ? getGigsActorId() : '';
  const isOwnGig = Boolean(selectedGig && buyerId && selectedGig.sellerUserId && selectedGig.sellerUserId === buyerId);
  const isDemoGig = Boolean(selectedGig?.id?.startsWith?.('seed-'));
  const isLiveGig = Boolean(selectedGig?.id && MONGO_ID_REGEX.test(selectedGig.id));

  const isSidebarSaved = useMemo(() => {
    if (!selectedGig?.id) return false;
    if (MONGO_ID_REGEX.test(selectedGig.id)) {
      return savedRowsFromHook.some((row) => String(row.gig_ref_id) === String(selectedGig.id));
    }
    return savedGigIds.includes(selectedGig.id);
  }, [selectedGig?.id, savedRowsFromHook, savedGigIds]);

  useEffect(() => {
    const sid = selectedGig?.sellerUserId?.trim?.() || '';
    setFollowing(Boolean(sid && isSellerFollowedInStorage(sid)));
  }, [selectedGig?.sellerUserId]);

  const toggleSaveSidebar = async () => {
    if (!selectedGig?.id) return;
    if (!buyerId) {
      setSidebarToast('Log in to save gigs.');
      return;
    }
    if (isLiveGig) {
      try {
        const removing = isSidebarSaved;
        await toggleSavedHook({
          gig_ref_id: selectedGig.id,
          title: selectedGig.title,
          seller_name: selectedGig.sellerName,
          price_label: `$${selectedGig.price}`,
          location_label: 'Remote',
          posted_label: '',
          tags: Array.isArray(selectedGig.tags) ? selectedGig.tags.slice(0, 6) : [],
        });
        setSidebarToast(removing ? 'Removed from saved gigs.' : 'Saved — view under Saved Gigs.');
      } catch (error) {
        const msg = error?.response?.data?.detail || error?.message || 'Save failed.';
        setSidebarToast(String(msg));
      }
      return;
    }
    const next = isSidebarSaved ? savedGigIds.filter((x) => x !== selectedGig.id) : [...savedGigIds, selectedGig.id];
    setSavedGigIds(next);
    localStorage.setItem('savedGigIds', JSON.stringify(next));
    setSidebarToast(isSidebarSaved ? 'Removed from saved gigs.' : 'Saved — view under Saved Gigs.');
  };

  const copyShareLink = async () => {
    if (!selectedGig?.id || typeof window === 'undefined') return;
    const path = `/gigs/explorer?gig=${encodeURIComponent(selectedGig.id)}`;
    const full = `${window.location.origin}${path}`;
    try {
      await navigator.clipboard.writeText(full);
      setSidebarToast('Link copied.');
    } catch {
      setSidebarToast(full);
    }
  };

  const toggleFollowSeller = () => {
    if (!buyerId) {
      setSidebarToast('Log in to follow sellers.');
      return;
    }
    const sid = (selectedGig?.sellerUserId || '').trim();
    if (!sid) {
      setSidebarToast('This preview gig is not linked to a seller profile yet.');
      return;
    }
    if (isOwnGig) return;
    const { nowFollowing } = toggleFollowSellerInStorage(sid);
    setFollowing(nowFollowing);
    setSidebarToast(nowFollowing ? 'Following seller (stored on this browser).' : 'Unfollowed seller.');
  };

  const openReportModal = () => {
    if (!buyerId) {
      setSidebarToast('Log in to submit a report.');
      return;
    }
    setReportDraft('');
    setReportModalOpen(true);
  };

  const submitReportFromModal = async () => {
    if (!selectedGig?.id || !buyerId) return;
    const reason = reportDraft.trim();
    if (reason.length < 10) {
      setSidebarToast('Please write at least 10 characters describing the issue.');
      return;
    }
    setReportSending(true);
    try {
      await postGigReport({
        gig_id: selectedGig.id,
        reporter_user_id: buyerId,
        reason: reason.slice(0, 2000),
      });
      setSidebarToast('Report received. Thank you.');
      setReportModalOpen(false);
      setReportDraft('');
    } catch (error) {
      const msg = error?.response?.data?.detail || error?.message || 'Report failed.';
      setSidebarToast(String(msg));
    } finally {
      setReportSending(false);
    }
  };

  useGigExplorerModalLifecycle(selectedGig?.id, reportModalOpen, setReportModalOpen, setReportDraft);

  const startBetaInquire = async (packageTierKey) => {
    if (inquireSending) return;
    const tierKey = packageTierKey || activePackage || 'basic';
    setInquireSending(true);
    try {
      const result = await runBetaGigInquire({
        selectedGig,
        buyerId,
        packageTier: tierKey,
        navigate,
      });
      setSidebarToast(result.toast || (result.ok ? 'Opening Messages…' : 'Could not start chat.'));
    } catch (error) {
      const raw = error?.response?.data?.detail ?? error?.response?.data?.message ?? error.message;
      const msg = Array.isArray(raw) ? raw.map((r) => r.msg || r).join('; ') : String(raw || 'Inquire failed.');
      setSidebarToast(msg);
    } finally {
      setInquireSending(false);
    }
  };

  return {
    buyerId,
    isOwnGig,
    isDemoGig,
    isLiveGig,
    isSidebarSaved,
    followingSeller,
    sidebarToast,
    reportModalOpen,
    setReportModalOpen,
    reportDraft,
    setReportDraft,
    reportSending,
    inquireSending,
    toggleSaveSidebar,
    copyShareLink,
    toggleFollowSeller,
    openReportModal,
    submitReportFromModal,
    startBetaInquire,
  };
}
