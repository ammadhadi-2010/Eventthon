import React, { useMemo, useState } from 'react';
import { STICKER_CATEGORIES, WORKING_STICKERS, getStickersByCategory } from './workingCommentStickers';
import { BusinessIcon } from '../../../../components/lottie';

export default function WorkingStickerPicker({ onSelect }) {
  const [category, setCategory] = useState('tech');
  const stickers = useMemo(() => getStickersByCategory(category), [category]);

  return (
    <div className="cm-sticker-picker">
      <p className="cm-sticker-picker__hint">
        Choose a professional sticker ({WORKING_STICKERS.length} assets)
      </p>
      <div className="cm-sticker-picker__cats" role="tablist" aria-label="Sticker categories">
        {STICKER_CATEGORIES.map((cat) => (
          <button
            key={cat.id}
            type="button"
            role="tab"
            aria-selected={category === cat.id}
            className={`cm-sticker-picker__cat${category === cat.id ? ' is-active' : ''}`}
            onClick={() => setCategory(cat.id)}
          >
            {cat.label}
          </button>
        ))}
      </div>
      <div className="cm-sticker-picker__scroll" role="tabpanel">
        <div className="cm-sticker-picker__grid">
          {stickers.map((sticker) => (
            <button
              key={sticker.id}
              type="button"
              className="cm-sticker-picker__cell"
              title={sticker.label}
              onClick={() => onSelect(sticker)}
            >
              <span className="cm-sticker-picker__icon-wrap">
                <BusinessIcon src={sticker.src} size={40} label={sticker.label} loop />
              </span>
              <span className="cm-sticker-picker__label">{sticker.label}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
