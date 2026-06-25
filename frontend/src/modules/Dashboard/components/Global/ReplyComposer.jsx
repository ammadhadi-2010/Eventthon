import React, { useMemo, useState } from 'react';

import { FiSmile } from 'react-icons/fi';

import EmojiPicker from './EmojiPicker';



const ReplyComposer = ({

  value,

  onChange,

  onSubmit,

  placeholder = 'Write a reply...',

  avatarText = 'Y',

  avatarSlot = null,

  variant = 'light',

  onEmojiClick,

}) => {

  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

  const isDark = variant === 'dark';



  const merged = useMemo(

    () => ({

      wrapper: { ...styles.wrapper },

      inputWrap: {

        ...styles.inputWrap,

        ...(isDark

          ? {

              border: '1px solid rgba(255, 255, 255, 0.14)',

              background: 'rgba(0, 0, 0, 0.32)',

            }

          : {}),

      },

      input: {

        ...styles.input,

        ...(isDark ? { color: '#f1f5f9' } : {}),

      },

      emojiColor: isDark ? '#94a3b8' : '#6b7280',

      replyBtn: {

        ...styles.replyBtn,

        ...(isDark ? { background: '#2563eb', boxShadow: '0 4px 14px rgba(37, 99, 235, 0.35)' } : {}),

      },

    }),

    [isDark],

  );



  return (

    <div style={merged.wrapper}>

      {avatarSlot ? (

        <div style={styles.avatarWrap}>{avatarSlot}</div>

      ) : (

        <div style={{ ...styles.avatar, ...(isDark ? styles.avatarDark : {}) }}>{avatarText}</div>

      )}

      <div style={merged.inputWrap}>

        <input

          value={value}

          onChange={(e) => onChange(e.target.value)}

          placeholder={placeholder}

          style={merged.input}

          onKeyDown={(e) => e.key === 'Enter' && onSubmit()}

        />

        <button

          type="button"

          style={styles.iconBtn}

          onClick={() => setShowEmojiPicker((prev) => !prev)}

          title="Add emoji"

          aria-label="Open emoji picker"

        >

          <FiSmile size={16} color={merged.emojiColor} />

        </button>

        {showEmojiPicker ? (

          <div style={styles.pickerPop}>

            <EmojiPicker

              onSelect={(emoji) => {

                onEmojiClick?.(emoji);

                setShowEmojiPicker(false);

              }}

              width={300}

              height={360}

            />

          </div>

        ) : null}

      </div>

      <button type="button" style={merged.replyBtn} onClick={onSubmit} disabled={!value.trim()}>

        Reply

      </button>

    </div>

  );

};



const styles = {

  wrapper: { display: 'flex', alignItems: 'center', gap: '8px' },

  avatarWrap: {

    flexShrink: 0,

    display: 'flex',

    alignItems: 'center',

    justifyContent: 'center',

  },

  avatar: {

    width: '30px',

    height: '30px',

    borderRadius: '50%',

    background: '#334155',

    color: '#e2e8f0',

    display: 'flex',

    alignItems: 'center',

    justifyContent: 'center',

    fontSize: '12px',

    fontWeight: 700,

    flexShrink: 0,

  },

  avatarDark: {

    background: 'linear-gradient(135deg, #3b82f6, #6366f1)',

    border: '2px solid rgba(99, 102, 241, 0.45)',

  },

  inputWrap: {

    position: 'relative',

    flex: 1,

    display: 'flex',

    alignItems: 'center',

    border: '1px solid #d1d5db',

    borderRadius: '999px',

    background: '#fff',

    padding: '0 8px 0 12px',

  },

  pickerPop: {

    position: 'absolute',

    bottom: '45px',

    right: '-6px',

    zIndex: 20,

  },

  input: {

    flex: 1,

    border: 'none',

    outline: 'none',

    fontSize: '14px',

    color: '#111827',

    background: 'transparent',

    minHeight: '38px',

  },

  iconBtn: {

    border: 'none',

    background: 'transparent',

    cursor: 'pointer',

    display: 'flex',

    alignItems: 'center',

    padding: '4px',

  },

  replyBtn: {

    background: '#0a66c2',

    color: '#fff',

    border: 'none',

    borderRadius: '999px',

    padding: '8px 16px',

    fontSize: '14px',

    fontWeight: 600,

    cursor: 'pointer',

    flexShrink: 0,

  },

};



export default ReplyComposer;


