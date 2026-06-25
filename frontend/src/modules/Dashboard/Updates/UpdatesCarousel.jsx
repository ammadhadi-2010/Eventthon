import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { FiChevronRight } from 'react-icons/fi';
import { fetchDashboardUpdates } from './updatesApi';
import { buildUpdatesList } from './mapUpdatesFeed';
import UpdateCard from './UpdateCard';
import UpdatesFilterRow from './UpdatesFilterRow';
import './updates-carousel.css';
import './updates-carousel-mobile.css';

export default function UpdatesCarousel() {
  const trackRef = useRef(null);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState('all');

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      const rows = await fetchDashboardUpdates();
      if (!cancelled) {
        setItems(buildUpdatesList(rows));
        setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  const visibleItems = useMemo(() => {
    if (activeFilter === 'all') return items;
    return items.filter((item) => item.type === activeFilter);
  }, [items, activeFilter]);

  const scrollByCards = (direction) => {
    const node = trackRef.current;
    if (!node) return;
    node.scrollBy({ left: direction * 220, behavior: 'smooth' });
  };

  return (
    <section className="upd-carousel">
      <div className="upd-carousel__head">
        <h2 className="upd-carousel__title">Updates</h2>
        <Link to="/updates" className="upd-carousel__viewall">
          View all Updates
        </Link>
      </div>

      <div className="upd-carousel__body">
        <div ref={trackRef} className="upd-carousel__track">
          {loading ? <p className="upd-carousel__hint">Loading updates...</p> : null}
          {!loading && !visibleItems.length ? (
            <p className="upd-carousel__hint">No updates for this filter.</p>
          ) : null}
          {!loading
            ? visibleItems.map((item) => <UpdateCard key={item.id} item={item} />)
            : null}
        </div>
        <button
          type="button"
          className="upd-carousel__arrow"
          aria-label="Scroll updates right"
          onClick={() => scrollByCards(1)}
        >
          <FiChevronRight />
        </button>
      </div>

      <UpdatesFilterRow activeFilter={activeFilter} onFilterChange={setActiveFilter} />
    </section>
  );
}
