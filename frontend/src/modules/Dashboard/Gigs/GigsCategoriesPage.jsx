import React from 'react';
import { FiArrowLeft } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import { GLOBAL_SERVICE_CATEGORY_OPTIONS } from '../../../data/globalCategories';
import './styles/GigsDashboard.css';
import { gigsCategoryIcons, GigsCategoryIconFallback } from './utils/gigsBrowseCategoryIcons';

const GigsCategoriesPage = () => {
  const navigate = useNavigate();

  const openCategoryProviders = (name) => {
    navigate(`/gigs/providers?category=${encodeURIComponent(name.trim())}`);
  };

  return (
    <div className="gigs-page">
      <section className="gigs-card gigs-jobs-board">
        <div style={{ marginBottom: 14 }}>
          <button
            type="button"
            onClick={() => navigate('/gigs')}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              border: 0,
              background: 'transparent',
              color: '#38bdf8',
              cursor: 'pointer',
              fontSize: 12,
              fontWeight: 700,
              padding: 0,
              marginBottom: 10,
            }}
          >
            <FiArrowLeft size={14} /> Back to Gigs
          </button>
          <h3 style={{ margin: 0, fontSize: 26, color: '#eaf2ff' }}>All categories</h3>
          <p style={{ margin: '8px 0 0', fontSize: 13, color: '#94a3b8', maxWidth: 560 }}>
            Card tap karke us category ki listing kholi jati hai. Sub-categories ka data sirf shared global catalogue mein rakha gaya hai; yahan sirf naam dikhai deta hai.
          </p>
        </div>
        <div className="gigs-popular-grid">
          {GLOBAL_SERVICE_CATEGORY_OPTIONS.map((item) => {
            const Icon = gigsCategoryIcons[item.iconKey] || GigsCategoryIconFallback;
            return (
              <div
                key={item.name}
                className="gigs-popular-card"
                role="button"
                tabIndex={0}
                onClick={() => openCategoryProviders(item.name)}
                onKeyDown={(event) => {
                  if (event.key === 'Enter' || event.key === ' ') openCategoryProviders(item.name);
                }}
              >
                <div className="gigs-popular-top">
                  <div
                    className={`gigs-popular-icon gigs-popular-${item.tone}`}
                    style={{
                      '--icon-gradient': item.iconUi?.gradient,
                      '--icon-glow': item.iconUi?.glow,
                    }}
                  >
                    <Icon size={14} />
                  </div>
                  <h4>{item.name}</h4>
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
};

export default GigsCategoriesPage;
