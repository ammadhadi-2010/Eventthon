export const styles = {
    container: { display: 'flex', flexDirection: 'column', gap: '20px' },
    titleRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' },
    title: { margin: '0 0 4px', fontSize: '22px', fontWeight: '800', color: '#ffffff' }, // Pure White
    subtitle: { margin: 0, fontSize: '13px', color: '#94a3b8' }, // Light Gray for better reading
    titleActions: { display: 'flex', gap: '10px' },
    outlineBtn: {
        background: '#0f1628', border: '1px solid #1e2a45',
        color: '#ffffff', padding: '8px 14px', borderRadius: '10px', // Text white
        cursor: 'pointer', fontSize: '12px', fontWeight: '600',
        display: 'flex', alignItems: 'center', gap: '6px'
    },
    heroCard: {
        background: 'linear-gradient(135deg, #0f1628 0%, #1a1f35 100%)',
        borderRadius: '20px', border: '1px solid #1e2a45',
        padding: '28px', display: 'flex',
        justifyContent: 'space-between', alignItems: 'center',
        position: 'relative', overflow: 'hidden'
    },
    heroLeft: { display: 'flex', flexDirection: 'column', gap: '6px' },
    balanceLabel: { fontSize: '12px', color: '#cbd5e1', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '8px' }, // Bright Label
    eyeBtn: { background: 'none', border: 'none', color: '#cbd5e1', cursor: 'pointer', padding: 0 },
    balanceAmount: { fontSize: '36px', fontWeight: '900', color: '#ffffff', letterSpacing: '-1px' }, // Pure White
    balanceETC: { fontSize: '14px', color: '#818cf8', fontWeight: '600' }, // Lighter Indigo
    balanceChange: { fontSize: '12px', color: '#22c55e', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '5px', marginTop: '4px' }, // Bright Green
    heroRight: { display: 'flex', gap: '16px' },
    actionBtn: {
        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px',
        background: 'none', border: 'none', cursor: 'pointer'
    },
    actionIcon: (color) => ({
        width: '52px', height: '52px', borderRadius: '16px',
        background: `${color}25`, border: `1px solid ${color}55`, // Increased opacity for icons
        display: 'flex', alignItems: 'center', justifyContent: 'center'
    }),
    actionLabel: { fontSize: '11px', color: '#ffffff', fontWeight: '600' }, // Pure White
    tickerCard: {
        background: '#0d1425', borderRadius: '16px',
        border: '1px solid #1e2a45', padding: '16px 20px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between'
    },
    tickerLeft: { display: 'flex', alignItems: 'center', gap: '14px' },
    coinBadge: {
        width: '40px', height: '40px', borderRadius: '50%',
        background: 'linear-gradient(135deg, #6366f1, #4f46e5)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontWeight: '900', fontSize: '13px', color: '#ffffff',
        boxShadow: '0 0 16px rgba(99,102,241,0.4)'
    },
    tickerName: { fontSize: '13px', fontWeight: '700', color: '#ffffff', marginBottom: '3px' },
    verified: { fontSize: '10px', color: '#10b981', marginLeft: '6px' },
    tickerPrice: { fontSize: '18px', fontWeight: '900', color: '#ffffff' },
    tickerChange: { fontSize: '13px', color: '#22c55e', marginLeft: '8px' },
    tickerStats: { display: 'flex', gap: '32px' },
    tickerStat: { textAlign: 'right' },
    statLabel: { fontSize: '10px', color: '#94a3b8', marginBottom: '3px' },
    statVal: { fontSize: '13px', fontWeight: '700', color: '#ffffff' },
    grid: { display: 'grid', gridTemplateColumns: '1.6fr 1fr', gap: '20px', alignItems: 'start' },
    card: {
        background: '#0d1425', borderRadius: '18px',
        border: '1px solid #1e2a45', padding: '20px', position: 'relative'
    },
    cardHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' },
    cardTitle: { margin: 0, fontSize: '15px', fontWeight: '800', color: '#ffffff' },
    viewAllBtn: { background: 'none', border: 'none', color: '#818cf8', fontSize: '12px', fontWeight: '700', cursor: 'pointer' },
    tableHead: { display: 'grid', gridTemplateColumns: '2fr 1.5fr 1fr 0.8fr 1.2fr', padding: '8px 0', borderBottom: '1px solid #1a2235', marginBottom: '6px' },
    th: { fontSize: '10px', color: '#94a3b8', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.8px' }, // Clearer headers
    tableRow: { display: 'grid', gridTemplateColumns: '2fr 1.5fr 1fr 0.8fr 1.2fr', padding: '12px 0', borderBottom: '1px solid #0f1628', alignItems: 'center' },
    assetCol: { display: 'flex', alignItems: 'center', gap: '10px' },
    assetIcon: { width: '34px', height: '34px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px', fontWeight: '800', flexShrink: 0 },
    assetName: { fontSize: '13px', fontWeight: '700', color: '#ffffff' },
    assetTicker: { fontSize: '10px', color: '#94a3b8' },
    td: { fontSize: '12px', color: '#ffffff', fontWeight: '600' }, // Asset amounts white
    allocCol: { display: 'flex', flexDirection: 'column', gap: '4px' },
    allocText: { fontSize: '11px', color: '#ffffff', fontWeight: '600' },
    allocBar: { height: '3px', background: '#1a2235', borderRadius: '4px', width: '80px' },
    allocFill: { height: '100%', borderRadius: '4px' },
    pieCenter: { position: 'absolute', top: '155px', left: '50%', transform: 'translateX(-50%)', textAlign: 'center' },
    pieCenterValue: { fontSize: '14px', fontWeight: '900', color: '#ffffff' },
    pieCenterLabel: { fontSize: '10px', color: '#94a3b8' },
    legend: { display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '12px' },
    legendRow: { display: 'flex', alignItems: 'center', gap: '8px' },
    legendDot: { width: '8px', height: '8px', borderRadius: '50%', flexShrink: 0 },
    legendName: { flex: 1, fontSize: '12px', color: '#cbd5e1' },
    legendVal: { fontSize: '12px', fontWeight: '700', color: '#ffffff' }
};