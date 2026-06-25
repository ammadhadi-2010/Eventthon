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

export default function ActivityFilterDropdown({
  icon: Icon,
  value,
  options,
  onChange,
  ariaLabel,
}) {
  const [open, setOpen] = useState(false);
  const wrapRef = useRef(null);
  const listId = useId();
  const close = useCallback(() => setOpen(false), []);

  useClickOutside(wrapRef, close);

  const selected = options.find((opt) => opt.id === value) || options[0];

  const pick = (id) => {
    onChange(id);
    close();
  };

  return (
    <div className={`ph-act-filter${open ? ' is-open' : ''}`} ref={wrapRef}>
      <button
        type="button"
        className="ph-act-filter__trigger"
        aria-label={ariaLabel}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={listId}
        onClick={() => setOpen((v) => !v)}
      >
        {Icon ? <Icon size={14} className="ph-act-filter__ico" aria-hidden /> : null}
        <span className="ph-act-filter__label">{selected?.label}</span>
        <FiChevronDown size={14} className="ph-act-filter__chev" aria-hidden />
      </button>
      {open ? (
        <ul id={listId} className="ph-act-filter__menu" role="listbox" aria-label={ariaLabel}>
          {options.map((opt) => (
            <li key={opt.id} role="none">
              <button
                type="button"
                role="option"
                aria-selected={value === opt.id}
                className={`ph-act-filter__option${value === opt.id ? ' is-active' : ''}`}
                onClick={() => pick(opt.id)}
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
