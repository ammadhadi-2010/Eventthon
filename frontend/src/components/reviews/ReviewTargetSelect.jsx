import React, { useCallback, useEffect, useId, useRef, useState } from 'react';
import { FiChevronDown } from 'react-icons/fi';

function useClickOutside(ref, handler) {
  useEffect(() => {
    const onDoc = (e) => {
      if (ref.current && !ref.current.contains(e.target)) handler();
    };
    document.addEventListener('mousedown', onDoc);
    return () => document.removeEventListener('mousedown', onDoc);
  }, [ref, handler]);
}

export default function ReviewTargetSelect({ value, options, onChange, ariaLabel }) {
  const [open, setOpen] = useState(false);
  const wrapRef = useRef(null);
  const listId = useId();
  const close = useCallback(() => setOpen(false), []);

  useClickOutside(wrapRef, close);

  const selected = options.find((opt) => opt.id === value) || options[0];

  return (
    <div className={`wr-target-select${open ? ' is-open' : ''}`} ref={wrapRef}>
      <button
        type="button"
        className="wr-target-select__trigger"
        aria-label={ariaLabel}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={listId}
        onClick={() => setOpen((v) => !v)}
      >
        <span>{selected?.label}</span>
        <FiChevronDown size={14} aria-hidden />
      </button>
      {open ? (
        <ul id={listId} className="wr-target-select__menu" role="listbox" aria-label={ariaLabel}>
          {options.map((opt) => (
            <li key={opt.id || 'placeholder'} role="none">
              <button
                type="button"
                role="option"
                aria-selected={value === opt.id}
                className={`wr-target-select__option${value === opt.id ? ' is-active' : ''}`}
                onClick={() => {
                  onChange(opt.id);
                  close();
                }}
              >
                {opt.label}
              </button>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
