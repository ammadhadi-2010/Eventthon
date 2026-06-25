import React, { useMemo, useRef, useState } from 'react';
import { FiDownload, FiFilter, FiMoreVertical, FiPlus, FiSearch } from 'react-icons/fi';
import { squadsAbsoluteUrl as toAbsoluteUrl } from '../../utils/squadsMediaUrl';
import '../../styles/squad-files-mobile.css';

const FilesTab = ({ files = [], onUploadFile, onDeleteFile }) => {
  const [query, setQuery] = useState('');
  const [activeMenuId, setActiveMenuId] = useState(null);
  const inputRef = useRef(null);

  const normalized = useMemo(() => {
    return files.map((file, index) => ({
      id: file.id || `file-${index}`,
      name: file.name || `File ${index + 1}`,
      size: file.size || 'Unknown',
      uploadedBy: file.uploaded_by || file.sender || fallbackUploader(index),
      uploadedAt: file.uploaded_at || file.created_at || null,
      downloadUrl: file.download_url || '',
      category: normalizeCategory(file),
    }));
  }, [files]);

  const filtered = useMemo(() => {
    const term = query.trim().toLowerCase();
    if (!term) return normalized;
    return normalized.filter((file) =>
      `${file.name} ${file.uploadedBy} ${file.category}`.toLowerCase().includes(term)
    );
  }, [normalized, query]);

  const metrics = useMemo(() => {
    const docs = normalized.filter((file) => file.category === 'documents').length;
    const images = normalized.filter((file) => file.category === 'images').length;
    const videos = normalized.filter((file) => file.category === 'videos').length;
    const others = normalized.filter((file) => file.category === 'others').length;
    return {
      total: normalized.length,
      docs,
      images,
      videos,
      others,
      storageText: `6.4 GB / 20 GB`,
      progress: 32,
    };
  }, [normalized]);

  const triggerUpload = () => inputRef.current?.click();
  const handleFileSelect = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    await onUploadFile?.(file);
    event.target.value = '';
  };

  const closeMenu = () => setActiveMenuId(null);

  return (
    <div className="sq-files-tab" style={wrap} onClick={closeMenu}>
      <div className="sq-files-stats-grid" style={headerGrid}>
        <div className="sq-files-stat-card sq-files-storage-card" style={storageCard}>
          <small className="sq-files-stat-label" style={tileTitle}>Storage Used</small>
          <strong className="sq-files-stat-value sq-files-storage-value" style={storageValue}>{metrics.storageText}</strong>
          <div className="sq-files-progress-track" style={progressTrack}>
            <div style={progressFill(metrics.progress)} />
          </div>
          <span className="sq-files-progress-text" style={progressText}>{metrics.progress}%</span>
        </div>
        <StatTile title="Documents" value={`${metrics.docs} Files`} color="#2f81f7" icon="📄" />
        <StatTile title="Images" value={`${metrics.images} Files`} color="#eab308" icon="🖼️" />
        <StatTile title="Videos" value={`${metrics.videos} Files`} color="#ec4899" icon="🎬" />
        <StatTile title="Others" value={`${metrics.others} Files`} color="#60a5fa" icon="🧩" />
      </div>

      <div className="sq-files-toolbar" style={toolbar}>
        <div className="sq-files-search" style={searchWrap}>
          <FiSearch size={14} color="#64748b" />
          <input
            style={searchInput}
            placeholder="Search files..."
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />
        </div>
        <button type="button" className="sq-files-ghost-btn" style={ghostBtn}><FiFilter /> Filters</button>
        <button type="button" className="sq-files-primary-btn" style={primaryBtn} onClick={triggerUpload}><FiPlus /> Upload File</button>
        <input ref={inputRef} type="file" style={{ display: 'none' }} onChange={handleFileSelect} />
      </div>

      <div className="sq-files-table" style={tableCard}>
        <div className="sq-files-table-head" style={tableHead}>
          <span>File Name</span>
          <span>Uploaded By</span>
          <span>Size</span>
          <span>Uploaded</span>
          <span>Actions</span>
        </div>
        {filtered.map((file) => (
          <div key={file.id} className="sq-files-table-row" style={row}>
            <div className="sq-files-name-col" style={fileNameCol}>
              <span className="sq-files-type-icon" style={fileTypeIcon(file.category)}>{iconForCategory(file.category)}</span>
              <strong className="sq-files-file-name" style={fileName}>{file.name}</strong>
            </div>
            <div className="sq-files-meta-line">
              <span>{file.uploadedBy}</span>
              <span>{file.size}</span>
              <span>{formatDate(file.uploadedAt)}</span>
            </div>
            <div className="sq-files-actions" style={actionsCol}>
              <a
                href={toAbsoluteUrl(file.downloadUrl)}
                target="_blank"
                rel="noreferrer"
                style={iconBtn}
                title="Download"
              >
                <FiDownload size={14} />
              </a>
              <div className="sq-files-menu-wrap">
                <button
                  type="button"
                  style={iconBtn}
                  onClick={(event) => {
                    event.stopPropagation();
                    setActiveMenuId(activeMenuId === file.id ? null : file.id);
                  }}
                >
                  <FiMoreVertical size={14} />
                </button>
                {activeMenuId === file.id ? (
                  <div className="sq-files-action-menu" onClick={(event) => event.stopPropagation()}>
                    <a href={toAbsoluteUrl(file.downloadUrl)} target="_blank" rel="noreferrer">Open</a>
                    <button type="button" onClick={() => { navigator.clipboard?.writeText(toAbsoluteUrl(file.downloadUrl)); setActiveMenuId(null); }}>Copy Link</button>
                    <button
                      type="button"
                      className="sq-files-menu-danger"
                      onClick={async () => {
                        const ok = window.confirm(`Delete "${file.name}"?`);
                        if (!ok) return;
                        await onDeleteFile?.(file.id);
                        setActiveMenuId(null);
                      }}
                    >
                      Delete
                    </button>
                  </div>
                ) : null}
              </div>
            </div>
          </div>
        ))}
        {filtered.length === 0 ? <div className="sq-files-empty" style={emptyState}>No files found for this search.</div> : null}
      </div>

      <button type="button" style={viewAllBtn}>View All Files <span aria-hidden="true">→</span></button>
    </div>
  );
};

