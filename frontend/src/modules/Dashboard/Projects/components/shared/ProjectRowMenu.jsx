import React, { useCallback, useEffect, useId, useRef, useState } from 'react';
import { FiMoreHorizontal } from 'react-icons/fi';

function useClickOutside(ref, handler) {
  useEffect(() => {
    const onDoc = (e) => {
      if (ref.current && !ref.current.contains(e.target)) handler();
    };
    document.addEventListener('mousedown', onDoc);
    return () => document.removeEventListener('mousedown', onDoc);
  }, [ref, handler]);
}

export default function ProjectRowMenu({
  label = 'Project options',
  items,
  disabled = false,
}) {
  const [open, setOpen] = useState(false);
  const wrapRef = useRef(null);
  const menuId = useId();
  const close = useCallback(() => setOpen(false), []);

  useClickOutside(wrapRef, close);

  const onPick = (item) => {
    close();
    item.onClick?.();
  };

  return (
    <div className="ph-row-menu" ref={wrapRef}>
      <button
        type="button"
        className="ph-icon-btn ph-row-menu__trigger"
        aria-label={label}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={menuId}
        disabled={disabled}
        onClick={() => setOpen((v) => !v)}
      >
        <FiMoreHorizontal size={16} aria-hidden />
      </button>
      {open && items.length > 0 ? (
        <ul id={menuId} className="ph-row-menu__dropdown" role="menu">
          {items.map((item) => (
            <li key={item.id} role="none">
              <button
                type="button"
                role="menuitem"
                className={`ph-row-menu__item${item.danger ? ' is-danger' : ''}`}
                onClick={() => onPick(item)}
              >
                {item.label}
              </button>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
