import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { fetchSquadDetail } from '../api/squadsApi';
import { FiArrowLeft, FiTerminal } from 'react-icons/fi';
import SquadBanner from './components/SquadBanner';
import RecruitTalent from './components/RecruitTalent';
import Applications from './components/Applications';
import LeaderCard from './components/LeaderCard';
import MembersList from './components/MembersList';
import AnalyticsCard from './components/AnalyticsCard';

const SquadDetail = ({ userData }) => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [squad, setSquad] = useState(null);
    const [loading, setLoading] = useState(true);

    const fetchDetail = async () => {
        try {
            // Direct ID wala rasta use karen
            const data = await fetchSquadDetail(id);
            if (data && !data.error) setSquad(data);
        } catch (err) { 
            console.error("Detail Fetch Error:", err); 
        } finally { 
            setLoading(false); 
        }
    };

    useEffect(() => {
        fetchDetail();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [id]);

    if (loading) return <div style={styles.center}>Loading...</div>;
    if (!squad) return <div style={styles.center}>Squad not found.</div>;

    const isLeader = squad.leader_mobile === userData?.mobile;

    return (
        <div style={styles.page}>

            {/* Top Header */}
            <div style={styles.header}>
                <button onClick={() => navigate(-1)} style={styles.backBtn}>
                    <FiArrowLeft /> BACK
                </button>
                <button onClick={() => navigate(`/squad/command-center/${id}`)} style={styles.cmdBtn}>
                    <FiTerminal /> OPEN COMMAND CENTER
                </button>
            </div>

            {/* Main Grid */}
            <div style={styles.grid}>

                {/* LEFT COLUMN */}
                <div style={styles.leftCol}>
                    <SquadBanner squad={squad} />
                    <RecruitTalent squadId={id} userData={userData} />
                    {isLeader && <Applications squadId={id} squad={squad} onRefresh={fetchDetail} />}
                </div>

                {/* RIGHT SIDEBAR */}
                <div style={styles.rightCol}>
                    <LeaderCard leader={squad.leader_info} />
                    <MembersList members={squad.members_info} />
                    <AnalyticsCard />
                </div>

            </div>
        </div>
    );
};

const styles = {
    page: {
        background: '#0f1117',
        minHeight: '100vh',
        color: '#fff',
        padding: '24px',
        fontFamily: "'DM Sans', sans-serif"
    },
    header: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '28px'
    },
    backBtn: {
        background: 'none',
        border: 'none',
        color: '#3b82f6',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        fontSize: '13px',
        fontWeight: '700'
    },
    cmdBtn: {
        background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
        color: '#fff',
        border: 'none',
        padding: '10px 20px',
        borderRadius: '10px',
        fontWeight: '700',
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        cursor: 'pointer',
        fontSize: '13px'
    },
    grid: {
        display: 'grid',
        gridTemplateColumns: '1fr 320px',
        gap: '24px'
    },
    leftCol: {
        display: 'flex',
        flexDirection: 'column',
        gap: '20px'
    },
    rightCol: {
        display: 'flex',
        flexDirection: 'column',
        gap: '16px'
    },
    center: {
        color: '#fff',
        textAlign: 'center',
        padding: '50px'
    }
};

export default SquadDetail;