const StatTile = ({ title, value, color, icon }) => (
  <div className="sq-files-stat-card" style={{ ...tile, borderColor: `${color}40`, boxShadow: `inset 0 0 26px ${color}18` }}>
    <div style={tileTop}>
      <span className="sq-files-stat-icon" style={{ ...tileIcon, color, borderColor: `${color}66` }}>{icon}</span>
      <small className="sq-files-stat-label" style={tileTitle}>{title}</small>
    </div>
    <strong className="sq-files-stat-value" style={tileValue}>{value}</strong>
  </div>
);

const normalizeCategory = (file) => {
  if (file.category) return String(file.category).toLowerCase();
  const name = String(file.name || '').toLowerCase();
  if (name.match(/\.(png|jpg|jpeg|gif|webp|svg)$/)) return 'images';
  if (name.match(/\.(mp4|mov|avi|mkv|webm)$/)) return 'videos';
  if (name.match(/\.(pdf|doc|docx|xls|xlsx|ppt|pptx|txt|md)$/)) return 'documents';
  return 'others';
};

const iconForCategory = (category) => {
  if (category === 'images') return '🖼️';
  if (category === 'videos') return '🎬';
  if (category === 'documents') return '📄';
  return '🧩';
};

const fallbackUploader = (index) => ['Sarah Khan', 'Usman Ali', 'Hira Saeed', 'Ammad S.', 'Bilal Ahmed'][index % 5];
const formatDate = (iso) => {
  if (!iso) return 'May 24, 2025';
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return 'May 24, 2025';
  return date.toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' });
};

