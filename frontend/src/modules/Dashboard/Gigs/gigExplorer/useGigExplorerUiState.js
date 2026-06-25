import { useEffect, useRef, useState } from 'react';
import { DETAIL_TABS, hashForTab, tabIdFromHash } from './constants';

const VALID_TAB_IDS = new Set(DETAIL_TABS.map((t) => t.id));

/** Tab hash, preview media/package index, resets when selected gig row changes */
export default function useGigExplorerUiState(selectedId) {
  const [activePackage, setActivePackage] = useState('basic');
  const [activeMedia, setActiveMedia] = useState(0);
  const [detailTab, setDetailTab] = useState(() => {
    const fromHash = tabIdFromHash();
    return fromHash && VALID_TAB_IDS.has(fromHash) ? fromHash : 'overview';
  });
  const previousSelectedIdRef = useRef(null);

  const setTab = (tabId) => {
    const next = VALID_TAB_IDS.has(tabId) ? tabId : 'overview';
    setDetailTab(next);
    if (typeof window !== 'undefined') {
      const path = `${window.location.pathname}${window.location.search}${hashForTab(next)}`;
      window.history.replaceState(null, '', path);
    }
  };

  useEffect(() => {
    setActiveMedia(0);
    setActivePackage('basic');
    const prev = previousSelectedIdRef.current;
    if (prev !== null && prev !== selectedId && selectedId) {
      setDetailTab('overview');
      if (typeof window !== 'undefined') {
        window.history.replaceState(null, '', `${window.location.pathname}${window.location.search}`);
      }
    }
    previousSelectedIdRef.current = selectedId || null;
  }, [selectedId]);

  useEffect(() => {
    const onHash = () => {
      const id = tabIdFromHash();
      if (id) setDetailTab(id);
    };
    window.addEventListener('hashchange', onHash);
    return () => window.removeEventListener('hashchange', onHash);
  }, []);

  const [listDrawerOpen, setListDrawerOpen] = useState(false);
  const openListDrawer = () => setListDrawerOpen(true);
  const closeListDrawer = () => setListDrawerOpen(false);

  return {
    activePackage,
    setActivePackage,
    activeMedia,
    setActiveMedia,
    detailTab,
    setTab,
    listDrawerOpen,
    openListDrawer,
    closeListDrawer,
  };
}
