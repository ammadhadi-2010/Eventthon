import { useEffect } from 'react';

export default function useGigExplorerModalLifecycle(gigId, reportModalOpen, setReportModalOpen, setReportDraft) {
  useEffect(() => {
    setReportModalOpen(false);
    setReportDraft('');
  }, [gigId, setReportModalOpen, setReportDraft]);

  useEffect(() => {
    if (!reportModalOpen) return undefined;
    const onKeyDown = (event) => {
      if (event.key === 'Escape') setReportModalOpen(false);
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [reportModalOpen, setReportModalOpen]);
}
