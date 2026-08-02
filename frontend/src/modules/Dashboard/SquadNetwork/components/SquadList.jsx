import React, { useEffect, useMemo, useState } from 'react';
import { Compass } from 'lucide-react';
import { FiEye, FiPlus, FiSearch, FiX } from 'react-icons/fi';
import SquadCard from './SquadCard';
import SquadInvitePreview from './SquadInvitePreview';
import { canOpenPublicExplore, isSquadLeader } from '../utils/squadPermissions';
import { openSquadPublicShowroom } from '../utils/squadExplore';
import { fetchSquadsList, respondSquadInvite } from '../api/squadsApi';
import { getMessagesSenderId } from '../../Messages/utils/messagesSession';
import { readStoredUserStub } from '../../../../utils/storedUser';

const SquadList = ({
  userData,
  selectedSquad,
  onSelectSquad,
  onEditSquad,
  activeTab,
  onTabChange,
  onCreateSquad,
  refreshToken = 0,
  searchQuery: searchQueryProp,
  onSearchQueryChange,
  lastSquadIdKey = '',
  onOpenInviteSquad,
}) => {
  const [squads, setSquads] = useState([]);
  const [counts, setCounts] = useState({ all: 0, mine: 0, invites: 0 });
  const [loading, setLoading] = useState(true);
  const [listError, setListError] = useState('');
  const [busyId, setBusyId] = useState('');
  const [previewSquad, setPreviewSquad] = useState(null);
  const [internalSearchQuery, setInternalSearchQuery] = useState('');
  const searchQuery = searchQueryProp ?? internalSearchQuery;
  const setSearchQuery = onSearchQueryChange ?? setInternalSearchQuery;

  const loadList = async (force = false) => {
    setLoading(true);
    setListError('');
    try {
      const data = await fetchSquadsList({ force: force || refreshToken > 0, scope: 'all' });
      const rows = data.squads || [];
      setSquads(rows);
      setCounts(data.counts || { all: rows.length, mine: 0, invites: 0 });
      if (!selectedSquad?._id) {
        const storedId = lastSquadIdKey ? sessionStorage.getItem(lastSquadIdKey) : null;
        const restored = storedId
          ? rows.find((row) => String(row._id) === String(storedId))
          : null;
        if (restored?.membership === 'pending') {
          setPreviewSquad(restored);
          onTabChange?.('Invites');
        } else if (restored) {
          onSelectSquad(restored);
        }
      }
    } catch (err) {
      setSquads([]);
      setCounts({ all: 0, mine: 0, invites: 0 });
      setListError(err?.response?.data?.detail || err?.message || 'Could not load squads.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let active = true;
    loadList(true).then(() => {
      if (!active) return;
    });
    return () => {
      active = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [refreshToken, lastSquadIdKey]);

  const leftTabs = [
    { label: 'All Squads', key: 'all', count: counts.all ?? squads.length },
    {
      label: 'My Squads',
      key: 'mine',
      count: counts.mine ?? squads.filter((s) => s.membership === 'member').length,
    },
    {
      label: 'Invites',
      key: 'invites',
      count: counts.invites ?? squads.filter((s) => s.membership === 'pending').length,
    },
  ];

  const filteredByTab = useMemo(() => {
    if (activeTab === 'Invites') {
      return squads.filter((s) => s.membership === 'pending');
    }
    if (activeTab === 'My Squads') {
      return squads.filter((s) => s.membership === 'member');
    }
    return squads;
  }, [squads, activeTab]);

  const filteredSquads = filteredByTab.filter((s) =>
    String(s.squad_name || '')
      .toLowerCase()
      .includes(String(searchQuery || '').toLowerCase()),
  );

  const openInvitePreview = (squad) => {
    setPreviewSquad(squad);
  };

  const handleSelectCard = (squad) => {
    if (squad?.membership === 'pending') {
      openInvitePreview(squad);
      return;
    }
    onSelectSquad?.(squad);
  };

  const handleRespond = async (squad, action) => {
    const sid = squad?._id;
    if (!sid) return;
    setBusyId(`${sid}:${action}`);
    try {
      const userId =
        getMessagesSenderId(readStoredUserStub() || userData) ||
        userData?._id ||
        userData?.id ||
        '';
      await respondSquadInvite(sid, action, userId);
      await loadList(true);
      if (action === 'accept') {
        onSelectSquad?.(squad);
        onOpenInviteSquad?.(squad);
      }
    } catch (err) {
      window.alert(
        err?.response?.data?.detail ||
          err?.response?.data?.message ||
          err?.message ||
          'Could not update invitation.',
      );
    } finally {
      setBusyId('');
    }
  };

  return (
    <div className="squad-hub__list" style={styles.container}>
      <div style={styles.header}>
        <div style={styles.headerTop}>
          <h2 style={styles.title}>SQUADS</h2>
          <button onClick={onCreateSquad} className="squad-hub__list-create-btn" style={styles.createBtn}>
            <FiPlus size={14} /> Create Squad
          </button>
        </div>

        <div className="squad-hub__list-search" style={styles.searchBox}>
          <FiSearch style={styles.searchIcon} />
          <input
            placeholder="Find squads..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={styles.searchInput}
          />
        </div>

        <div style={styles.tabs}>
          {leftTabs.map((tab) => (
            <button
              key={tab.label}
              type="button"
              className={`squad-hub__list-filter-tab${activeTab === tab.label ? ' is-active' : ''}`}
              onClick={() => onTabChange(tab.label)}
              style={styles.tab(activeTab === tab.label)}
            >
              {tab.label.split(' ')[0]}
              <span style={styles.tabCount(activeTab === tab.label)}>{tab.count}</span>
            </button>
          ))}
        </div>
      </div>

      <div style={styles.list}>
        {loading ? <div style={styles.empty}>Loading squads…</div> : null}
        {!loading && listError ? <div style={styles.empty}>{listError}</div> : null}
        {!loading && !listError && filteredSquads.length === 0 ? (
          <div style={styles.empty}>
            {activeTab === 'Invites'
              ? 'No pending invites.'
              : 'No squads yet. Create one to start.'}
          </div>
        ) : null}

        {activeTab === 'Invites' && filteredSquads.length > 0 ? (
          <p style={styles.inviteHint}>Preview a squad first, then accept if it fits you.</p>
        ) : null}

        {filteredSquads.map((s) => (
          <div key={s._id} style={styles.cardWrap}>
            <SquadCard
              squad={s}
              isSelected={selectedSquad?._id === s._id || previewSquad?._id === s._id}
              onSelect={() => handleSelectCard(s)}
              onEdit={isSquadLeader(s, userData) ? () => onEditSquad?.(s) : undefined}
            />
            {s.membership === 'pending' ? (
              <div style={styles.inviteActions}>
                <button
                  type="button"
                  style={styles.acceptBtn}
                  onClick={() => openInvitePreview(s)}
                >
                  <FiEye size={13} /> Preview
                </button>
                <button
                  type="button"
                  style={styles.declineBtn}
                  disabled={busyId.startsWith(String(s._id))}
                  onClick={() => handleRespond(s, 'decline')}
                >
                  <FiX size={13} /> Decline
                </button>
              </div>
            ) : null}
          </div>
        ))}
      </div>

      <SquadInvitePreview
        open={Boolean(previewSquad)}
        squad={previewSquad}
        userData={userData}
        onClose={() => setPreviewSquad(null)}
        onAccepted={async (data) => {
          setPreviewSquad(null);
          await loadList(true);
          const joined = { ...(previewSquad || {}), ...(data || {}), membership: 'member' };
          onSelectSquad?.(joined);
          onOpenInviteSquad?.(joined);
        }}
        onDeclined={async () => {
          setPreviewSquad(null);
          await loadList(true);
        }}
      />

      <div className="squad-hub__list-footer">
        <button
          type="button"
          className={`squad-hub__explore-link${
            selectedSquad && !canOpenPublicExplore(selectedSquad)
              ? ' squad-hub__explore-link--private'
              : ''
          }`}
          onClick={() => openSquadPublicShowroom({ selectedSquad })}
          disabled={!selectedSquad}
          title={
            selectedSquad && !canOpenPublicExplore(selectedSquad)
              ? 'Private squad — enable Public listing in Settings to Explore.'
              : 'Open public showroom'
          }
        >
          <Compass size={16} aria-hidden />
          {selectedSquad && canOpenPublicExplore(selectedSquad)
            ? 'Explore Squad'
            : 'Explore (Public only)'}
        </button>
      </div>
    </div>
  );
};

const styles = {
  container: {
    background: '#13151c',
    borderRight: '1px solid #1e2130',
    display: 'flex',
    flexDirection: 'column',
    minHeight: 0,
    height: '100%',
  },
  header: {
    padding: '18px 16px 12px',
    borderBottom: '1px solid #1e2130',
  },
  headerTop: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '14px',
  },
  title: {
    margin: 0,
    fontSize: '16px',
    fontWeight: '800',
    color: '#f0f4ff',
    letterSpacing: '0.5px',
  },
  createBtn: {
    background: '#3b82f6',
    color: '#fff',
    border: 'none',
    padding: '7px 12px',
    borderRadius: '8px',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '5px',
    fontSize: '12px',
    fontWeight: '700',
  },
  searchBox: {
    position: 'relative',
    marginBottom: '14px',
  },
  searchIcon: {
    position: 'absolute',
    left: '10px',
    top: '50%',
    transform: 'translateY(-50%)',
    color: '#4a5070',
  },
  searchInput: {
    width: '100%',
    boxSizing: 'border-box',
    background: '#0f1117',
    border: '1px solid #1e2130',
    padding: '9px 12px 9px 32px',
    borderRadius: '8px',
    color: '#c0c8e8',
    fontSize: '13px',
    outline: 'none',
  },
  tabs: {
    display: 'flex',
    gap: '4px',
  },
  tab: (active) => ({
    flex: 1,
    padding: '6px 4px',
    borderRadius: '7px',
    border: 'none',
    background: active ? '#1e2a4a' : 'transparent',
    color: active ? '#3b82f6' : '#4a5070',
    fontSize: '11px',
    fontWeight: '700',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '4px',
  }),
  tabCount: (active) => ({
    background: active ? '#3b82f6' : '#1e2130',
    color: active ? '#fff' : '#4a5070',
    borderRadius: '10px',
    padding: '1px 6px',
    fontSize: '10px',
    fontWeight: '800',
  }),
  list: {
    flex: 1,
    minHeight: 0,
    padding: '8px',
    overflowY: 'auto',
  },
  empty: {
    padding: '24px 12px',
    textAlign: 'center',
    color: '#64748b',
    fontSize: '13px',
  },
  inviteHint: {
    margin: '0 4px 10px',
    fontSize: '12px',
    lineHeight: 1.4,
    color: '#94a3b8',
  },
  cardWrap: {
    marginBottom: '8px',
  },
  inviteActions: {
    display: 'flex',
    gap: '8px',
    marginTop: '-4px',
    padding: '0 8px 8px',
  },
  acceptBtn: {
    flex: 1,
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '4px',
    border: 'none',
    borderRadius: '8px',
    padding: '7px 8px',
    background: '#3b82f6',
    color: '#fff',
    fontSize: '12px',
    fontWeight: 700,
    cursor: 'pointer',
  },
  declineBtn: {
    flex: 1,
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '4px',
    border: '1px solid #334155',
    borderRadius: '8px',
    padding: '7px 8px',
    background: '#0f1117',
    color: '#94a3b8',
    fontSize: '12px',
    fontWeight: 700,
    cursor: 'pointer',
  },
};

export default SquadList;
