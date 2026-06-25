import { useEffect, useRef, useState } from 'react';

const DEFAULT_MENU = { open: false, x: 0, y: 0, messageId: '', isOwn: false };

export default function useSquadMessageMenu() {
  const [menuState, setMenuState] = useState(DEFAULT_MENU);
  const [emojiPickerFor, setEmojiPickerFor] = useState('');
  const [emojiAnchor, setEmojiAnchor] = useState({ x: 0, y: 0 });
  const menuRef = useRef(null);
  const pickerRef = useRef(null);

  const closeMenu = () => {
    setMenuState(DEFAULT_MENU);
    setEmojiPickerFor('');
  };

  const openMessageMenuAt = (event, messageId, isOwn = false) => {
    event.preventDefault();
    event.stopPropagation();
    const menuWidth = 190;
    const menuHeight = isOwn ? 200 : 160;
    const pad = 10;
    const x = Math.min(Math.max(pad, event.clientX), window.innerWidth - menuWidth - pad);
    const hasBottomSpace = window.innerHeight - event.clientY > menuHeight;
    const y = hasBottomSpace ? event.clientY : Math.max(pad, event.clientY - menuHeight);
    setMenuState({ open: true, x, y, messageId, isOwn });
    setEmojiPickerFor('');
  };

  useEffect(() => {
    if (!menuState.open && !emojiPickerFor) return undefined;
    const onPointerDown = (event) => {
      if (menuRef.current?.contains(event.target)) return;
      if (pickerRef.current?.contains(event.target)) return;
      closeMenu();
    };
    const onKeyDown = (event) => {
      if (event.key === 'Escape') closeMenu();
    };
    document.addEventListener('mousedown', onPointerDown);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('mousedown', onPointerDown);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [menuState.open, emojiPickerFor]);

  return {
    menuState,
    setMenuState,
    emojiPickerFor,
    setEmojiPickerFor,
    emojiAnchor,
    setEmojiAnchor,
    menuRef,
    pickerRef,
    openMessageMenuAt,
    closeMenu,
  };
}
