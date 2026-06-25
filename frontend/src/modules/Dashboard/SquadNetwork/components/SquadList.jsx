import React, { useState, useEffect } from 'react';
import { Compass } from 'lucide-react';
import { FiPlus, FiSearch, FiFilter } from 'react-icons/fi';
import SquadCard from './SquadCard';
import { canOpenPublicExplore, isSquadLeader } from '../utils/squadPermissions';
import { openSquadPublicShowroom } from '../utils/squadExplore';
import { fetchSquadsList } from '../api/squadsApi';

const MOCK_SQUADS = [
    { _id: '1', squad_name: 'SEO Masters', niche: 'SEO & Marketing Squad', members_count: 124, online: 18, icon: '🔍' },
    { _id: '2', squad_name: 'Web Dev Warriors', niche: 'Web Development Squad', members_count: 86, online: 12, icon: '</>' },
    { _id: '3', squad_name: 'AI Innovators', niche: 'AI & Machine Learning', members_count: 64, online: 7, icon: '🤖' },
    { _id: '4', squad_name: 'Design Hub', niche: 'UI/UX Design Squad', members_count: 54, online: 5, icon: '🎨' },
    { _id: '5', squad_name: 'Freelancer Hub', niche: 'Freelancing & Clients', members_count: 98, online: 9, icon: '💼' },
    { _id: '6', squad_name: 'Content Creators', niche: 'Content Writing Squad', members_count: 72, online: 6, icon: '✍️' },
    { _id: '7', squad_name: 'Startup Builders', niche: 'Startup & Business', members_count: 61, online: 4, icon: '🚀' },
];

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
}) => {
    const [squads, setSquads] = useState([]);
    const [internalSearchQuery, setInternalSearchQuery] = useState('');
    const searchQuery = searchQueryProp ?? internalSearchQuery;
    const setSearchQuery = onSearchQueryChange ?? setInternalSearchQuery;

    useEffect(() => {
        let active = true;
        fetchSquadsList({ force: refreshToken > 0 })
            .then((data) => {
                if (!active) return;
                const rows = data.squads || [];
                setSquads(rows.length ? rows : MOCK_SQUADS);
                if (selectedSquad?._id) return;
                const storedId = lastSquadIdKey ? sessionStorage.getItem(lastSquadIdKey) : null;
                const restored = storedId ? rows.find((row) => String(row._id) === String(storedId)) : null;
                if (restored) {
                    onSelectSquad(restored);
                }
            })
            .catch(() => {
                if (active) setSquads(MOCK_SQUADS);
            });
        return () => {
            active = false;
        };
    }, [refreshToken, lastSquadIdKey, onSelectSquad, selectedSquad?._id]);

    const leftTabs = [
        { label: 'All Squads', count: squads.length },
        { label: 'My Squads', count: Math.min(7, squads.length) },
        { label: 'Invites', count: 2 },
    ];

    const filteredByTab = squads.filter((squad, idx) => {
        if (activeTab === 'Invites') return idx < 2;
        if (activeTab === 'My Squads') return idx < Math.min(7, squads.length);
        return true;
    });
    const filteredSquads = filteredByTab.filter(s => s.squad_name?.toLowerCase().includes(searchQuery.toLowerCase()));

    return (
        <div className="squad-hub__list" style={styles.container}>

            {/* Header */}
            <div style={styles.header}>
                <div style={styles.headerTop}>
                    <h2 style={styles.title}>SQUADS</h2>
                    <button onClick={onCreateSquad} className="squad-hub__list-create-btn" style={styles.createBtn}>
                        <FiPlus size={14} /> Create Squad
                    </button>
                </div>

                {/* Search */}
                <div className="squad-hub__list-search" style={styles.searchBox}>
                    <FiSearch style={styles.searchIcon} />
                    <input
                        placeholder="Find squads..."
                        value={searchQuery}
                        onChange={e => setSearchQuery(e.target.value)}
                        style={styles.searchInput}
                    />
                    <FiFilter style={styles.filterIcon} />
                </div>

                {/* Tabs */}
                <div style={styles.tabs}>
                    {leftTabs.map(tab => (
                        <button
                            key={tab.label}
                            type="button"
                            className={`squad-hub__list-filter-tab${activeTab === tab.label ? ' is-active' : ''}`}
                            onClick={() => onTabChange(tab.label)}
                            style={styles.tab(activeTab === tab.label)}
                        >
                            {tab.label.split(' ')[0]}
                            <span style={styles.tabCount(activeTab === tab.label)}>
                                {tab.count}
                            </span>
                        </button>
                    ))}
                </div>
            </div>

            {/* Squad Cards */}
            <div style={styles.list}>
                {filteredSquads.map(s => (
                    <SquadCard
                        key={s._id}
                        squad={s}
                        isSelected={selectedSquad?._id === s._id}
                        onSelect={() => onSelectSquad(s)}
                        onEdit={isSquadLeader(s, userData) ? () => onEditSquad?.(s) : undefined}
                    />
                ))}
            </div>

            <div className="squad-hub__list-footer">
                <button
                    type="button"
                    className={`squad-hub__explore-link${selectedSquad && !canOpenPublicExplore(selectedSquad) ? ' squad-hub__explore-link--private' : ''}`}
                    onClick={() => openSquadPublicShowroom({ selectedSquad })}
                    disabled={!selectedSquad}
                    title={
                        selectedSquad && !canOpenPublicExplore(selectedSquad)
                            ? 'Private squad — members only in Squads. Enable Public listing in Settings to Explore.'
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
        borderBottom: '1px solid #1e2130'
    },
    headerTop: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '14px'
    },
    title: {
        margin: 0,
        fontSize: '16px',
        fontWeight: '800',
        color: '#f0f4ff',
        letterSpacing: '0.5px'
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
        fontWeight: '700'
    },
    searchBox: {
        position: 'relative',
        marginBottom: '14px'
    },
    searchIcon: {
        position: 'absolute',
        left: '10px',
        top: '50%',
        transform: 'translateY(-50%)',
        color: '#4a5070'
    },
    filterIcon: {
        position: 'absolute',
        right: '10px',
        top: '50%',
        transform: 'translateY(-50%)',
        color: '#4a5070',
        cursor: 'pointer'
    },
    searchInput: {
        width: '100%',
        boxSizing: 'border-box',
        background: '#0f1117',
        border: '1px solid #1e2130',
        padding: '9px 32px',
        borderRadius: '8px',
        color: '#c0c8e8',
        fontSize: '13px',
        outline: 'none'
    },
    tabs: {
        display: 'flex',
        gap: '4px'
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
        gap: '4px'
    }),
    tabCount: (active) => ({
        background: active ? '#3b82f6' : '#1e2130',
        color: active ? '#fff' : '#4a5070',
        borderRadius: '10px',
        padding: '1px 6px',
        fontSize: '10px',
        fontWeight: '800'
    }),
    list: {
        flex: 1,
        minHeight: 0,
        padding: '8px',
    },
};

export default SquadList;