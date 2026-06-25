import React from 'react';
import { FiGrid, FiPlusSquare } from 'react-icons/fi';
import { leftMenu } from '../data/gigsData';
import ShowroomPanelsNavItem from '../../../Public/components/ShowroomPanelsNavItem';
import GigsSidebarPopularCategories from './GigsSidebarPopularCategories';

const GigsLeftSidebar = ({ activeSection, onSectionSelect }) => (
  <aside className="gigs-card gigs-hub-sidebar">
    <div className="gigs-hub-sidebar__head">
      <FiGrid size={16} color="#22d3ee" aria-hidden />
      <h3>Gigs Hub</h3>
    </div>

    <nav className="gigs-hub-sidebar__nav" aria-label="Gigs hub sections">
      {leftMenu.map((item) => (
        <button
          key={item}
          type="button"
          className={`gigs-hub-sidebar__nav-btn${activeSection === item ? ' is-active' : ''}`}
          onClick={() => onSectionSelect(item)}
        >
          {item}
        </button>
      ))}
    </nav>

    <ShowroomPanelsNavItem className="sph-nav-link" hubPath="/gigs/showrooms" />

    <button
      type="button"
      className={`gigs-hub-sidebar__create${activeSection === 'Create Gig' ? ' is-active' : ''}`}
      onClick={() => onSectionSelect('Create Gig')}
    >
      <FiPlusSquare aria-hidden />
      Create Gig
    </button>

    <GigsSidebarPopularCategories />
  </aside>
);

export default GigsLeftSidebar;
