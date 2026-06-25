import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FiBell } from 'react-icons/fi';

const NotificationIcon = ({ count }) => {
    const navigate = useNavigate();

    return (
        <div 
            onClick={() => navigate('/notifications/alerts')} 
            style={{ cursor: 'pointer', position: 'relative', display: 'flex', alignItems: 'center' }}
        >
            <FiBell size={22} color={count > 0 ? '#3b82f6' : "#64748b"} />
            {count > 0 && (
                <span style={{ 
                    position: 'absolute', top: '-5px', right: '-2px', 
                    background: '#ef4444', color: 'white', fontSize: '10px', 
                    borderRadius: '50%', padding: '2px 6px', fontWeight: 'bold',
                    border: '2px solid #0f172a' 
                }}>
                    {count}
                </span>
            )}
        </div>
    );
};

export default NotificationIcon;