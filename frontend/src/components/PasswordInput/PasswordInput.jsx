import React, { useState } from 'react';
import { FiEye, FiEyeOff } from 'react-icons/fi';
import './password-input.css';

export default function PasswordInput({
  id,
  value,
  onChange,
  placeholder,
  disabled = false,
  autoComplete = 'current-password',
  className = '',
  wrapperClassName = '',
  style,
  required,
  minLength,
  name,
}) {
  const [visible, setVisible] = useState(false);

  return (
    <div className={`password-field ${wrapperClassName}`.trim()}>
      <input
        id={id}
        name={name}
        type={visible ? 'text' : 'password'}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        disabled={disabled}
        autoComplete={autoComplete}
        className={className}
        style={style}
        required={required}
        minLength={minLength}
      />
      <button
        type="button"
        className="password-field__toggle"
        onClick={() => setVisible((prev) => !prev)}
        disabled={disabled}
        aria-label={visible ? 'Hide password' : 'Show password'}
        tabIndex={-1}
      >
        {visible ? <FiEyeOff size={17} aria-hidden /> : <FiEye size={17} aria-hidden />}
      </button>
    </div>
  );
}
