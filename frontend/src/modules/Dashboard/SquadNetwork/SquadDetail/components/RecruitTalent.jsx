import React, { useState } from 'react';
import { FiSearch, FiPlusCircle } from 'react-icons/fi';
import { searchUsersBySkill } from '../../api/squadWorkspaceApi';
import { inviteSquadMember } from '../../api/squadsApi';

const RecruitTalent = ({ squadId, userData }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [results, setResults] = useState([]);
    const [invitingId, setInvitingId] = useState(null);

    const handleSearch = async (val) => {
        setSearchTerm(val);
        if (val.length > 2) {
            try {
                setResults(await searchUsersBySkill(val));
            } catch (err) { console.error(err); }
        } else setResults([]);
    };

    const handleInvite = async (talent) => {
        setInvitingId(talent.name);
        try {
            await inviteSquadMember(squadId, {
                name: talent.name,
                role: 'Collaborator',
                invited_by: userData?._id || userData?.id,
                invitee_user_id: talent._id || talent.id || talent.mobile,
            });
            alert(`Invitation sent to ${talent.name}.`);
        } catch { alert('Could not send invitation.'); }
        finally { setInvitingId(null); }
    };

    return (
        <div style={styles.card}>
            <h3 style={styles.title}>Recruit Talent</h3>
            <div style={styles.searchBox}>
                <FiSearch style={styles.searchIcon} />
                <input
                    type="text"
                    placeholder="Search skills..."
                    value={searchTerm}
                    onChange={e => handleSearch(e.target.value)}
                    style={styles.input}
                />
            </div>
            <div style={styles.grid}>
                {results.map(talent => (
                    <div key={talent.mobile || talent._id} style={styles.talentCard}>
                        <img
                            src={talent.imageurl || `https://ui-avatars.com/api/?name=${talent.name}&background=1e293b&color=fff`}
                            alt={talent.name}
                            style={styles.avatar}
                        />
                        <div style={{ flex: 1 }}>
                            <div style={styles.talentName}>{talent.name}</div>
                            <div style={styles.talentSkill}>{talent.skill}</div>
                        </div>
                        {invitingId === talent.name ? (
                            <span style={styles.sending}>Sending...</span>
                        ) : (
                            <FiPlusCircle
                                color="#10b981"
                                size={20}
                                style={{ cursor: 'pointer' }}
                                onClick={() => handleInvite(talent)}
                            />
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
};

const styles = {
    card: { background: '#13151c', padding: '20px', borderRadius: '20px', border: '1px solid #1e2130' },
    title: { margin: '0 0 16px', fontSize: '15px', fontWeight: '800', color: '#f0f4ff' },
    searchBox: { position: 'relative', marginBottom: '16px' },
    searchIcon: { position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#4a5070' },
    input: { width: '100%', boxSizing: 'border-box', background: '#0f1117', border: '1px solid #1e2130', padding: '11px 11px 11px 40px', borderRadius: '10px', color: '#fff', outline: 'none', fontSize: '13px' },
    grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '12px' },
    talentCard: { background: '#0f1117', padding: '12px', borderRadius: '12px', border: '1px solid #1e2130', display: 'flex', alignItems: 'center', gap: '10px' },
    avatar: { width: '38px', height: '38px', borderRadius: '10px', objectFit: 'cover' },
    talentName: { fontSize: '12px', fontWeight: '700', color: '#e8eeff' },
    talentSkill: { fontSize: '11px', color: '#3b82f6' },
    sending: { fontSize: '10px', color: '#3b82f6' },
};

export default RecruitTalent;
