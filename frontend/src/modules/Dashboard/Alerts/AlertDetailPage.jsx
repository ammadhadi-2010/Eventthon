import React, { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { FiArrowLeft, FiShield } from 'react-icons/fi';
import ProfileCard from '../components/ProfileCard';
import WalletCard from '../components/WalletCard';
import { fetchAlertItem, markAlertRead } from './services/alertsApi';
import { notifyAlertsRefresh } from './utils/alertsNotify';
import { resolveAlertDetailAction } from './utils/alertDetailAction';
import { alertAvatarInitial, resolveAlertAvatarUrl } from './utils/alertAvatar';
import './AlertCenter.css';
import './alert-detail-polish.css';
import {
  formatPriorityLabel,
  formatReadLabel,
  sanitizeAlertCopy,
} from './utils/alertMessageCopy';

const categoryLabel = (key) => {
  const map = {
    squad: 'Squad alert',
    mentions: 'Mention',
    security: 'Security',
    projects: 'Project update',
    jobs: 'Job alert',
    system: 'System',
  };
  return map[key] || 'Notification';
};

const AlertDetailPage = ({ userData, employerMode = false }) => {
  const alertsHome = employerMode ? '/company/notifications' : '/notifications/alerts';
  const navigate = useNavigate();
  const { alertId } = useParams();
  const [alert, setAlert] = useState(null);
  const [loading, setLoading] = useState(true);
  const [avatarBroken, setAvatarBroken] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      setLoading(true);
      try {
        const data = await fetchAlertItem(alertId);
        if (cancelled) return;
        setAlert(data);
        setAvatarBroken(false);
        if (data?._id && !data.is_read) {
          await markAlertRead(data._id);
          notifyAlertsRefresh();
          if (!cancelled) {
            setAlert((prev) => (prev ? { ...prev, is_read: true } : prev));
          }
        }
      } catch (error) {
        console.error('Alert detail load failed:', error);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    load();
    return () => {
      cancelled = true;
    };
  }, [alertId]);

  const actorProfile = useMemo(() => {
    if (!alert) return null;
    return {
      name: alert.actor_name || 'EventThon',
      designation: categoryLabel(alert.category),
      headline: alert.title || 'Alert',
      verified: alert.priority === 'high',
    };
  }, [alert]);

  const primaryAction = useMemo(
    () => resolveAlertDetailAction(alert, employerMode),
    [alert, employerMode],
  );

  if (loading) {
    return <div className="alerts-loading">Loading notification detail...</div>;
  }

  if (!alert) {
    return <div className="alerts-empty-state">Notification detail not found.</div>;
  }

  const avatarUrl = resolveAlertAvatarUrl(alert);
  const showAvatarImg = !avatarBroken && avatarUrl && avatarUrl !== '/default-avatar.png';
  const displayMessage = sanitizeAlertCopy(
    alert.message,
    'Thank you for helping us improve our system design.',
  );
  const displayDetails = sanitizeAlertCopy(alert.details, '');
  const priorityLabel = formatPriorityLabel(alert.priority);
  const priorityTone = String(alert.priority || 'normal').toLowerCase();

  return (
    <div className="alert-detail-page">
      <div className="alert-detail-topbar">
        <Link to={alertsHome} className="alerts-back-link">
          <FiArrowLeft className="h-4 w-4" aria-hidden />
          Back to Alerts
        </Link>
      </div>

      <div className="alert-detail-layout">
        <aside className="alert-detail-sidebar">
          <div className="alert-detail-sidebar-sticky">
            <ProfileCard userData={actorProfile || userData} />
            <WalletCard userData={userData} />
          </div>
        </aside>

        <main className="alert-detail-center">
          <section className="alert-detail-focus-card" aria-labelledby="alert-detail-title">
            <div className="alert-detail-focus-card__inner">
              <div className="alert-detail-focus-card__icon-wrap">
                {showAvatarImg ? (
                  <img
                    src={avatarUrl}
                    alt=""
                    className="alert-detail-focus-card__avatar"
                    onError={() => setAvatarBroken(true)}
                  />
                ) : (
                  <span className="alert-detail-focus-card__avatar-fallback" aria-hidden>
                    {alertAvatarInitial(alert)}
                  </span>
                )}
                <FiShield className="alert-detail-focus-card__badge" aria-hidden />
              </div>

              <p className="alert-detail-kicker">{categoryLabel(alert.category)}</p>
              <h1 id="alert-detail-title" className="alert-detail-focus-card__title">
                {alert.title}
              </h1>
              <p className="alert-detail-focus-card__message">{displayMessage}</p>
              {displayDetails ? (
                <p className="alert-detail-focus-card__details">{displayDetails}</p>
              ) : null}

              <div className="alert-detail-tags alert-detail-focus-card__tags">
                <span
                  className={`alert-detail-tag alert-detail-tag--priority${
                    priorityTone === 'medium' ? ' is-medium' : priorityTone === 'low' ? ' is-low' : ''
                  }`}
                >
                  Priority: {priorityLabel}
                </span>
                <span className="alert-detail-tag alert-detail-tag--status">
                  {formatReadLabel(alert.is_read)}
                </span>
                {alert.actor_name ? (
                  <span className="alert-detail-tag alert-detail-tag--actor">{alert.actor_name}</span>
                ) : null}
              </div>

              <button
                type="button"
                className="alert-detail-primary-btn"
                onClick={() => navigate(primaryAction.to)}
              >
                {primaryAction.label}
              </button>
            </div>
          </section>
        </main>

        <aside className="alert-detail-rightbar">
          <div className="alert-detail-sidebar-sticky">
            <div className="alert-detail-info-card">
              <p className="alert-detail-kicker">Summary</p>
              <span>{displayDetails || displayMessage}</span>
              {alert.created_at ? (
                <time className="alert-detail-info-card__time" dateTime={alert.created_at}>
                  {new Date(alert.created_at).toLocaleString()}
                </time>
              ) : null}
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
};

export default AlertDetailPage;