const wrap = { display: 'flex', flexDirection: 'column', gap: '12px' };
const headerGrid = { display: 'grid', gridTemplateColumns: '1.2fr 1fr 1fr 1fr 1fr', gap: '10px' };
const storageCard = { background: 'linear-gradient(180deg, rgba(8,21,40,0.96), rgba(4,12,26,0.96))', border: '1px solid rgba(59,130,246,0.25)', borderRadius: '12px', padding: '12px', display: 'flex', flexDirection: 'column', gap: '8px' };
const storageValue = { color: '#f8fbff', fontSize: '24px' };
const progressTrack = { width: '100%', height: '8px', borderRadius: '999px', background: 'rgba(100,116,139,0.35)', overflow: 'hidden' };
const progressFill = (progress) => ({ width: `${progress}%`, height: '100%', background: 'linear-gradient(90deg,#22d3ee,#34d399)' });
const progressText = { color: '#34d399', fontSize: '13px', fontWeight: '700', alignSelf: 'flex-end' };
const tile = { background: 'linear-gradient(180deg, rgba(8,21,40,0.96), rgba(4,12,26,0.96))', border: '1px solid rgba(59,130,246,0.25)', borderRadius: '12px', padding: '12px', display: 'flex', flexDirection: 'column', gap: '8px' };
const tileTop = { display: 'flex', alignItems: 'center', gap: '8px' };
const tileIcon = { width: '26px', height: '26px', borderRadius: '8px', border: '1px solid', display: 'grid', placeItems: 'center', fontSize: '14px' };
const tileTitle = { color: '#9db3d8', fontSize: '13px' };
const tileValue = { color: '#f1f5ff', fontSize: '18px' };
const toolbar = { display: 'flex', gap: '8px', alignItems: 'center' };
const searchWrap = { flex: 1, display: 'flex', alignItems: 'center', gap: '8px', background: '#071224', border: '1px solid rgba(89,117,179,0.35)', borderRadius: '12px', padding: '11px 12px' };
const searchInput = { flex: 1, background: 'transparent', border: 'none', outline: 'none', color: '#e2e8f0', fontSize: '13px' };
const ghostBtn = { background: 'linear-gradient(145deg, rgba(30,41,59,0.85), rgba(15,23,42,0.9))', border: '1px solid rgba(148,163,184,0.25)', color: '#cbd5e1', borderRadius: '12px', padding: '10px 16px', cursor: 'pointer', fontSize: '13px', display: 'flex', gap: '6px', alignItems: 'center' };
const primaryBtn = { background: 'linear-gradient(135deg,#2563eb,#3b82f6)', border: '1px solid rgba(96,165,250,0.6)', color: '#fff', borderRadius: '12px', padding: '10px 16px', cursor: 'pointer', fontSize: '13px', display: 'flex', gap: '6px', alignItems: 'center', fontWeight: '700' };
const tableCard = { background: 'linear-gradient(180deg, rgba(6,18,37,0.96), rgba(3,11,24,0.96))', border: '1px solid rgba(59,130,246,0.2)', borderRadius: '12px', overflow: 'visible' };
const tableHead = { display: 'grid', gridTemplateColumns: '2.2fr 1.3fr 0.9fr 1fr 0.8fr', gap: '10px', padding: '11px 12px', fontSize: '12px', color: '#7f95bb', borderBottom: '1px solid rgba(148,163,184,0.16)' };
const row = { display: 'grid', gridTemplateColumns: '2.2fr 1.3fr 0.9fr 1fr 0.8fr', gap: '10px', padding: '11px 12px', borderBottom: '1px solid rgba(148,163,184,0.1)', alignItems: 'center' };
const fileNameCol = { display: 'flex', alignItems: 'center', gap: '10px' };
const fileTypeIcon = () => ({ width: '30px', height: '30px', borderRadius: '8px', display: 'grid', placeItems: 'center', background: 'rgba(59,130,246,0.16)', border: '1px solid rgba(59,130,246,0.35)' });
const fileName = { color: '#f8fbff', fontSize: '13px', lineHeight: 1.2 };
const actionsCol = { display: 'flex', alignItems: 'center', gap: '8px', justifyContent: 'flex-end' };
const iconBtn = { width: '30px', height: '30px', borderRadius: '8px', border: '1px solid rgba(148,163,184,0.2)', background: 'transparent', color: '#c7d2fe', display: 'grid', placeItems: 'center', cursor: 'pointer', textDecoration: 'none' };
const emptyState = { color: '#8fa3c7', textAlign: 'center', padding: '20px', fontSize: '13px' };
const viewAllBtn = { alignSelf: 'center', background: 'transparent', border: 'none', color: '#22a8ff', fontWeight: '700', fontSize: '16px', cursor: 'pointer', padding: '8px 0 0' };

export default FilesTab;
