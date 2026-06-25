

export const theme = {
    cardBg: 'linear-gradient(145deg, #0f172a 0%, #1e293b 100%)',
    accent: '#3b82f6',
    danger: '#ef4444',
    success: '#10b981',
    textMain: '#f8fafc',  // Bilkul white
    textMuted: '#cbd5e0', //
    bgDark: '#020617',
    glass: 'rgba(30, 41, 59, 0.5)',
    border: 'rgba(255, 255, 255, 0.05)'
};

export const layoutStyle = {
    padding: '40px',
    background: '#020617',
    minHeight: '100vh',
    fontFamily: "'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
    color: '#fff'
};

export const gridStyle = {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
    gap: '25px'
};

// --- Squads.js styles ---
export const squadsContainerStyle = {
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
    WebkitFontSmoothing: 'antialiased',
    display: 'grid',
    gridTemplateColumns: '300px 1fr 300px',
    height: '100vh',
    background: '#010409',
    color: '#ffffff',
    overflow: 'hidden'
};

// --- SquadCommandCenter styles ---
export const cmdContainerStyle = {
    display: 'grid',
    gridTemplateColumns: '300px 1fr',
    height: '85vh',
    background: '#020617',
    borderRadius: '24px',
    overflow: 'hidden',
    border: '1px solid rgba(255, 255, 255, 0.05)',
    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)'
};

export const cmdSidebarStyle = {
    background: 'rgba(15, 23, 42, 0.8)',
    borderRight: '1px solid rgba(255, 255, 255, 0.05)',
    display: 'flex',
    flexDirection: 'column'
};

export const cmdTabStyle = (isActive) => ({
    display: 'flex', 
    alignItems: 'center', 
    gap: '12px', 
    padding: '12px 16px',
    borderRadius: '12px', 
    border: 'none',
    cursor: 'pointer',
    transition: '0.3s all ease',
    // Background logic
    background: isActive ? 'rgba(59, 130, 246, 0.15)' : 'transparent',
    // COLOR FIX: Active par Bright White/Blue, warna Silver
    color: isActive ? '#3b82f6' : '#cbd5e0', 
    fontWeight: isActive ? '700' : '500',
    fontSize: '14px'
});

export const cmdMainStyle = {
    display: 'flex', flexDirection: 'column', height: '100%', background: '#020617'
};

export const cmdScrollArea = {
    flex: 1, padding: '30px', overflowY: 'auto',
    background: 'radial-gradient(circle at top, #0f172a 0%, #020617 100%)'
};

export const cmdInputContainer = {
    padding: '25px 30px',
    background: 'rgba(2, 6, 23, 0.95)',
    borderTop: '1px solid rgba(255, 255, 255, 0.05)'
};

export const cmdInputWrapper = {
    display: 'flex', gap: '20px', alignItems: 'center',
    background: '#0f172a', padding: '12px 24px',
    borderRadius: '18px', border: '1px solid #1e293b'
};

export const cmdSendBtn = {
    background: '#3b82f6', border: 'none', color: '#fff',
    padding: '12px', borderRadius: '14px', cursor: 'pointer',
    display: 'flex', alignItems: 'center', justifyContent: 'center'
};

export const msgContentStyle = {
    background: '#1e293b', padding: '16px 20px',
    borderRadius: '20px 20px 20px 4px', color: '#e2e8f0',
    fontSize: '14px', lineHeight: '1.6',
    border: '1px solid rgba(255, 255, 255, 0.05)'
};

export const msgMetaStyle = {
    fontSize: '10px', color: '#475569', marginTop: '8px',
    fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px'
};

export const aiWidgetStyle = {
    margin: '15px',
    background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.1) 0%, rgba(37, 99, 235, 0.05) 100%)',
    padding: '20px', borderRadius: '20px',
    border: '1px solid rgba(59, 130, 246, 0.2)'
};

export const matchBadgeStyle = {
    color: '#10b981', fontSize: '10px', fontWeight: 'bold',
    background: 'rgba(16, 185, 129, 0.1)', padding: '2px 8px', borderRadius: '6px'
};

export const inviteBtnStyle = {
    width: '100%', marginTop: '10px', background: '#3b82f6',
    color: '#fff', border: 'none', padding: '12px', borderRadius: '12px',
    fontSize: '12px', fontWeight: 'bold', cursor: 'pointer',
    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
    boxShadow: '0 4px 15px rgba(59, 130, 246, 0.3)'
};
