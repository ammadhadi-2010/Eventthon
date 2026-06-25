import React from 'react';
import { FiPlus, FiTrash2 } from 'react-icons/fi';

export default function EditableStringList({ label, items, onChange, onAdd, onRemove, placeholder }) {
  return (
    <div className="cp-list-field">
      <div className="cp-list-field__head">
        <span className="cp-field__label">{label}</span>
        <button type="button" className="cp-list-add" onClick={() => onAdd()}>
          <FiPlus size={14} aria-hidden />
          Add
        </button>
      </div>
      <ul className="cp-list-field__items">
        {items.map((item, index) => (
          <li key={`${label}-${index}`}>
            <input
              type="text"
              className="cp-input"
              value={item}
              placeholder={placeholder}
              onChange={(e) => onChange(index, e.target.value)}
            />
            <button
              type="button"
              className="cp-list-remove"
              onClick={() => onRemove(index)}
              aria-label={`Remove ${label} item`}
            >
              <FiTrash2 size={14} />
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
