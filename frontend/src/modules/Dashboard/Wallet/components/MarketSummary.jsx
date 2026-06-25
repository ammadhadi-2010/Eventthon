import React from 'react';
import { FiArrowUpRight, FiArrowDownRight } from 'react-icons/fi';

const MARKET_DATA = [
    { icon: 'TH', name: 'THON Coin', ticker: 'THON',  price: '$0.00987',   change: '+8.32%',  color: '#6366f1', positive: true },
    { icon: '₿',  name: 'Bitcoin', ticker: 'BTC',  price: '$67,245.10', change: '+1.25%',  color: '#f59e0b', positive: true },
    { icon: 'Ξ',  name: 'Ethereum',ticker: 'ETH',  price: '$3,456.78',  change: '+2.01%',  color: '#3b82f6', positive: true },
    { icon: 'T',  name: 'Tether',  ticker: 'USDT', price: '$1.00',      change: '+0.01%',  color: '#10b981', positive: true },
];

const MarketSummary = () => {
    return (
        <div style={styles.container}>

            {/* Header */}
            <div style={styles.header}>
                <h4 style={styles.title}>Market Summary</h4>
                <span style={styles.viewAll}>View All</span>
            </div>

            {/* Rows */}
            {MARKET_DATA.map((item, i) => (
                <div key={i} style={styles.row}>

                    {/* Icon */}
                    <div style={{ ...styles.icon, background: `${item.color}18`, border: `1px solid ${item.color}33`, color: item.color }}>
                        {item.icon}
                    </div>

                    {/* Name */}
                    <div style={styles.nameCol}>
                        <div style={styles.name}>{item.name}</div>
                        <div style={styles.ticker}>{item.ticker}</div>
                    </div>

                    {/* Price + Change */}
                    <div style={styles.priceCol}>
                        <div style={styles.price}>{item.price}</div>
                        <div style={{ ...styles.change, color: item.positive ? '#10b981' : '#ef4444' }}>
                            {item.positive
                                ? <FiArrowUpRight size={11} />
                                : <FiArrowDownRight size={11} />
                            }
                            {item.change}
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
};

const styles = {
    container: {},
    header: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '14px'
    },
    title: {
        margin: 0,
        fontSize: '14px',
        fontWeight: '800',
        color: '#e8eeff'
    },
    viewAll: {
        fontSize: '12px',
        color: '#6366f1',
        fontWeight: '700',
        cursor: 'pointer'
    },
    row: {
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        padding: '10px 0',
        borderBottom: '1px solid #0f1628'
    },
    icon: {
        width: '34px', height: '34px',
        borderRadius: '10px',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: '12px', fontWeight: '900', flexShrink: 0
    },
    nameCol: { flex: 1 },
    name: { fontSize: '13px', fontWeight: '700', color: '#c0cce8' },
    ticker: { fontSize: '10px', color: '#3b5070', marginTop: '2px' },
    priceCol: { textAlign: 'right' },
    price: { fontSize: '13px', fontWeight: '700', color: '#e8eeff' },
    change: {
        fontSize: '11px', fontWeight: '600', marginTop: '2px',
        display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '2px'
    }
};

export default MarketSummary;