import React, { useCallback, useState } from 'react';
import { FiCheck, FiMoon, FiSun } from 'react-icons/fi';
import {
  resolveFooterStatIcon,
  resolveFooterValueIcon,
} from './footerData';
import './footer.css';
import './footer-sections.css';
import './footer-mobile.css';
import FooterLinksGrid from './FooterLinksGrid';
import RankMatrixModal from './RankMatrixModal';
import useFooterBrand from '../../modules/FooterPages/hooks/useFooterBrand';

function readInitialDark() {
  try {
    const saved = localStorage.getItem('et-theme');
    if (saved === 'light') {
      document.documentElement.classList.add('et-theme-light');
      return false;
    }
    if (saved === 'dark') {
      document.documentElement.classList.remove('et-theme-light');
      return true;
    }
  } catch {
    /* ignore */
  }
  return true;
}

export default function Footer() {
  const [isDark, setIsDark] = useState(readInitialDark);
  const [rankMatrixOpen, setRankMatrixOpen] = useState(false);
  const { data: brand } = useFooterBrand();

  const toggleTheme = useCallback(() => {
    setIsDark((prev) => {
      const next = !prev;
      document.documentElement.classList.toggle('et-theme-light', !next);
      try {
        localStorage.setItem('et-theme', next ? 'dark' : 'light');
      } catch {
        /* ignore */
      }
      return next;
    });
  }, []);

  return (
    <footer id="site-footer" className="et-footer" aria-label="Site footer">
      <RankMatrixModal open={rankMatrixOpen} onClose={() => setRankMatrixOpen(false)} />
      <div className="et-footer__inner">
        <div className="et-footer__top">
          <FooterLinksGrid
            brand={brand}
            onRankMatrixOpen={() => setRankMatrixOpen(true)}
          />
        </div>

        <div className="et-footer__stats">
          {(brand.stats || []).map((stat) => {
            const Icon = resolveFooterStatIcon(stat.id);
            return (
              <div key={stat.id} className={`et-footer__stat et-footer__stat--${stat.tone || 'violet'}`}>
                <span className="et-footer__stat-icon">
                  <Icon size={18} aria-hidden />
                </span>
                <div>
                  <strong>{stat.value}</strong>
                  <span>{stat.label}</span>
                </div>
              </div>
            );
          })}
        </div>

        <div className="et-footer__values">
          {(brand.values || []).map((item) => {
            const Icon = resolveFooterValueIcon(item.id);
            return (
              <div key={item.id} className={`et-footer__value et-footer__value--${item.tone || 'violet'}`}>
                <span className="et-footer__value-icon">
                  <Icon size={18} aria-hidden />
                </span>
                <div>
                  <strong>{item.title}</strong>
                  <p>{item.text}</p>
                </div>
              </div>
            );
          })}
        </div>

        <div className="et-footer__bottom">
          <div className="et-footer__copy">
            <span className="et-footer__copy-mark" aria-hidden />
            <p>{brand.copyright}</p>
          </div>
          <div className="et-footer__payments">
            <span className="et-footer__payments-label">
              <FiCheck size={12} aria-hidden />
              Secure Payments
            </span>
            <div className="et-footer__payment-row">
              {(brand.payments || []).map((name) => (
                <span key={name} className="et-footer__payment-chip">
                  {name}
                </span>
              ))}
            </div>
          </div>
          <div className="et-footer__theme">
            <FiSun size={14} aria-hidden />
            <button
              type="button"
              className={`et-footer__theme-toggle${isDark ? ' is-dark' : ''}`}
              onClick={toggleTheme}
              aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
            >
              <span className="et-footer__theme-knob" />
            </button>
            <FiMoon size={14} aria-hidden />
            <span className="et-footer__theme-label">{isDark ? 'Dark Mode' : 'Light Mode'}</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
