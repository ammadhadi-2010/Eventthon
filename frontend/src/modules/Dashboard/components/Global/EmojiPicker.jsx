import React from 'react';
import Picker from 'emoji-picker-react';

const EmojiPicker = ({ onSelect, width = 340, height = 420 }) => {
  return (
    <div style={pickerWrap}>
      <Picker
        width={width}
        height={height}
        lazyLoadEmojis
        searchDisabled={false}
        skinTonesDisabled={false}
        previewConfig={{ showPreview: false }}
        onEmojiClick={(emojiData) => onSelect?.(emojiData?.emoji || '')}
      />
    </div>
  );
};

const pickerWrap = {
  borderRadius: '10px',
  overflow: 'hidden',
  boxShadow: '0 14px 35px rgba(2, 6, 23, 0.55)',
};

export default EmojiPicker;