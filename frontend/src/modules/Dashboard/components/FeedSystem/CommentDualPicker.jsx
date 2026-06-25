import React, { useEffect, useState } from 'react';
import { FiX } from 'react-icons/fi';
import EmojiPicker from '../Global/EmojiPicker';
import WorkingStickerPicker from './WorkingStickerPicker';

const TABS = [
  { id: 'emoji', label: 'Emojis' },
  { id: 'working', label: 'Working' },
];

export default function CommentDualPicker({
  isOpen,
  initialTab = 'emoji',
  onClose,
  onSelectEmoji,
  onSelectWorking,
}) {
  const [tab, setTab] = useState(initialTab);

  useEffect(() => {
    if (isOpen) setTab(initialTab);
  }, [isOpen, initialTab]);

  if (!isOpen) return null;

  return (
    <div className="cm-dual-picker" role="dialog" aria-label="Emoji and sticker picker">
      <div className="cm-dual-picker__head">
        <div className="cm-dual-picker__tabs" role="tablist">
          {TABS.map((t) => (
            <button
              key={t.id}
              type="button"
              role="tab"
              aria-selected={tab === t.id}
              className={`cm-dual-picker__tab${tab === t.id ? ' is-active' : ''}`}
              onClick={() => setTab(t.id)}
            >
              {t.label}
            </button>
          ))}
        </div>
        <button type="button" className="cm-dual-picker__close" onClick={onClose} aria-label="Close picker">
          <FiX size={16} />
        </button>
      </div>

      {tab === 'emoji' ? (
        <div className="cm-dual-picker__panel" role="tabpanel">
          <EmojiPicker
            width={300}
            height={340}
            onSelect={(emoji) => {
              onSelectEmoji(emoji);
              onClose();
            }}
          />
        </div>
      ) : (
        <div className="cm-dual-picker__panel cm-dual-picker__panel--working" role="tabpanel">
          <WorkingStickerPicker
            onSelect={(sticker) => {
              onSelectWorking(sticker);
              onClose();
            }}
          />
        </div>
      )}
    </div>
  );
}
