import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FiBell,
  FiCalendar,
  FiDownload,
  FiMapPin,
  FiSearch,
  FiShield,
  FiStar,
  FiUserX,
} from 'react-icons/fi';
import { API_BASE_URL } from '../../../../api/axiosConfig';
import { navigateFromChatGigContext } from '../../Gigs/utils/navigateGigSurfaces';
import { formatDateTime } from '../utils/messagesFormat';

const resolveAttachmentUrl = (raw) => {
  const u = String(raw || '').trim();
  if (!u) return '';
  if (/^https?:\/\//i.test(u)) return u;
  if (u.startsWith('//')) return `${typeof window !== 'undefined' ? window.location.protocol : 'https:'}${u}`;
  const base = String(API_BASE_URL || '').replace(/\/+$/, '');
  return `${base}${u.startsWith('/') ? u : `/${u}`}`;
};

const formatBytes = (size) => {
  const value = Number(size || 0);
  if (!value || Number.isNaN(value)) return '';
  if (value >= 1024 * 1024) return `${(value / (1024 * 1024)).toFixed(1)} MB`;
  if (value >= 1024) return `${(value / 1024).toFixed(1)} KB`;
  return `${value} B`;
};

const iconLabel = (name = '') => {
  const ext = String(name).split('.').pop()?.toLowerCase() || '';
  if (ext === 'pdf') return 'PDF';
  if (ext === 'xlsx' || ext === 'xls') return 'XLS';
  if (ext === 'doc' || ext === 'docx') return 'DOC';
  if (ext === 'png' || ext === 'jpg' || ext === 'jpeg' || ext === 'webp') return 'IMG';
  return 'FILE';
};

const ConversationDetailsSidebar = ({
  selectedMessage,
  onFetchSidebarData,
  onUpdatePreference,
  onGigSurfaceNotice,
  onFocusInboxSearch,
}) => {
  const navigate = useNavigate();
  const [muted, setMuted] = useState(false);
  const [blocked, setBlocked] = useState(false);
  const [sidebarData, setSidebarData] = useState(null);
  const [filesModalOpen, setFilesModalOpen] = useState(false);

  const sharedFiles = useMemo(() => {
    const backendFiles = Array.isArray(sidebarData?.files) ? sidebarData.files : [];
    const fromAttachments = backendFiles.length > 0
      ? backendFiles.map((item, idx) => ({
          id: String(item?.id || `att-${idx}`),
          name: item?.name || `attachment-${idx + 1}`,
          size: typeof item?.size === 'number' ? formatBytes(item.size) : (item?.size_label || formatBytes(item?.size)),
          date: formatDateTime(item?.created_at),
          url: resolveAttachmentUrl(item?.url),
        }))
      : (Array.isArray(selectedMessage?.attachments)
        ? selectedMessage.attachments.map((item, idx) => ({
            id: `local-att-${idx}`,
            name: item?.name || `attachment-${idx + 1}`,
            size: formatBytes(item?.size),
            date: formatDateTime(selectedMessage?.created_at),
            url: resolveAttachmentUrl(item?.url),
          }))
        : []);
    if (fromAttachments.length > 0) return fromAttachments;
    return [
      { id: 'f1', name: 'website_audit_report.pdf', size: '2.4 MB', date: 'Jul 24, 2025', url: '' },
      { id: 'f2', name: 'keywords_analysis.xlsx', size: '1.1 MB', date: 'May 24, 2025', url: '' },
    ];
  }, [sidebarData?.files, selectedMessage?.attachments, selectedMessage?.created_at]);

  useEffect(() => {
    if (!selectedMessage) {
      setSidebarData(null);
      setMuted(false);
      setBlocked(false);
      return;
    }
    let alive = true;
    Promise.resolve(onFetchSidebarData?.(selectedMessage))
      .then((res) => {
        if (!alive || !res) return;
        setSidebarData(res);
        setMuted(Boolean(res?.preferences?.muted));
        setBlocked(Boolean(res?.preferences?.blocked));
      })
      .catch(() => {
        // keep local fallback data
      });
    return () => {
      alive = false;
    };
  }, [selectedMessage, onFetchSidebarData]);

  useEffect(() => {
    if (!filesModalOpen) return undefined;
    const close = (e) => {
      if (e.key === 'Escape') setFilesModalOpen(false);
    };
    window.addEventListener('keydown', close);
    return () => window.removeEventListener('keydown', close);
  }, [filesModalOpen]);

  const openSharedFile = (file) => {
    const url = resolveAttachmentUrl(file?.url);
    if (!url) {
      onGigSurfaceNotice?.('No downloadable link — file is preview-only or offline.');
      return;
    }
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  if (!selectedMessage) {
    return (
      <aside className="msgx-details-side">
        <p className="msgx-empty">Conversation details will appear here.</p>
      </aside>
    );
  }

  const profile = sidebarData?.profile || {};
  const order = sidebarData?.order || {};
  const displayName = profile.name || selectedMessage.from_user_name || selectedMessage.from_user_id || 'Unknown user';
  const orderId = order.order_id || selectedMessage.order_id || selectedMessage.context_id || '#ORD-12548';
  const orderTitle = order.title || selectedMessage.context_title || 'Untitled context';
  const ratingText = Number(profile.rating || 4.9).toFixed(1);
  const reviews = Number(profile.reviews || 0);
  const totalOrders = Number(profile.total_orders || 248);
  const memberSince = profile.member_since ? formatDateTime(profile.member_since) : 'Feb 2023';
  const country = profile.country || 'Pakistan';
  const badge = profile.badge || 'Top Rated Seller';
  const isOnline = Boolean(profile.online);

  const handleToggleMute = async () => {
    const next = !muted;
    setMuted(next);
    try {
      await onUpdatePreference?.(selectedMessage?.seller_user_id, { muted: next, blocked });
    } catch {
      setMuted((prev) => !prev);
    }
  };

  const handleToggleBlock = async () => {
    const next = !blocked;
    setBlocked(next);
    try {
      await onUpdatePreference?.(selectedMessage?.seller_user_id, { blocked: next, muted });
    } catch {
      setBlocked((prev) => !prev);
    }
  };

  return (
    <aside className="msgx-details-side">
      <h4>Conversation Details</h4>

      <section className="msgx-side-card is-profile">
        <div className="msgx-side-profile">
          <div className="msgx-side-avatar">{displayName.slice(0, 1).toUpperCase()}</div>
          <div>
            <div className="msgx-side-name-row">
              <h5>{displayName}</h5>
              <span>{badge}</span>
            </div>
            <p className="msgx-side-online"><i /> {isOnline ? 'Online' : 'Offline'}</p>
          </div>
        </div>
      </section>

      <section className="msgx-side-card">
        <h6>About {displayName.split(' ')[0] || 'User'}</h6>
        <div className="msgx-side-kv"><small><FiMapPin size={13} /> From</small><strong>{country}</strong></div>
        <div className="msgx-side-kv"><small><FiCalendar size={13} /> Member Since</small><strong>{memberSince}</strong></div>
        <div className="msgx-side-kv"><small><FiShield size={13} /> Total Orders</small><strong>{totalOrders}</strong></div>
        <div className="msgx-side-kv"><small><FiStar size={13} /> Rating</small><strong>{ratingText} ({reviews} Reviews)</strong></div>
      </section>

      <section className="msgx-side-card">
        <h6>Order Information</h6>
        <p className="msgx-side-order-id">{orderId}</p>
        <p className="msgx-side-order-title">{orderTitle}</p>
        <p className="msgx-side-order-status">{order.status || 'In Progress'}</p>
        <button
          type="button"
          className="msgx-side-link-btn"
          onClick={() => {
            const ok = navigateFromChatGigContext(navigate, selectedMessage);
            if (!ok) {
              onGigSurfaceNotice?.('No linked order yet — place an order from Gigs Explorer, or open the gig from there.');
            }
          }}
        >
          View Order
        </button>
      </section>

      <section className="msgx-side-card">
        <h6>Shared Files</h6>
        <div className="msgx-side-files">
          {sharedFiles.slice(0, 4).map((file) => (
            <div key={file.id} className="msgx-side-file-row">
              <div className="msgx-side-file-icon">{iconLabel(file.name)}</div>
              <div className="msgx-side-file-meta">
                <p>{file.name}</p>
                <small>{file.size || '--'} • {file.date || '--'}</small>
              </div>
              <button
                type="button"
                aria-label={`Download ${file.name}`}
                onClick={() => openSharedFile(file)}
              >
                <FiDownload size={13} />
              </button>
            </div>
          ))}
        </div>
        <button type="button" className="msgx-side-view-all" onClick={() => setFilesModalOpen(true)}>View All Files</button>
      </section>

      <section className="msgx-side-card">
        <h6>Options</h6>
        <button
          type="button"
          className="msgx-side-option"
          onClick={() => onFocusInboxSearch?.()}
        >
          <FiSearch size={14} /> Search in Conversation
        </button>
        <div className="msgx-side-switch-row">
          <span><FiBell size={14} /> Mute Notifications</span>
          <button
            type="button"
            role="switch"
            aria-checked={muted}
            className={`msgx-side-switch${muted ? ' is-on' : ''}`}
            onClick={handleToggleMute}
          >
            <i />
          </button>
        </div>
        <button type="button" className="msgx-side-option is-danger" onClick={handleToggleBlock}>
          <FiUserX size={14} /> {blocked ? 'Unblock User' : 'Block User'}
        </button>
      </section>

      {filesModalOpen ? (
        <div
          className="msgx-order-modal-backdrop"
          role="presentation"
          onClick={() => setFilesModalOpen(false)}
        >
          <div className="msgx-order-modal" role="dialog" aria-modal="true" onClick={(e) => e.stopPropagation()}>
            <h4>Shared files</h4>
            <ul className="msgx-side-files" style={{ maxHeight: 320, overflowY: 'auto' }}>
              {sharedFiles.map((file) => (
                <li key={file.id} style={{ listStyle: 'none' }}>
                  <button
                    type="button"
                    className="msgx-side-link-btn"
                    style={{ marginBottom: 8, width: '100%', textAlign: 'left' }}
                    onClick={() => openSharedFile(file)}
                  >
                    {file.name}
                    {' '}
                    <small>{file.size || '--'}</small>
                  </button>
                </li>
              ))}
            </ul>
            <div className="msgx-order-modal-actions">
              <button type="button" onClick={() => setFilesModalOpen(false)}>Close</button>
            </div>
          </div>
        </div>
      ) : null}
    </aside>
  );
};

export default ConversationDetailsSidebar;
