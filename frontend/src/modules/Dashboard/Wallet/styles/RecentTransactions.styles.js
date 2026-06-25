export const txStyles = {
    list: { display: 'flex', flexDirection: 'column' },
    row: {
        display: 'grid',
        gridTemplateColumns: '2fr 1fr 1fr 20px',
        alignItems: 'center',
        padding: '16px 0',
        borderBottom: '1px solid rgba(255, 255, 255, 0.03)',
        cursor: 'pointer',
        transition: 'background 0.2s',
    },
    left: { display: 'flex', alignItems: 'center', gap: '14px' },
    iconBox: {
        width: '42px',
        height: '42px',
        borderRadius: '12px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0
    },
    type: { fontSize: '14px', fontWeight: '700', color: '#ffffff' },
    desc: { fontSize: '11px', color: '#64748b', marginTop: '3px' },
    
    right: { textAlign: 'right', paddingRight: '20px' },
    amount: { fontSize: '14px', fontWeight: '800' },
    usd: { fontSize: '11px', color: '#64748b', marginTop: '3px' },
    
    dateCol: { textAlign: 'right', paddingRight: '15px' },
    date: { fontSize: '12px', fontWeight: '600', color: '#ffffff' },
    time: { fontSize: '11px', color: '#64748b', marginTop: '3px' },
    
    arrow: { color: '#334155' }
};