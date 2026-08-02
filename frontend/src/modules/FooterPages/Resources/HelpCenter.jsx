import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  FiBookOpen, FiExternalLink, FiHelpCircle, FiLifeBuoy, FiSearch, FiTarget,
  FiThumbsDown, FiThumbsUp, FiUsers, FiAlertCircle, FiHeart,
} from 'react-icons/fi';
import FooterPageShell from '../components/FooterPageShell';
import HelpCenterLeftNav from '../components/HelpCenterLeftNav';
import HelpCenterRightRail from '../components/HelpCenterRightRail';
import useResourcesFooterContent from '../hooks/useResourcesFooterContent';
import {
  FEATURED_ARTICLES, FAQ_ITEMS, HELP_ASSIST, HELP_CATEGORIES,
  HELP_STATUS, HELP_SUBTITLE,
} from '../data/helpCenterData';
import '../styles/help-center.css';

const ASSIST_ICONS = {
  headphones: FiLifeBuoy, message: FiHelpCircle, mail: FiBookOpen, book: FiBookOpen,
  play: FiTarget, globe: FiUsers, bug: FiAlertCircle, bulb: FiTarget, heart: FiHeart,
};

export default function HelpCenter() {
  const { data, loading } = useResourcesFooterContent('Help Center');
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('getting-started');
  const [detail, setDetail] = useState(null);
  const [feedback, setFeedback] = useState('');
  const [openFaq, setOpenFaq] = useState('');

  const categories = data?.categories?.length ? data.categories : HELP_CATEGORIES;
  const featured = data?.featured?.length ? data.featured : FEATURED_ARTICLES;
  const faqItems = data?.faqItems?.length ? data.faqItems : FAQ_ITEMS;
  const status = data?.status?.length ? data.status : HELP_STATUS;
  const heroTitle = data?.heroTitle || 'How can we help you?';
  const subtitle = data?.subtitle || HELP_SUBTITLE;
  const activeCat = categories.find((c) => c.id === category) || null;
  const q = query.trim().toLowerCase();

  const articles = useMemo(() => {
    if (q) {
      return featured.filter((a) =>
        [a.title, a.summary, a.body].filter(Boolean).join(' ').toLowerCase().includes(q),
      );
    }
    const matched = featured.filter((a) => a.category === category);
    return matched.length ? matched : featured.slice(0, 5);
  }, [featured, category, q]);

  const popular = useMemo(() => {
    if (q) return faqItems.filter((f) => `${f.q} ${f.a}`.toLowerCase().includes(q)).slice(0, 8);
    const matched = faqItems.filter((f) => !f.category || f.category === category);
    return (matched.length ? matched : faqItems).slice(0, 6);
  }, [faqItems, category, q]);

  const openArticle = (item) => {
    setDetail({ type: 'article', title: item.title, body: item.body || item.summary, id: item.id });
    setFeedback('');
  };

  const openFaqDetail = (item) => {
    setDetail({ type: 'faq', title: item.q, body: item.a, id: item.q });
    setFeedback('');
    setOpenFaq(item.q);
  };

  const selectCategory = (cat) => {
    setCategory(cat.id);
    setDetail(null);
    setQuery('');
    setFeedback('');
    setOpenFaq('');
  };

  return (
    <FooterPageShell
      variant="resources"
      leftSlot={(
        <HelpCenterLeftNav
          categories={categories}
          activeId={category}
          searching={Boolean(q)}
          onSelect={selectCategory}
        />
      )}
      rightSlot={<HelpCenterRightRail />}
    >
      <div className="hc-page">
        <header className="hc-head">
          <div>
            <div className="hc-head__title-row">
              <span className="hc-head__icon" aria-hidden><FiLifeBuoy size={18} /></span>
              <h1>Help Center</h1>
            </div>
            <p className="hc-head__sub">{heroTitle} — {subtitle}</p>
          </div>
          <label className="hc-search">
            <FiSearch size={14} aria-hidden />
            <input
              type="search"
              value={query}
              onChange={(e) => { setQuery(e.target.value); setDetail(null); }}
              placeholder="Search help articles…"
              aria-label="Search help center"
            />
          </label>
        </header>

        {loading ? <p className="hc-empty">Loading help center…</p> : null}

        <div className="hc-panel">
          {detail ? (
            <section className="hc-block hc-detail">
              <button type="button" className="hc-detail__back" onClick={() => setDetail(null)}>
                ← Back to articles
              </button>
              <h3>{detail.title}</h3>
              <p>{detail.body}</p>
              <div className="hc-feedback">
                <p>Did this article help you?</p>
                <div className="hc-feedback__row">
                  <button type="button" className={feedback === 'yes' ? 'is-yes' : ''} onClick={() => setFeedback('yes')}>
                    <FiThumbsUp size={13} aria-hidden /> Yes
                  </button>
                  <button type="button" className={feedback === 'no' ? 'is-no' : ''} onClick={() => setFeedback('no')}>
                    <FiThumbsDown size={13} aria-hidden /> No
                  </button>
                </div>
                {feedback === 'yes' ? <p className="hc-empty" style={{ marginTop: 10 }}>Thanks for the feedback.</p> : null}
                {feedback === 'no' ? (
                  <Link to="/company/contact" className="hc-feedback__ticket">
                    Still need help? Open Support Ticket
                  </Link>
                ) : null}
              </div>
            </section>
          ) : (
            <>
              {activeCat?.to ? (
                <Link to={activeCat.to} className="hc-related">
                  Open {activeCat.label} <FiExternalLink size={13} aria-hidden />
                </Link>
              ) : null}

              <section className="hc-block">
                <h2>Featured Articles</h2>
                <div className="hc-articles">
                  {articles.map((item) => (
                    <button key={item.id} type="button" className="hc-article" onClick={() => openArticle(item)}>
                      <span className="hc-article__pin" aria-hidden><FiBookOpen size={14} /></span>
                      <span>
                        <strong>{item.title}</strong>
                        {item.summary ? <span>{item.summary}</span> : null}
                      </span>
                    </button>
                  ))}
                </div>
              </section>

              <section className="hc-block">
                <h2>Popular Questions</h2>
                <ul className="hc-faq">
                  {popular.map((item) => {
                    const open = openFaq === item.q;
                    return (
                      <li key={item.q}>
                        <button
                          type="button"
                          className={open ? 'is-open' : ''}
                          onClick={() => (open ? setOpenFaq('') : openFaqDetail(item))}
                        >
                          {item.q}
                        </button>
                      </li>
                    );
                  })}
                </ul>
              </section>
            </>
          )}
        </div>

        <h2 className="hc-section-title">Need More Help?</h2>
        <div className="hc-help-grid">
          {HELP_ASSIST.map((item) => {
            const Icon = ASSIST_ICONS[item.icon] || FiLifeBuoy;
            if (String(item.to).startsWith('mailto:')) {
              return (
                <a key={item.id} href={item.to}>
                  <span aria-hidden><Icon size={15} /></span>
                  {item.label}
                </a>
              );
            }
            return (
              <Link key={item.id} to={item.to}>
                <span aria-hidden><Icon size={15} /></span>
                {item.label}
              </Link>
            );
          })}
        </div>

        <h2 className="hc-section-title">System Status</h2>
        <div className="hc-status">
          {status.map((item) => (
            <div key={item.id} className="hc-status__item">
              <span className={`hc-dot${item.online ? '' : ' is-off'}`} aria-hidden />
              {item.label} {item.online ? 'Online' : 'Offline'}
            </div>
          ))}
        </div>
      </div>
    </FooterPageShell>
  );
}
