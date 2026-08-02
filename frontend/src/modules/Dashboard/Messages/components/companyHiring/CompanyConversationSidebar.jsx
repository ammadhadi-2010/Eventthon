import React, { useCallback, useEffect, useState } from 'react';
import {
  createRecruiterNote,
  deleteRecruiterNote,
  fetchCompanyHiringContext,
  setCompanyConversationLabels,
  setCompanyHiringStage,
  updateRecruiterNote,
} from '../../services/companyHiringApi';
import ActivityTimeline from '../companyOps/ActivityTimeline';
import ConversationLabelsPanel from '../companyOps/ConversationLabelsPanel';
import HiringAnalyticsWidget from '../companyOps/HiringAnalyticsWidget';
import '../companyOps/company-ops.css';
import CandidateProfilePanel from './CandidateProfilePanel';
import HiringPipeline from './HiringPipeline';
import RecruiterNotesPanel from './RecruiterNotesPanel';
import './company-hiring-sidebar.css';

const DEFAULT_STAGES = [
  { id: 'applied', label: 'Applied' },
  { id: 'reviewing', label: 'Reviewing' },
  { id: 'shortlisted', label: 'Shortlisted' },
  { id: 'interview_scheduled', label: 'Interview Scheduled' },
  { id: 'technical_test', label: 'Technical Test' },
  { id: 'offer_sent', label: 'Offer Sent' },
  { id: 'hired', label: 'Hired' },
  { id: 'rejected', label: 'Rejected' },
];

export default function CompanyConversationSidebar({
  selectedMessage,
  onHiringStageChange,
  onLabelsChange,
}) {
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [stages, setStages] = useState(DEFAULT_STAGES);
  const [activeStage, setActiveStage] = useState('applied');
  const [profile, setProfile] = useState(null);
  const [notes, setNotes] = useState([]);
  const [labels, setLabels] = useState(['hiring']);
  const [timeline, setTimeline] = useState([]);

  const conversationKey = [
    selectedMessage?._id,
    selectedMessage?.channel,
    selectedMessage?.chat_type,
    selectedMessage?.candidate_user_id,
    selectedMessage?.context_id,
  ].join('|');

  const loadContext = useCallback(async (opts = {}) => {
    const soft = Boolean(opts.soft);
    if (!selectedMessage) {
      setProfile(null);
      setNotes([]);
      setTimeline([]);
      setLoading(false);
      return null;
    }
    if (selectedMessage.channel === 'admin_support' || selectedMessage.chat_type === 'admin_support') {
      setProfile({
        name: selectedMessage.from_user_name || 'EventThon Admin',
        location: 'EventThon Support',
        experience: 'Platform verification & employer help',
        skills: ['Support'],
        etRank: 'Admin',
        etLevel: '—',
        followers: 0,
        projects: [],
        gigs: [],
        languages: ['English'],
        isVerified: true,
        joinedAt: '',
      });
      setStages(DEFAULT_STAGES);
      setActiveStage('applied');
      setNotes([]);
      setLabels(['support']);
      setTimeline([]);
      setLoading(false);
      setError('');
      return null;
    }
    if (!soft) setLoading(true);
    setError('');
    try {
      const data = await fetchCompanyHiringContext(selectedMessage);
      if (!data) throw new Error('Could not load hiring context.');
      setStages(Array.isArray(data.stages) && data.stages.length ? data.stages : DEFAULT_STAGES);
      setActiveStage(data.hiringStage || 'applied');
      setProfile(data.profile || null);
      setNotes(Array.isArray(data.notes) ? data.notes : []);
      setLabels(Array.isArray(data.labels) ? data.labels : ['hiring']);
      setTimeline(Array.isArray(data.timeline) ? data.timeline : []);
      return data.hiringStage || 'applied';
    } catch (err) {
      setError(err?.response?.data?.detail || err?.message || 'Failed to load candidate workspace.');
      return null;
    } finally {
      setLoading(false);
    }
  }, [selectedMessage]);

  useEffect(() => {
    let alive = true;
    loadContext().then((stage) => {
      if (alive && stage) onHiringStageChange?.(stage);
    });
    return () => {
      alive = false;
    };
    // Reload only when the conversation identity changes — not on every inbox patch
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [conversationKey]);

  if (!selectedMessage) {
    return (
      <aside className="msgx-details-side chs-side">
        <p className="msgx-empty">Select a conversation to open the hiring workspace.</p>
      </aside>
    );
  }

  const changeStage = async (stageId) => {
    if (selectedMessage.channel === 'admin_support') return;
    setBusy(true);
    try {
      const data = await setCompanyHiringStage(selectedMessage, stageId);
      const next = data?.hiringStage || stageId;
      setActiveStage(next);
      onHiringStageChange?.(next);
      const refreshed = await fetchCompanyHiringContext(selectedMessage);
      if (refreshed?.timeline) setTimeline(refreshed.timeline);
    } catch (err) {
      setError(err?.response?.data?.detail || 'Could not update stage.');
    } finally {
      setBusy(false);
    }
  };

  const toggleLabel = async (labelId) => {
    if (selectedMessage.channel === 'admin_support') return;
    const next = labels.includes(labelId)
      ? labels.filter((x) => x !== labelId)
      : [...labels, labelId];
    setBusy(true);
    try {
      const data = await setCompanyConversationLabels(selectedMessage, next);
      const saved = data?.labels || next;
      setLabels(saved);
      onLabelsChange?.(saved);
      const refreshed = await fetchCompanyHiringContext(selectedMessage);
      if (refreshed?.timeline) setTimeline(refreshed.timeline);
    } catch (err) {
      setError(err?.response?.data?.detail || 'Could not update labels.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <aside className="msgx-details-side chs-side">
      <h4>Workspace</h4>
      {loading && !profile ? <p className="msgx-empty">Loading hiring context…</p> : null}
      {error ? <p className="chs-error">{error}</p> : null}

      {profile || !loading ? (
        <>
          {selectedMessage.channel !== 'admin_support' ? (
            <>
              <HiringAnalyticsWidget compact />
              <HiringPipeline
                stages={stages}
                activeStage={activeStage}
                onChangeStage={changeStage}
                busy={busy}
              />
              <ConversationLabelsPanel labels={labels} busy={busy} onToggle={toggleLabel} />
            </>
          ) : null}
          <CandidateProfilePanel profile={profile || {}} />
          {selectedMessage.channel !== 'admin_support' ? (
            <>
              <ActivityTimeline items={timeline} />
              <RecruiterNotesPanel
                notes={notes}
                busy={busy}
                onAdd={async (body) => {
                  setBusy(true);
                  try {
                    const note = await createRecruiterNote(selectedMessage, body);
                    if (note) setNotes((prev) => [note, ...prev]);
                  } finally {
                    setBusy(false);
                  }
                }}
                onEdit={async (id, body) => {
                  setBusy(true);
                  try {
                    const note = await updateRecruiterNote(id, body);
                    if (note) {
                      setNotes((prev) => prev.map((n) => (n.id === id ? note : n)));
                    }
                  } finally {
                    setBusy(false);
                  }
                }}
                onDelete={async (id) => {
                  if (!window.confirm('Delete this private note?')) return;
                  setBusy(true);
                  try {
                    await deleteRecruiterNote(id);
                    setNotes((prev) => prev.filter((n) => n.id !== id));
                  } finally {
                    setBusy(false);
                  }
                }}
              />
            </>
          ) : null}
        </>
      ) : null}
    </aside>
  );
}
