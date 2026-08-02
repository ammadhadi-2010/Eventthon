import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiChevronDown, FiGrid } from 'react-icons/fi';
import ShowroomPanelsNavItem from '../../../Public/components/ShowroomPanelsNavItem';
import { topCategories, isOpportunityType } from '../data/jobsMenuData';
import { useJobsHub } from '../context/JobsHubContext';
import { buildJobsMenu } from '../utils/jobsMenuFromSettings';

const JobsLeftSidebar = ({
  activeSection,
  onSectionSelect,
  onBrowseOpportunity,
  searchFilters = {},
  menuCounts = {},
}) => {
  const navigate = useNavigate();
  const { platformSettings } = useJobsHub();
  const jobMenu = useMemo(() => buildJobsMenu(platformSettings), [platformSettings]);
  const oppFilterActive = searchFilters.listingKind === 'opportunity';
  const [oppOpen, setOppOpen] = useState(oppFilterActive);

  useEffect(() => {
    if (oppFilterActive) setOppOpen(true);
  }, [oppFilterActive]);

  const handleMenuClick = (item) => {
    if (item.expandable) {
      setOppOpen((open) => !open);
      return;
    }
    if (item.id === 'browse' && onBrowseOpportunity && (oppFilterActive || isOpportunityType(searchFilters.jobType))) {
      onBrowseOpportunity('__clear__');
      return;
    }
    onSectionSelect(item.id);
  };

  return (
    <aside className="jobs-left-stack">
      <div className="gigs-card jobs-left-card">
        <p className="jobs-left-title">Jobs Menu</p>
        <div className="jobs-left-menu">
          {jobMenu.map((item) => {
            const Icon = item.icon;
            const count = menuCounts[item.id] ?? item.count;
            const isOppParent = item.id === 'opportunities';
            const parentActive = isOppParent
              ? oppFilterActive
              : activeSection === item.id && !oppFilterActive;

            return (
              <div key={item.id} className="jobs-left-menu-group">
                <button
                  type="button"
                  className={`jobs-left-menu-item${parentActive ? ' is-active' : ''}${isOppParent && oppOpen ? ' is-expanded' : ''}`}
                  onClick={() => handleMenuClick(item)}
                  aria-expanded={isOppParent ? oppOpen : undefined}
                >
                  <span className="jobs-left-icon"><Icon size={13} /></span>
                  <span>{item.label}</span>
                  {item.comingSoon ? (
                    <em className="jobs-left-badge jobs-left-badge--soon">Coming Soon</em>
                  ) : item.badge ? (
                    <em className="jobs-left-badge">{item.badge}</em>
                  ) : null}
                  {!item.comingSoon && count != null && count !== '' ? <small>{count}</small> : null}
                  {item.expandable ? (
                    <FiChevronDown
                      size={14}
                      className={`jobs-left-chev${oppOpen ? ' is-open' : ''}`}
                      aria-hidden
                    />
                  ) : null}
                </button>

                {isOppParent && oppOpen && item.children?.length ? (
                  <div className="jobs-left-menu-sub" role="group" aria-label="Opportunity types">
                    {item.children.map((child) => {
                      const childActive =
                        oppFilterActive &&
                        (child.id === '__all__'
                          ? !searchFilters.jobType
                          : searchFilters.jobType === child.label);
                      return (
                        <button
                          key={child.id}
                          type="button"
                          className={`jobs-left-menu-subitem${childActive ? ' is-active' : ''}`}
                          onClick={() =>
                            onBrowseOpportunity?.(child.id === '__all__' ? null : child.label)
                          }
                        >
                          {child.label}
                        </button>
                      );
                    })}
                  </div>
                ) : null}
              </div>
            );
          })}
        </div>
        <ShowroomPanelsNavItem
          className="sph-nav-link jobs-left-showroom-link"
          hubPath="/jobs/showrooms"
        />
      </div>

      <div className="gigs-card jobs-left-card jobs-alert-card jobs-opportunity-card">
        <h4>Need short-term help?</h4>
        <p>
          Post a community opportunity — temporary hire, freelance ask, or team member search.
          Permanent company jobs stay in Company Hub.
        </p>
        <button
          type="button"
          className="jobs-alert-btn jobs-alert-btn--opportunity"
          onClick={() => navigate('/jobs/opportunities/new')}
        >
          + Create Opportunity
        </button>
        <button
          type="button"
          className="jobs-alert-link"
          onClick={() => navigate('/jobs/alerts/new')}
        >
          Set a Job Alert instead
        </button>
      </div>

      <div className="gigs-card jobs-left-card">
        <p className="jobs-left-title">Top Categories</p>
        <div className="jobs-cat-list">
          {topCategories.map(({ label, value, iconUi }) => (
            <div key={label} className="jobs-cat-row">
              <span className="jobs-cat-label-wrap">
                <em
                  className="jobs-cat-icon"
                  style={{
                    '--icon-gradient': iconUi?.gradient,
                    '--icon-glow': iconUi?.glow,
                  }}
                >
                  <FiGrid size={11} />
                </em>
                {label}
              </span>
              <strong>{value}</strong>
            </div>
          ))}
        </div>
      </div>
    </aside>
  );
};

export default JobsLeftSidebar;
